---
title: 使用阿里云ECS搭建Docker部署环境
date: 2020-10-17
tags:
 - Aliyun-ECS
 - Docker
categories: 
 - Aliyun
---

上一篇文章和大家分享了如何在阿里云ECS上快速安装Docker，这篇文章我们来继续深入一步，探讨一下：如何使用阿里云ECS快速的搭建Docker部署环境。Docker部署环境的搭建因人而异，没有什么统一的标准，这里呢，我将它简单的分成了三步。首先，我们需要在ECS上完成Docker的安装，其次，我们需要为Docker配置镜像加速器，Docker镜像的拉取默认是从 [docker hub](https://hub.docker.com/)中拉取，但对于我们大陆地区的用户来说，镜像的下载会变得非常慢，所以镜像加速器的配置也非常的重要。最后是安装docker-compose，使用docker-compose我们就可以通过一份配置文件来快速完成应用的部署或升级，所以这个工具也非常有必要。接下来，我们来看一下这三个方面分别该如何操作。
<!-- more -->

## 第一步：安装Docker

关于如何在阿里云上快速安装Docker，在上一篇文章中我做过详细介绍。其实很简单，就一条下面的命令：

```sh
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

## 第二步：配置镜像加速器

镜像加速器的配置有很多种方法，这里我选择使用阿里云提供的免费镜像加速器。阿里云为每位用户都分配了一个独立的加速器，为了查看自己的加速器，我们首先如下图所示，在阿里云控制台中，点击菜单栏图标，接着将鼠标移动到“产品与服务”，这样我们就能看到阿里云所有的产品，最后在显示的产品列表中我们点击“容器镜像服务”，这样页面就会跳转到“容器镜像服务”的控制台。

![](/imgs/aliyun/setup-docker-deployment-env-for-aliyun-ecs/1.png)

进入容器镜像服务控制台后，再点击左侧菜单栏中的最后一项“镜像加速器”，如下图，我们就能看到我们自己的加速器地址。在页面底部，针对不同的操作系统或Linux发行版，阿里云也列出了各自的配置镜像加速器的命令。

![](/imgs/aliyun/setup-docker-deployment-env-for-aliyun-ecs/2.png)

按照上方的文档，为了配置镜像加速器，在Linux上只要分别输入以下四条命令即可：

```sh
# 1、生成Docker配置目录
sudo mkdir -p /etc/docker

# 2、将我们自己的加速器地址写入Docker配置目录
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://1ht60q31.mirror.aliyuncs.com"]
}
EOF

# 3、重启systemctl
sudo systemctl daemon-reload

# 4、重启Docker
sudo systemctl restart docker
```

关于上面的命令，有两点需要注意下：一是，上面的镜像地址是我的地址，你需要替换成你自己的地址；二是，第二条tee命令一共有四行，需要整体复制，再整体粘贴。

四条命令过后，我们就完成了镜像加速器的配置，这样我们以后在拉取镜像时就会快很多。接下来，我们来完成最后一步：docker-compose的安装。

## 第三步：安装docker-compose

对于docker-compose的安装，我建议按照官方文档来做，我们首先打开链接：[https://docs.docker.com/compose/install](https://docs.docker.com/compose/install) ，然后如图所示，切换到“Linux”标签页，这样就会显示在Linux上安装docker-compose的四条命令。

![](/imgs/aliyun/setup-docker-deployment-env-for-aliyun-ecs/3.png)


我们按照上面的文档，分别输入以下四条命令：

```sh
# 1、安装docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 2、将docker-compose的权限修改为可执行
sudo chmod +x /usr/local/bin/docker-compose

# 3、添加软链接，确保docker-compose在path中
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 4、确认是否安装成功
docker-compose --version
```

如果最后一步的 `docker-compose --version` 显示成功，那么就代表docker-compose我们也安装好了。

到这里，我们就分别完成了Docker安装、镜像加速器配置以及docker-compose的安装。之后我们就可以happy的使用docker-compose来快速部署我们的应用了！

## 总结

在这篇文章中，我们通过三步完成了Docker部署环境的搭建，因为这里我们使用的是阿里云，所以第一步安装Docker和第二步配置镜像加速器都变得非常简单。如果你经常需要一台Linux服务器来部署Docker应用，我建议你在完成上面三步操作后，立刻在阿里云ECS控制台中对这台已经配置好的ECS做一次镜像，这样以后我们就可以利用这份镜像来快速创建已经搭建好环境的服务器了。
