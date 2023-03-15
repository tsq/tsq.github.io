---
title: Ubuntu 20.04 上安装Redis
date: 2020-10-03
tags:
 - Ubuntu
 - Redis
categories: 
 - Linux
---

[Redis](https://redis.io)是由意大利程序员[Salvatore Sanfilippo](https://github.com/antirez)编写的一款key-value数据库，因为读取速度特别快，所以常常被用于缓存数据库。最近自己在写一个项目，项目的数据库使用的是Mysql，为了降低Mysql的读取次数，我决定将一些Mysql读操作的结果缓存至Redis，这样一来，就需要准备一台Redis服务器。因为我使用的是阿里云，所以可以直接购买阿里云提供的[云数据库Redis](https://helpcdn.aliyun.com/product/26340.html)。但是鉴于我的这个项目对Redis的各项性能要求并不高以及节省成本的考虑，我决定直接购买一台ECS并在上面自建Redis。因为我选择的ECS是Ubuntu 20.04，所以这篇文章就介绍一下如何在Ubuntu 20.04上安装Redis。
<!-- more -->

## 第一步：安装Redis

在Ubuntu 20.04上安装Redis很简单，我们首先对包管理工具apt进行一次更新，更新完毕后就可以直接安装redis-server这个软件包，两条命令如下：

```sh
apt update
apt install redis-server -y
```

命令执行完毕后，其实redis就安装好了，它正在以守护进程的形式运行在后台。

为了验证Redis是否安装成功，我们可以使用`redis-cli`命令进入交互模式，并输入`ping`命令，如果返回值是`pong`，那么就代表安装成功。最后使用`exit`退出当前交互。

```sh
➜  ~ redis-cli
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> exit
➜  ~
```

## 第二步：管理Redis

Redis安装完毕后，有时候我们需要查看Redis目前的运行状态或者对Redis做重启等操作，这时候就要用到`systemctl`这个工具。例如下面的命令，我们使用`systemctl status redis-server`这条命令就可以输出当前Redis的运行状态，如果看到`running`就代表Redis目前一切运行正常。

```sh
➜  ~ systemctl status redis-server
● redis-server.service - Advanced key-value store
     Loaded: loaded (/lib/systemd/system/redis-server.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2020-10-26 00:34:25 CST; 2min 4s ago
       Docs: http://redis.io/documentation,
             man:redis-server(1)
   Main PID: 7099 (redis-server)
      Tasks: 4 (limit: 2194)
     Memory: 2.8M
     CGroup: /system.slice/redis-server.service
             └─7099 /usr/bin/redis-server 127.0.0.1:6379

Oct 26 00:34:25 iZ8vb8fa17pr9s3louozngZ systemd[1]: Starting Advanced key-value store...
Oct 26 00:34:25 iZ8vb8fa17pr9s3louozngZ systemd[1]: redis-server.service: Can't open PID file /run/redis/redis-server.pid >
Oct 26 00:34:25 iZ8vb8fa17pr9s3louozngZ systemd[1]: Started Advanced key-value store.
lines 1-14/14 (END)
```

除了status，另外的常用命令还有 `systemctl stop redis-server` 和 `systemctl restart redis-server`，它们分别用于停止Redis服务和重启Redis服务。

## 第三步：修改Redis配置

我们常常需要对Redis的默认配置进行一些修改，比如说更改绑定IP或者为Redis添加密码认证等等，这时候就需要我们去手动修改Redis的配置文件，修改完毕后还需要重启Redis。

对于刚刚的Redis安装，生成的Redis配置文件路径是：`/etc/redis/redis.conf`，我们可以直接使用vim去编辑它。
```sh
vim /etc/redis/redis.conf
```

因为我的这台Redis服务器需要被内网其它多台服务器访问，而Redis默认只对`127.0.0.1`开放，所以我需要对Redis的绑定IP进行修改。如下面所示，定位到bind那一行，我将配置文件中的绑定IP修改成了`0.0.0.0`，这样内网的其它服务器就都可以访问这台Redis服务器了。

```sh
bind 0.0.0.0
```

::: danger
因为后面我会取消这台Redis服务器的公网IP，让它只存在于内网环境，所以就有了一层天然的防火墙，设置成0.0.0.0并不影响安全性。如果你的Redis是暴露在公网上面，那0.0.0.0是不推荐的，推荐的做法是开启密码认证+绑定一个白名单IP
:::

配置文件修改完毕后，需要对其进行一次重启，我们还是使用systemctl这个工具，如下所示：

```sh
systemctl restart redis-server
```

重启完毕后，我们可以使用`netstat`命令来查看一下Redis绑定的IP地址以及端口号：

```sh
➜  ~ netstat -lnp | grep redis
tcp        0      0 127.0.0.1:6379          0.0.0.0:*               LISTEN      7600/redis-server 1
tcp6       0      0 ::1:6379                :::*                    LISTEN      7600/redis-server 1
```

从上面的输出我们可以看到Redis的绑定IP已经变成了 `0.0.0.0`并监听在默认端口6379。

::: tip
对于Redis配置文件的修改，另外一个常用的修改是开启密码认证，在redis.conf文件中我们可以直接定位到 # requirepass foobared 的地方，取消对这一行的注释并将foobared换成自己想要的密码。修改完毕后，使用systemctl重启Redis即可。
:::

## 总结

在Ubuntu 20.04上安装Redis其实非常的简单，如果你不需要修改绑定IP或者开启密码认证，那么直接使用`apt install redis-server -y`这一条命令就可以了。

本文介绍了在Ubuntu 20.04上自建Redis的方法，不过如果你对Redis性能、安全或者数据备份等方面要求比较高，建议你还是直接购买云服务厂商提供的Redis服务，虽然会贵很多，但是相较于自建带来的后续种种维护操作，我想这种购买一定物有所值。