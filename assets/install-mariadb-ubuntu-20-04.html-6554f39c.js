import{_ as i,p as t,q as o,s as n,R as s,t as l,w as r,Y as a,n as c}from"./framework-aa5c4115.js";const d={},p={href:"https://mariadb.org/",target:"_blank",rel:"noopener noreferrer"},u=a(`<p>接下来，我们来看每一步的具体操作。</p><h2 id="第一步-安装mariadb" tabindex="-1"><a class="header-anchor" href="#第一步-安装mariadb" aria-hidden="true">#</a> 第一步：安装MariaDB</h2><p>首先我们需要对apt进行更新，更新完成后，我们就可以使用它来安装一个叫 “mariadb-server“的软件包：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">apt</span> update
<span class="token function">apt</span> <span class="token function">install</span> mariadb-server <span class="token parameter variable">-y</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>安装完成后，MariaDB会以守护进程的形式跑在后台并占用3306端口。我们可以使用<code>systemctl</code>来查看一下它的运行状态：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>systemctl status mariadb.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果看到输出结果包含<code>active (running)</code>，那就代表安装完成并运行正常。</p><p>同时，我们也可以使用<code>mysql -V</code>命令来查看MariaDB的版本信息。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>~ mysql <span class="token parameter variable">-V</span>
mysql  Ver <span class="token number">15.1</span> Distrib <span class="token number">10.3</span>.22-MariaDB, <span class="token keyword">for</span> debian-linux-gnu <span class="token punctuation">(</span>x86_64<span class="token punctuation">)</span> using readline <span class="token number">5.2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="第二步-安全配置" tabindex="-1"><a class="header-anchor" href="#第二步-安全配置" aria-hidden="true">#</a> 第二步：安全配置</h2><p>完成第一步的安装后，我们就有了一个密码为空的root用户，如下所示，我们可以输入命令 <code>mysql -u root</code>以root的身份通过命令行登录MariaDB，完成登录后再使用<code>show databases;</code>查看所有数据库名称。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>~ mysql <span class="token parameter variable">-u</span> root
Welcome to the MariaDB monitor.  Commands end with <span class="token punctuation">;</span> or <span class="token punctuation">\\</span>g.
Your MariaDB connection <span class="token function">id</span> is <span class="token number">47</span>
Server version: <span class="token number">10.3</span>.22-MariaDB-1ubuntu1 Ubuntu <span class="token number">20.04</span>

Copyright <span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token number">2000</span>, <span class="token number">2018</span>, Oracle, MariaDB Corporation Ab and others.

Type <span class="token string">&#39;help;&#39;</span> or <span class="token string">&#39;\\h&#39;</span> <span class="token keyword">for</span> help. Type <span class="token string">&#39;\\c&#39;</span> to <span class="token function">clear</span> the current input statement.

MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span> show databases<span class="token punctuation">;</span>
+--------------------+
<span class="token operator">|</span> Database           <span class="token operator">|</span>
+--------------------+
<span class="token operator">|</span> information_schema <span class="token operator">|</span>
<span class="token operator">|</span> mysql              <span class="token operator">|</span>
<span class="token operator">|</span> performance_schema <span class="token operator">|</span>
+--------------------+
<span class="token number">3</span> rows <span class="token keyword">in</span> <span class="token builtin class-name">set</span> <span class="token punctuation">(</span><span class="token number">0.000</span> sec<span class="token punctuation">)</span>

MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用无密码的root是一种不安全的行为，所以接下来我们来看一下如何为root添加访问密码，我们首先使用<code>exit</code>来退出刚刚的命令行交互：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span> <span class="token builtin class-name">exit</span>
Bye
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>然后输入命令：<code>mysql_secure_installation</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>~ mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE<span class="token operator">!</span>  PLEASE READ EACH STEP CAREFULLY<span class="token operator">!</span>

In order to log into MariaDB to secure it, we<span class="token string">&#39;ll need the current
password for the root user.  If you&#39;</span>ve just installed MariaDB, and
you haven&#39;t <span class="token builtin class-name">set</span> the root password yet, the password will be blank,
so you should just press enter here.

Enter current password <span class="token keyword">for</span> root <span class="token punctuation">(</span>enter <span class="token keyword">for</span> none<span class="token punctuation">)</span>:
OK, successfully used password, moving on<span class="token punctuation">..</span>.

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

Set root password? <span class="token punctuation">[</span>Y/n<span class="token punctuation">]</span> Y
New password:
Re-enter new password:
Password updated successfully<span class="token operator">!</span>
Reloading privilege tables<span class="token punctuation">..</span>
 <span class="token punctuation">..</span>. Success<span class="token operator">!</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这条命令输入后，首先会让我们输入root原密码，因为原密码为空，所以直接回车就行，接着会让我们输入root新密码两次，再接着会有一些选项需要回答，它们分别是：是否移除匿名用户；使用允许root远程登录；是否移除测试数据库；是否重新加载表权限。你可以根据自己的需要回答，如下所示我这里全部选择了“Y”。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created <span class="token keyword">for</span>
them.  This is intended only <span class="token keyword">for</span> testing, and to <span class="token function">make</span> the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? <span class="token punctuation">[</span>Y/n<span class="token punctuation">]</span> Y
 <span class="token punctuation">..</span>. Success<span class="token operator">!</span>

Normally, root should only be allowed to connect from <span class="token string">&#39;localhost&#39;</span><span class="token builtin class-name">.</span>  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? <span class="token punctuation">[</span>Y/n<span class="token punctuation">]</span> Y
 <span class="token punctuation">..</span>. Success<span class="token operator">!</span>

By default, MariaDB comes with a database named <span class="token string">&#39;test&#39;</span> that anyone can
access.  This is also intended only <span class="token keyword">for</span> testing, and should be removed
before moving into a production environment.

Remove <span class="token builtin class-name">test</span> database and access to it? <span class="token punctuation">[</span>Y/n<span class="token punctuation">]</span> Y
 - Dropping <span class="token builtin class-name">test</span> database<span class="token punctuation">..</span>.
 <span class="token punctuation">..</span>. Success<span class="token operator">!</span>
 - Removing privileges on <span class="token builtin class-name">test</span> database<span class="token punctuation">..</span>.
 <span class="token punctuation">..</span>. Success<span class="token operator">!</span>

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? <span class="token punctuation">[</span>Y/n<span class="token punctuation">]</span> Y
 <span class="token punctuation">..</span>. Success<span class="token operator">!</span>

Cleaning up<span class="token punctuation">..</span>.

All done<span class="token operator">!</span>  If you&#39;ve completed all of the above steps, your MariaDB
installation should now be secure.

Thanks <span class="token keyword">for</span> using MariaDB<span class="token operator">!</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,18),v=n("div",{class:"custom-container tip"},[n("svg",{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},[n("g",{fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[n("circle",{cx:"12",cy:"12",r:"9"}),n("path",{d:"M12 8h.01"}),n("path",{d:"M11 12h1v4h1"})])]),n("p",{class:"custom-container-title"},"TIP"),n("p",null,"刚刚创建的密码是root的密码，这十分的重要，最好找个安全的地方将它记录下来，以免日后忘记！")],-1),m=a(`<h2 id="第三步-创建新用户和数据库" tabindex="-1"><a class="header-anchor" href="#第三步-创建新用户和数据库" aria-hidden="true">#</a> 第三步：创建新用户和数据库</h2><p>因为root拥有最高权限，所以为了安全起见，对于一般性的数据库访问，我们应该使用一个非root用户来操作。接下来，我们就使用root创建一个新的数据库和用户，并将新的数据库授权给新的用户。如下所示，我们首先使用 <code>mysql -u root -p</code>命令登录MariaDB并创建一个叫”demo”的数据库。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>~ mysql <span class="token parameter variable">-u</span> root <span class="token parameter variable">-p</span>
Enter password:
Welcome to the MariaDB monitor.  Commands end with <span class="token punctuation">;</span> or <span class="token punctuation">\\</span>g.
Your MariaDB connection <span class="token function">id</span> is <span class="token number">56</span>
Server version: <span class="token number">10.3</span>.22-MariaDB-1ubuntu1 Ubuntu <span class="token number">20.04</span>

Copyright <span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token number">2000</span>, <span class="token number">2018</span>, Oracle, MariaDB Corporation Ab and others.

Type <span class="token string">&#39;help;&#39;</span> or <span class="token string">&#39;\\h&#39;</span> <span class="token keyword">for</span> help. Type <span class="token string">&#39;\\c&#39;</span> to <span class="token function">clear</span> the current input statement.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接着使用<code>create database</code>语句创建demo数据库:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span> create database demo<span class="token punctuation">;</span>
Query OK, <span class="token number">1</span> row affected <span class="token punctuation">(</span><span class="token number">0.000</span> sec<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>再接着我们使用<code>create user</code>语句新建一个叫”foo”用户，其密码为“abcd1234”：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span> create user <span class="token string">&quot;foo&quot;</span> identified by <span class="token string">&quot;abcd1234&quot;</span><span class="token punctuation">;</span>
Query OK, <span class="token number">0</span> rows affected <span class="token punctuation">(</span><span class="token number">0.000</span> sec<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>再接着，我们使用<code>grant</code>语句将新建的demo数据库授权给foo用户，完成后使用<code>exit</code>退出命令行交互:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span> grant all privileges on demo.* to <span class="token string">&quot;foo&quot;</span><span class="token punctuation">;</span>
Query OK, <span class="token number">0</span> rows affected <span class="token punctuation">(</span><span class="token number">0.000</span> sec<span class="token punctuation">)</span>

MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span> <span class="token builtin class-name">exit</span>
Bye
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="第四步-校验新用户" tabindex="-1"><a class="header-anchor" href="#第四步-校验新用户" aria-hidden="true">#</a> 第四步：校验新用户</h2><p>最后一步需要校验一下用户foo是否有数据库demo的访问权限。我们首先使用mysql命令登录MariaDB，不过这一次的-u参数我们将它指定为foo，如果一切正常，输入密码abcd1234后，我们就能完成登录。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>~ mysql <span class="token parameter variable">-u</span> foo <span class="token parameter variable">-p</span>
Enter password:
Welcome to the MariaDB monitor.  Commands end with <span class="token punctuation">;</span> or <span class="token punctuation">\\</span>g.
Your MariaDB connection <span class="token function">id</span> is <span class="token number">57</span>
Server version: <span class="token number">10.3</span>.22-MariaDB-1ubuntu1 Ubuntu <span class="token number">20.04</span>

Copyright <span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token number">2000</span>, <span class="token number">2018</span>, Oracle, MariaDB Corporation Ab and others.

Type <span class="token string">&#39;help;&#39;</span> or <span class="token string">&#39;\\h&#39;</span> <span class="token keyword">for</span> help. Type <span class="token string">&#39;\\c&#39;</span> to <span class="token function">clear</span> the current input statement.

MariaDB <span class="token punctuation">[</span><span class="token punctuation">(</span>none<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，通过显示所有数据库名称、转换到demo数据库、在demo数据库新建user表、往user表插入一条数据、查询user表等一系列操作来校验一下foo用户对demo数据库是否有访问权限，如果一切正常，将看到下面的结果。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>MariaDB [(none)]&gt; show databases;
+--------------------+
| Database           |
+--------------------+
| demo               |
| information_schema |
+--------------------+
2 rows in set (0.000 sec)

MariaDB [(none)]&gt; use demo;
Database changed
MariaDB [demo]&gt; create table user (name varchar(50));
Query OK, 0 rows affected (0.010 sec)

MariaDB [demo]&gt; desc user;
+-------+-------------+------+-----+---------+-------+
| Field | Type        | Null | Key | Default | Extra |
+-------+-------------+------+-----+---------+-------+
| name  | varchar(50) | YES  |     | NULL    |       |
+-------+-------------+------+-----+---------+-------+
1 row in set (0.001 sec)

MariaDB [demo]&gt; insert into user (name) values (&quot;tom&quot;);
Query OK, 1 row affected (0.002 sec)

MariaDB [demo]&gt; select * from user;
+------+
| name |
+------+
| tom  |
+------+
1 row in set (0.000 sec)

MariaDB [demo]&gt; exit
Bye
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>至此，我们就完成了新用户的校验工作，以后在利用这台MariaDB服务器时，如果是使用代码来访问，那么数据库名就可以填：<code>demo</code>；用户名填：<code>foo</code>；用户密码填：<code>abcd1234</code>。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>MariaDB的安装很简单，就一条命令：<code>apt install mariadb-server -y</code> 。如果你的项目对安全性要求不高，说真的，为了简单，到这一步就可以了，后面的三步可以无视，你可以直接使用密码为空的root来做所有操作。但是，如果你不能保证ssh登录的安全性，一旦黑客攻破了这台服务器，那就歇菜了，因为没有密码一切数据一览无余。对于安全性要求高的项目，我们最好还是按照上面的第二步和第三步，修改root密码以及使用新建的用户来操作数据库。</p>`,17);function b(k,h){const e=c("ExternalLinkIcon");return t(),o("div",null,[n("p",null,[n("a",p,[s("MariaDB"),l(e)]),s("是一款优秀的开源关系型数据库，除了性能优越它还向后兼容Mysql。如果你有考虑在云服务器上自建Mysql，那么使用MariaDB也是一个不错的选择。这篇文章我就和你分享一下如何在Ubuntu 20.04上安装并配置MariaDB。 我将以一台新购的阿里云Ubuntu 20.04为例分四步来完成。首先是使用apt快速安装MariaDB，安装完成之后，会对MariaDB做一些安全方面的配置，其中最重要的就是要为root配置新密码，完成安全配置后，我们会使用root新建一个用户和数据库，并将新数据库授权给新用户，最后会以新用户的身份登录MariaDB并校验是否有该数据库的访问权限。")]),r(" more "),u,v,m])}const f=i(d,[["render",b],["__file","install-mariadb-ubuntu-20-04.html.vue"]]);export{f as default};
