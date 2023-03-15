---
title: 为GitHub Pages配置自定义域名及HTTPS
date: 2023-3-15
tags:
 - Https
 - Aliyun
 - Github
categories: 
 - Github
---

[Github Pages](https://pages.github.com)是由Github推出的免费静态文件托管服务，目前很多网站都是在使用它，比如说著名的： [http://getbootstrap.com](http://getbootstrap.com)和 [https://reactjs.org](https://reactjs.org)。为一个Github仓库开启Github Pages功能，会涉及Github Pages制定的一系列规范，例如：仓库类型、仓库名、分支名、文件夹名、CNAME文件、HTTPS等等。自己的体会是，要想完全弄明白其中的规则，还是要花很多时间去阅读相应的文档以及动手做实验才行。最近自己为某个项目配置了自定义域名并开启了HTTPS，遇到了一些坑，也积累了一些经验，所以这篇文章就来分享一下如何为一个Github仓库开启自定义域名并配置免费的HTTPS证书。

<!-- more -->

## 实验

既然是自定义域名，那么首先要准备一个域名才行，我将以自己在阿里云上购买的`tsq.me`域名的二级域名`foo.tsq.me`为例。如果你没有域名，同时也想做下面的实验，建议你前往阿里云花个几块钱买个新域名，有些域名，比如说以xyz结尾的，我记得最便宜一年只要5块钱。

接下来的实验，我们将首先在Github上新建一个仓库，名叫`foo`，并新建一个`index.html`来快速生成一个网站，之后我们将在阿里云域名解析后台新增解析，将它指向Github提供的四个IP地址，最后我们要回到仓库的设置页，进行配置并开启HTTPS，下面我们来看具体每一步的操作。

## 第一步：快速生成静态网站

如下图，我们首先利用Github创建一个仓库名叫`foo`，需要注意的是，仓库需要为**Public**才行。

![](/imgs/github/add-custom-domain-and-https-for-github-pages/1.png)

仓库创建完毕后，我们就回到了这个仓库位于Github的主页，我将直接在Github上创建两个文件，一个是`CNAME`，用于填写自定义域名，一个是`index.html`，用来模拟一个静态网站的首页。

首先如下图，点击`creating a new file`。
![](/imgs/github/add-custom-domain-and-https-for-github-pages/2.png)


接着，创建一个文件，名称叫`CNAME`，内容为`foo.tsq.me`（*修改为你自己的二级域名*），如下图：

![](/imgs/github/add-custom-domain-and-https-for-github-pages/3.png)

接着，如下图，点击`Create new file`按钮 。

![](/imgs/github/add-custom-domain-and-https-for-github-pages/4.png)

创建一个文件，名称叫`index.html`，内容为`hello world`，如下图：

![](/imgs/github/add-custom-domain-and-https-for-github-pages/5.png)

至此，demo项目创建完毕。

## 第二步：配置域名解析

接下来，我们来为这个foo项目配置自定义域名。我将利用二级域名： `foo.tsq.me`来做演示。我们回到阿里云域名解析控制台，为域名新增如下图所示的四条A记录解析：

![](/imgs/github/add-custom-domain-and-https-for-github-pages/6.png)


这四个IP的来源可以参考这篇官方文档： [https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site](https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site)。

```
185.199.108.153 
185.199.109.153 
185.199.110.153 
185.199.111.153
```

这样我们就完成了第二步。接来是最后一步，我们需要再次回到foo仓库位于Github的设置页。


## 第三步：配置自定义域名

点击，`Pages`菜单项，在`Branch`的地方，我们选择`main`分支，然后点击`Save`，如下图所示：

![](/imgs/github/add-custom-domain-and-https-for-github-pages/7.png)

保存之后，下面会显示我们在CNAME中填写的二级域名，并提示我们正在进行DNS校验（*如果你正确完成了第二步操作，页面也有可能会显示DNS解析未成功的消息，可以忽略这个消息。*）DNS校验完成之后，我们就来校验下解析是否成功。在浏览器中输入自己的二级域名，最终会出现`index.html`中的`hello world`（没出现的话，可以多刷新几次），如下图所示：

![](/imgs/github/add-custom-domain-and-https-for-github-pages/8.png)


最后，我们回到设置页，勾选`Enforce HTTPS`，这样我们的二级域名就支持https了，证书由Github免费提供并托管，如下图所示：

![](/imgs/github/add-custom-domain-and-https-for-github-pages/9.png)


至此，我们就完成了自定义域名以及HTTPS的配置。

## 总结

Github Pages是一个非常棒且免费的静态网站托管工具，在实验过程中，我们利用一个index.html快速生成了一个网站，并为其配置自定义域名及https。如果你对其中的规则感兴趣，可以参考这篇文档: [https://help.github.com/en/github/working-with-github-pages/about-github-pages](https://help.github.com/en/github/working-with-github-pages/about-github-pages)。
