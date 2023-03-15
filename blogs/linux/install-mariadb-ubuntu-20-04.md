---
title: Ubuntu 20.04 上安装MariaDB
date: 2020-09-26
tags:
 - Ubuntu
 - MariaDB
categories: 
 - Linux
---

[MariaDB](https://mariadb.org/)是一款优秀的开源关系型数据库，除了性能优越它还向后兼容Mysql。如果你有考虑在云服务器上自建Mysql，那么使用MariaDB也是一个不错的选择。这篇文章我就和你分享一下如何在Ubuntu 20.04上安装并配置MariaDB。
我将以一台新购的阿里云Ubuntu 20.04为例分四步来完成。首先是使用apt快速安装MariaDB，安装完成之后，会对MariaDB做一些安全方面的配置，其中最重要的就是要为root配置新密码，完成安全配置后，我们会使用root新建一个用户和数据库，并将新数据库授权给新用户，最后会以新用户的身份登录MariaDB并校验是否有该数据库的访问权限。

<!-- more -->

接下来，我们来看每一步的具体操作。

## 第一步：安装MariaDB

首先我们需要对apt进行更新，更新完成后，我们就可以使用它来安装一个叫 “mariadb-server“的软件包：

```sh
apt update
apt install mariadb-server -y
```

安装完成后，MariaDB会以守护进程的形式跑在后台并占用3306端口。我们可以使用`systemctl`来查看一下它的运行状态：

```sh
systemctl status mariadb.service
```

如果看到输出结果包含`active (running)`，那就代表安装完成并运行正常。

同时，我们也可以使用`mysql -V`命令来查看MariaDB的版本信息。

```sh
~ mysql -V
mysql  Ver 15.1 Distrib 10.3.22-MariaDB, for debian-linux-gnu (x86_64) using readline 5.2
```

## 第二步：安全配置

完成第一步的安装后，我们就有了一个密码为空的root用户，如下所示，我们可以输入命令 `mysql -u root`以root的身份通过命令行登录MariaDB，完成登录后再使用`show databases;`查看所有数据库名称。

```sh
~ mysql -u root
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 47
Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.000 sec)

MariaDB [(none)]>
```

使用无密码的root是一种不安全的行为，所以接下来我们来看一下如何为root添加访问密码，我们首先使用`exit`来退出刚刚的命令行交互：

```sh
MariaDB [(none)]> exit
Bye
```

然后输入命令：`mysql_secure_installation`

```sh
~ mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user.  If you've just installed MariaDB, and
you haven't set the root password yet, the password will be blank,
so you should just press enter here.

Enter current password for root (enter for none):
OK, successfully used password, moving on...

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

Set root password? [Y/n] Y
New password:
Re-enter new password:
Password updated successfully!
Reloading privilege tables..
 ... Success!
```

这条命令输入后，首先会让我们输入root原密码，因为原密码为空，所以直接回车就行，接着会让我们输入root新密码两次，再接着会有一些选项需要回答，它们分别是：是否移除匿名用户；使用允许root远程登录；是否移除测试数据库；是否重新加载表权限。你可以根据自己的需要回答，如下所示我这里全部选择了“Y”。

```sh
By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n] Y
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] Y
 ... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] Y
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] Y
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
```

::: tip
刚刚创建的密码是root的密码，这十分的重要，最好找个安全的地方将它记录下来，以免日后忘记！
:::

## 第三步：创建新用户和数据库

因为root拥有最高权限，所以为了安全起见，对于一般性的数据库访问，我们应该使用一个非root用户来操作。接下来，我们就使用root创建一个新的数据库和用户，并将新的数据库授权给新的用户。如下所示，我们首先使用 `mysql -u root -p`命令登录MariaDB并创建一个叫”demo”的数据库。

```sh
~ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 56
Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```

接着使用`create database`语句创建demo数据库:

```sh
MariaDB [(none)]> create database demo;
Query OK, 1 row affected (0.000 sec)
```

再接着我们使用`create user`语句新建一个叫”foo”用户，其密码为“abcd1234”：

```sh
MariaDB [(none)]> create user "foo" identified by "abcd1234";
Query OK, 0 rows affected (0.000 sec)
```

再接着，我们使用`grant`语句将新建的demo数据库授权给foo用户，完成后使用`exit`退出命令行交互:

```sh
MariaDB [(none)]> grant all privileges on demo.* to "foo";
Query OK, 0 rows affected (0.000 sec)

MariaDB [(none)]> exit
Bye
```

## 第四步：校验新用户

最后一步需要校验一下用户foo是否有数据库demo的访问权限。我们首先使用mysql命令登录MariaDB，不过这一次的-u参数我们将它指定为foo，如果一切正常，输入密码abcd1234后，我们就能完成登录。

```sh
~ mysql -u foo -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 57
Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

接下来，通过显示所有数据库名称、转换到demo数据库、在demo数据库新建user表、往user表插入一条数据、查询user表等一系列操作来校验一下foo用户对demo数据库是否有访问权限，如果一切正常，将看到下面的结果。

```
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| demo               |
| information_schema |
+--------------------+
2 rows in set (0.000 sec)

MariaDB [(none)]> use demo;
Database changed
MariaDB [demo]> create table user (name varchar(50));
Query OK, 0 rows affected (0.010 sec)

MariaDB [demo]> desc user;
+-------+-------------+------+-----+---------+-------+
| Field | Type        | Null | Key | Default | Extra |
+-------+-------------+------+-----+---------+-------+
| name  | varchar(50) | YES  |     | NULL    |       |
+-------+-------------+------+-----+---------+-------+
1 row in set (0.001 sec)

MariaDB [demo]> insert into user (name) values ("tom");
Query OK, 1 row affected (0.002 sec)

MariaDB [demo]> select * from user;
+------+
| name |
+------+
| tom  |
+------+
1 row in set (0.000 sec)

MariaDB [demo]> exit
Bye
```

至此，我们就完成了新用户的校验工作，以后在利用这台MariaDB服务器时，如果是使用代码来访问，那么数据库名就可以填：`demo`；用户名填：`foo`；用户密码填：`abcd1234`。

## 总结

MariaDB的安装很简单，就一条命令：`apt install mariadb-server -y` 。如果你的项目对安全性要求不高，说真的，为了简单，到这一步就可以了，后面的三步可以无视，你可以直接使用密码为空的root来做所有操作。但是，如果你不能保证ssh登录的安全性，一旦黑客攻破了这台服务器，那就歇菜了，因为没有密码一切数据一览无余。对于安全性要求高的项目，我们最好还是按照上面的第二步和第三步，修改root密码以及使用新建的用户来操作数据库。