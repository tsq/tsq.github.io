---
title: 阿里云ECS上快速安装Docker
date: 2020-10-10
tags:
 - Aliyun-ECS
 - Docker
categories: 
 - Aliyun
---

现如今，在Linux上使用Docker来部署Web应用正在变得越来越流行。为了使用Docker来部署应用，我们首先需要安装Docker这个程序。对于Docker的安装，一般情况下我们可以参考Docker[官方文档](https://docs.docker.com/engine/install/)来一步步完成安装操作，而这篇文章我将与你分享是：如果我们使用的是阿里云ECS，那么我们可以只通过一条命令就能快速完成Docker的安装。

<!-- more -->

## 第一步：输入安装脚本

当我们登录到阿里云ECS后，为了安装Docker，我们可以直接输入以下命令：

```sh
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

这条命令执行后，会自动执行Docker的安装，整个过程一气呵成，不存在需要手动输入”y”或”n”等确认选项。


## 第二步：检查安装是否成功

第一步执行完毕后，为了检查Docker是否安装成功，我们可以输入 docker info 这条命令来查看Docker的相关信息，如果能够正确输出，那么就代表Docker已经安装成功了。

```sh
➜  ~ docker info
Client:
 Debug Mode: false

Server:
 Containers: 0
  Running: 0
  Paused: 0
  Stopped: 0
 Images: 0
 Server Version: 19.03.13
 Storage Driver: overlay2
  Backing Filesystem: extfs
  Supports d_type: true
  Native Overlay Diff: true
 Logging Driver: json-file
 Cgroup Driver: cgroupfs
 Plugins:
  Volume: local
  Network: bridge host ipvlan macvlan null overlay
  Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog
 Swarm: inactive
 Runtimes: runc
 Default Runtime: runc
 Init Binary: docker-init
 containerd version: 8fba4e9a7d01810a393d5d25a3621dc101981175
 runc version: dc9208a3303feef5b3839f4323d9beb36df0a9dd
 init version: fec3683
 Security Options:
  apparmor
  seccomp
   Profile: default
 Kernel Version: 5.4.0-47-generic
 Operating System: Ubuntu 20.04.1 LTS
 OSType: linux
 Architecture: x86_64
 CPUs: 2
 Total Memory: 1.84GiB
 Name: iZ8vb8fa17pr9s3louozngZ
 ID: G5YJ:K7DH:GKTI:ASTN:R2VO:TQ22:XROK:2TCI:CNRL:LNFA:AMWJ:5SBH
 Docker Root Dir: /var/lib/docker
 Debug Mode: false
 Registry: https://index.docker.io/v1/
 Labels:
 Experimental: false
 Insecure Registries:
  127.0.0.0/8
 Live Restore Enabled: false

WARNING: No swap limit support
➜  ~
```

## 总结

如果我们仔细观察刚刚的安装命令，可以发现，Docker的安装源使用的其实是阿里云提供的源，所以安装才会如此方便和快速。


::: tip
除了提供Docker源，阿里云在其它方面也为开发者提供了很多便利，我自己切身受益过的有Node.js的 [cnpm](https://developer.aliyun.com/mirror/NPM) 以及PHP的 [composer](https://developer.aliyun.com/composer)。
:::
