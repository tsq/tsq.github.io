---
title: 在CircleCI中使用SSH登录到远程服务器进行自动化部署
date: 2021-01-24
tags:
 - CircleCI
 - Linux
categories: 
 - Devops
---

[CircleCI](https://circleci.com/)是一个非常好用的持续集成平台，我们可以通过它来完成应用的测试、打包和自动化部署。关于自动化部署，其实有很多方案可以选择，比如，通过CircleCI可以将应用部署到AWS的ECS、AWS的S3、Google的GKE、Github的Pages等。除了这些，还有一个更加灵活的方案，就是我们可以在CircleCI中使用ssh登录到自己的服务器中，并通过执行相应的自动化部署脚本，从而达到应用的自动化部署。因为我已经遇到过好几个项目都在使用ssh的方式进行自动化部署，所以这篇文章就来分享下其中的关键点和一些注意事项。

<!-- more -->

为了学习，我将准备这样一个演示项目，首先这个项目是使用Github进行托管，main分支为默认分支，当我们往main分支提交代码时，会首先触发CircleCI对main分支的代码进行测试工作，如果测试通过，接着CircleCI会通过ssh登录到我们的部署服务器中，进入到部署服务器后，首先会进入项目根目录，接着会拉取main分支的最新代码，最后会运行重新部署的命令。

好的，下面我将通过四个具体的步骤来详细讲解。

## 第一步：准备演示项目

首先我们需要有一个演示项目，并且我们要知道在自动化部署它之前，我们要如何对它进行手动部署。

我这里已经事先准备了一个演示项目：[https://github.com/tsq-blog/circleci-ssh-deploy](https://github.com/tsq-blog/circleci-ssh-deploy)

这是一个简单的Node.js服务器，一旦启动就会在8088端口监听http请求，并对所有的请求都返回一个数字。虽然是Node.js项目，不过在部署时，我故意使用了docker-compose的方式，这样即使是用其它语言来开发，部署流程也完全一样，不一样的只是源代码和Dockerfile而已。

因为这个项目使用了docker-compose来部署，所以部署会变得非常简单，我们只需要进入项目根目录，然后运行命令：

```sh
git pull
docker-compose up --build -d
```

即可，这样首先会获取最新源码，接着，docker-compose会使用当前的源代码，重新进行构建并最终保持在后台运行。

所以手动部署，可以简单的概括为，进入项目根目录、获取最新源码、运行`docker-compose up --build -d`这三个步骤。

理解完手动部署的过程后，接下来我们来准备一台真实的服务器。

## 第二步：准备服务器

这一步，我将以一台阿里云的Ubuntu20.04为例，演示如何搭建满足上述需求的环境。

首先需要注意的一点是，因为后续我们需要使用ssh的方式登录到远程服务器，而ssh登录方式有多种，我将使用密钥对的方式进行登录，所以在阿里云上创建服务器是，一定要像下图，勾选使用密钥对，这个密钥对我们需要将它下载到本地以备后用。

![](/imgs/devops/circleci-ssh-deploy/1.png)

我这里下载后的密钥对命名为了`my.pem`，购买后的服务器获取的公网IP是`8.130.49.249`，所以在密钥对所在目录下，执行以下命令就可以登录到远程服务器了：

```
chmod 400 my.pem                # 修改pem文件的权限，ssh不允许pem文件的权限过大，所以这里使用400
ssh -i my.pem root@8.130.49.249 # 采用密钥对的方式登录
```

进入服务器后，我们首先需要安装git：

```sh
apt update              # 初次使用需要对apt做更新
apt install git -y      # 使用apt安装git
```

接下来我们需要分别安装docker和docker-compose，关于它们的安装，可以参考我之前的文章：[使用阿里云ECS搭建Docker部署环境](https://tsq.me/blogs/aliyun/setup-docker-deployment-env-for-aliyun-ecs.html)。

完成安装后，我们需要校验下安装是否成功:

```sh
root@iZ0jl34snwu9foovmkf4m0Z:~# docker --version
Docker version 20.10.2, build 2291f61
root@iZ0jl34snwu9foovmkf4m0Z:~# docker-compose --version
docker-compose version 1.28.0, build d02a7b1a
```

如果能够打印出它们的版本号，就代表安装成功了。


至此，git、docker、docker-compose都已经准备好了，接下来，我们使用git把项目克隆到我们的根目录下：

```sh
git clone https://github.com/tsq-blog/circleci-ssh-deploy.git
pwd
/root/circleci-ssh-deploy
```

::: tip
为了让大家都能访问这个项目，我将它设为了公有，所以我这里可以使用了http协议进行克隆，真实的项目应该使用私有仓库，并使用ssh的方式进行克隆。
::: 

这样，服务器端的配置就都好了，就等着后面CircleCI远程登录进来，并执行第一步中所说的三个步骤即可。

## 第三步：配置CircleCI

CircleCI方面，有两个方面需要注意一下，首先我们来理解下，放在`.circleci/config.yml`文件的内容：


```yml
version: 2.1
orbs:
  node: circleci/node@1.1
jobs:
  build:
    executor:
      name: node/default
      tag: '10.4'
    steps:
      - checkout
      - node/with-cache:
          steps:
            - run: npm install
      - run: npm run test
      - run: |
          echo ${MY_PEM} | tr '|' '\012' > ~/.ssh/my.pem
          chmod 400 ~/.ssh/my.pem
          ssh -i ~/.ssh/my.pem -o StrictHostKeyChecking=no root@8.130.49.249 "cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d"
```

这个配置文件，可以简单的理解为，CircleCI将使用一个服务器来执行任务，这个服务器首先安装有10.4版本的Node.js，具体的执行任务分别是：

**从Github上获取最新的代码**
```sh
checkout
```

checkout是CircleCI内建的命令，专门用于从Github上拉取最新的源代码。

**运行测试**

```sh
npm run test
```

我这里准备的测试很简单，直接输出“hello world”，所以测试会百分之百成功。


**ssh远程登录并部署**

因为，测试已经通过了，所以我们就可以开始部署工作了。


```sh
      - run: |
          echo ${MY_PEM} | tr '|' '\012' > ~/.ssh/my.pem
          chmod 400 ~/.ssh/my.pem
          ssh -i ~/.ssh/my.pem -o StrictHostKeyChecking=no root@8.130.49.249 "cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d"
```

`run`下面有三条命令，我们来一条条看一下：

**第一条** `echo ${MY_PEM} | tr '|' '\012' > ~/.ssh/my.pem`

要想从CircleCI中登录到远程服务器，CircleCI就必须首先有pem文件，怎么才能有像第二步中的my.pem文件呢？一开始确实没有，不过我们可以生成一个，我们可以将my.pem在本地电脑中打开，将它的内容复制，并在CircleCI的项目设置页中，新建一个环境变量，变量的Name，我这里叫"MY_PEM"，Value就是刚刚复制的内容，然后保存。如下图所示，我们需要事先新建这个环境变量。

![](/imgs/devops/circleci-ssh-deploy/2.png)

不过在Value的值一定要注意下，非常的关键。这里有个问题，这个问题现在有，以后可能会被CircleCI团队优化，问题就是，如果我们直接将复制的内容粘贴到Value输入框中的话，**这个输入框不会保留原始pem文件中的换行符，所以会导致最终保存的Value是非法的密钥对值**。因为有这个问题，所以我这里采取的方案是，将my.pem中的每一行的最后（除最后一行）末尾手动加上一个`|`字符，这也是`echo ${MY_PEM} | tr '|' '\012' > ~/.ssh/my.pem`这么写的原因，echo会首先读取环境变量，输出这个Value，紧接着使用Linux的`tr`命令，将`|`字符全部替换成`\012`，而`\012`就是原来pem文件中的换行符，最后使用`> ~/.ssh/my.pem`将tr替换后的内容写到`my.pem`这个文件中。

为了填写Value，我是这样做的，首先在文本编辑器比如VS Code中，粘贴本地的pem内容：

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAyDWuka2bnJDhfrQlVvkExsf+djRZe2y2hVSpU1ClSV8kIhpd
xkQZfd+4XFIhhElC9QLMT64XfAM9dZWe6yW6KPym5iNIZjg7Q9RydUvwrRWYZydM
K2n61TqDRVbpNF4PYNKSez3zSDYHyrErt1K1MpDMRrc7/iUylDP/xXd8mUuWLSlX
FuIXXO44rQJdt1OGorHtqTTMMLPAymkafTOug2aC7kRM5oTBGWmA1RlJ+orxScfx
VvTnAoxqGk9BR/qOR6bnqABcjRxsnRU5aTJh9nj+8HjQ4XqJ0FLTEoFHv42R/cjd
sDrMtAbp2/fGc8ZlmdXRISDjd8OQ5PBtq3dyjQIDAQABAoIBAQCrlD3wQQ1cR1nJ
AVAC0lSCmwD7gm+xdACUEXMvoKyWTcAkrd3xvYjvNBzGmeh5e2OzoFtCahtcP1ab
f8d7FJEO8T+DeXdhiw1XWylgVt2DKD+9H5OKnT/HH2dCtHIVXArn2m6IyhXFq/BP
iDjD2lDJbghzDjOO4YgQNOQc8gLJR9aigxvHIZhNTv2lUqHcps9X1Lg89QaM8UXo
vIdGSCGhKYChkgEv6s5cC2rO8bomTmPVgryDsNQiz6NSZW1simsPm1ERABvlD63J
dST/Z2lxkpk4I5NT12ifYw1C/kc4kX9JOtIE3Adhg1lSlsJ2QihjhCcTHj9V3jxF
dPDxcXyhAoGBAOwA5UYQUZ4ZW+dZryDGkJlaBm5MqTXG/I24q2a95dg3fhLuXZZN
FT0d5xwj3e998dJzAi5Tw1d0Cxz5uIEUpFh8mgVoPOasEOnydDzn+e+xUqOOXqci
Pre7ys1kQd2ooZo8l8l/1gzT0hkH2lHE9XvbZwFBNnUXEsKzuCiUV3OlAoGBANks
Y97zS8YHu5mEqN91jRVRgxvX+Fkj0cvMdkYQgMFBZYhgHiA/46JFYuvH13W+Tu8P
/bO0a7LmqZDnkvIXsEvV5YpmvPhpB73cUgor9OpuxfX24XpI8hjxwC/84BLi+JEX
buEvvdWiGtTSWJ95KTnUU7dxS9Q3bwA/5nA1Di7JAoGBAKFvo2Yf95SsSB+jS5ah
/XvJBykgK4drzIqtTiIDuFwE6arNfxs3M1YRRGwNZN1US7znixBhn/gMmyWA9OLn
Wdxlr34PZcls3k0J2tVm4aNCqwLSepDdbgWE4h9Je3zCw3icBkCBv8wagVc59e+F
SV8mH/nNwBCsbdrd0RWBE6k5AoGBAK003y5Y4s09K50kFb+rNGuVSDjzxenqTI/7
MTVuQhJgAweCiWR1MCsipeOgzjHlJ3U5TsF9mwvjNcgRObyFsiC5psn8aKjCs970
EiZ0qnAzCwXB8lEiTpwga4SabWgCx/aINvG4rvHsyPOGFBKUgpHRyzcaUD0gPRJ4
5GQHnJkpAoGAR5fC3BeVkQExjG3pZwym9ZSAtHA9xpKw0mE9JedeYpCaSbaYTQqx
Z9IIvXr+VjmQe6v0j2dWtgl+lHVkfWlLTXPhceTWBH2fEbk3pWiM6Yc1yNSefzTQ
El4OtjS+pIwkmS/KsKPlSIz6oiJYvKLzSUZqZ6BuOcHF0+MXO6kE6oE=
-----END RSA PRIVATE KEY-----
```

接着除最后一行，其它行末尾都加上`|`


```
-----BEGIN RSA PRIVATE KEY-----|
MIIEpQIBAAKCAQEAyDWuka2bnJDhfrQlVvkExsf+djRZe2y2hVSpU1ClSV8kIhpd|
xkQZfd+4XFIhhElC9QLMT64XfAM9dZWe6yW6KPym5iNIZjg7Q9RydUvwrRWYZydM|
K2n61TqDRVbpNF4PYNKSez3zSDYHyrErt1K1MpDMRrc7/iUylDP/xXd8mUuWLSlX|
FuIXXO44rQJdt1OGorHtqTTMMLPAymkafTOug2aC7kRM5oTBGWmA1RlJ+orxScfx|
VvTnAoxqGk9BR/qOR6bnqABcjRxsnRU5aTJh9nj+8HjQ4XqJ0FLTEoFHv42R/cjd|
sDrMtAbp2/fGc8ZlmdXRISDjd8OQ5PBtq3dyjQIDAQABAoIBAQCrlD3wQQ1cR1nJ|
AVAC0lSCmwD7gm+xdACUEXMvoKyWTcAkrd3xvYjvNBzGmeh5e2OzoFtCahtcP1ab|
f8d7FJEO8T+DeXdhiw1XWylgVt2DKD+9H5OKnT/HH2dCtHIVXArn2m6IyhXFq/BP|
iDjD2lDJbghzDjOO4YgQNOQc8gLJR9aigxvHIZhNTv2lUqHcps9X1Lg89QaM8UXo|
vIdGSCGhKYChkgEv6s5cC2rO8bomTmPVgryDsNQiz6NSZW1simsPm1ERABvlD63J|
dST/Z2lxkpk4I5NT12ifYw1C/kc4kX9JOtIE3Adhg1lSlsJ2QihjhCcTHj9V3jxF|
dPDxcXyhAoGBAOwA5UYQUZ4ZW+dZryDGkJlaBm5MqTXG/I24q2a95dg3fhLuXZZN|
FT0d5xwj3e998dJzAi5Tw1d0Cxz5uIEUpFh8mgVoPOasEOnydDzn+e+xUqOOXqci|
Pre7ys1kQd2ooZo8l8l/1gzT0hkH2lHE9XvbZwFBNnUXEsKzuCiUV3OlAoGBANks|
Y97zS8YHu5mEqN91jRVRgxvX+Fkj0cvMdkYQgMFBZYhgHiA/46JFYuvH13W+Tu8P|
/bO0a7LmqZDnkvIXsEvV5YpmvPhpB73cUgor9OpuxfX24XpI8hjxwC/84BLi+JEX|
buEvvdWiGtTSWJ95KTnUU7dxS9Q3bwA/5nA1Di7JAoGBAKFvo2Yf95SsSB+jS5ah|
/XvJBykgK4drzIqtTiIDuFwE6arNfxs3M1YRRGwNZN1US7znixBhn/gMmyWA9OLn|
Wdxlr34PZcls3k0J2tVm4aNCqwLSepDdbgWE4h9Je3zCw3icBkCBv8wagVc59e+F|
SV8mH/nNwBCsbdrd0RWBE6k5AoGBAK003y5Y4s09K50kFb+rNGuVSDjzxenqTI/7|
MTVuQhJgAweCiWR1MCsipeOgzjHlJ3U5TsF9mwvjNcgRObyFsiC5psn8aKjCs970|
EiZ0qnAzCwXB8lEiTpwga4SabWgCx/aINvG4rvHsyPOGFBKUgpHRyzcaUD0gPRJ4|
5GQHnJkpAoGAR5fC3BeVkQExjG3pZwym9ZSAtHA9xpKw0mE9JedeYpCaSbaYTQqx|
Z9IIvXr+VjmQe6v0j2dWtgl+lHVkfWlLTXPhceTWBH2fEbk3pWiM6Yc1yNSefzTQ|
El4OtjS+pIwkmS/KsKPlSIz6oiJYvKLzSUZqZ6BuOcHF0+MXO6kE6oE=|
-----END RSA PRIVATE KEY-----
```

再将加了`|`的pem内容复制并粘贴到Value输入框中，但是又有个问题，仔细观察你会发现，粘贴后，`|`字符的后面多出了一个空格，这个空格是不能有的，否则pem文件的内容就不正确了。

![](/imgs/devops/circleci-ssh-deploy/3.png)


所以我们可以再将这个含有空格的pem内容，复制粘贴到本地的编辑器：

```
-----BEGIN RSA PRIVATE KEY-----| MIIEpQIBAAKCAQEAyDWuka2bnJDhfrQlVvkExsf+djRZe2y2hVSpU1ClSV8kIhpd| xkQZfd+4XFIhhElC9QLMT64XfAM9dZWe6yW6KPym5iNIZjg7Q9RydUvwrRWYZydM| K2n61TqDRVbpNF4PYNKSez3zSDYHyrErt1K1MpDMRrc7/iUylDP/xXd8mUuWLSlX| FuIXXO44rQJdt1OGorHtqTTMMLPAymkafTOug2aC7kRM5oTBGWmA1RlJ+orxScfx| VvTnAoxqGk9BR/qOR6bnqABcjRxsnRU5aTJh9nj+8HjQ4XqJ0FLTEoFHv42R/cjd| sDrMtAbp2/fGc8ZlmdXRISDjd8OQ5PBtq3dyjQIDAQABAoIBAQCrlD3wQQ1cR1nJ| AVAC0lSCmwD7gm+xdACUEXMvoKyWTcAkrd3xvYjvNBzGmeh5e2OzoFtCahtcP1ab| f8d7FJEO8T+DeXdhiw1XWylgVt2DKD+9H5OKnT/HH2dCtHIVXArn2m6IyhXFq/BP| iDjD2lDJbghzDjOO4YgQNOQc8gLJR9aigxvHIZhNTv2lUqHcps9X1Lg89QaM8UXo| vIdGSCGhKYChkgEv6s5cC2rO8bomTmPVgryDsNQiz6NSZW1simsPm1ERABvlD63J| dST/Z2lxkpk4I5NT12ifYw1C/kc4kX9JOtIE3Adhg1lSlsJ2QihjhCcTHj9V3jxF| dPDxcXyhAoGBAOwA5UYQUZ4ZW+dZryDGkJlaBm5MqTXG/I24q2a95dg3fhLuXZZN| FT0d5xwj3e998dJzAi5Tw1d0Cxz5uIEUpFh8mgVoPOasEOnydDzn+e+xUqOOXqci| Pre7ys1kQd2ooZo8l8l/1gzT0hkH2lHE9XvbZwFBNnUXEsKzuCiUV3OlAoGBANks| Y97zS8YHu5mEqN91jRVRgxvX+Fkj0cvMdkYQgMFBZYhgHiA/46JFYuvH13W+Tu8P| /bO0a7LmqZDnkvIXsEvV5YpmvPhpB73cUgor9OpuxfX24XpI8hjxwC/84BLi+JEX| buEvvdWiGtTSWJ95KTnUU7dxS9Q3bwA/5nA1Di7JAoGBAKFvo2Yf95SsSB+jS5ah| /XvJBykgK4drzIqtTiIDuFwE6arNfxs3M1YRRGwNZN1US7znixBhn/gMmyWA9OLn| Wdxlr34PZcls3k0J2tVm4aNCqwLSepDdbgWE4h9Je3zCw3icBkCBv8wagVc59e+F| SV8mH/nNwBCsbdrd0RWBE6k5AoGBAK003y5Y4s09K50kFb+rNGuVSDjzxenqTI/7| MTVuQhJgAweCiWR1MCsipeOgzjHlJ3U5TsF9mwvjNcgRObyFsiC5psn8aKjCs970| EiZ0qnAzCwXB8lEiTpwga4SabWgCx/aINvG4rvHsyPOGFBKUgpHRyzcaUD0gPRJ4| 5GQHnJkpAoGAR5fC3BeVkQExjG3pZwym9ZSAtHA9xpKw0mE9JedeYpCaSbaYTQqx| Z9IIvXr+VjmQe6v0j2dWtgl+lHVkfWlLTXPhceTWBH2fEbk3pWiM6Yc1yNSefzTQ| El4OtjS+pIwkmS/KsKPlSIz6oiJYvKLzSUZqZ6BuOcHF0+MXO6kE6oE=| -----END RSA PRIVATE KEY-----
```

接着将所有的"| "替换成"|"，最终如下：

```
-----BEGIN RSA PRIVATE KEY-----|MIIEpQIBAAKCAQEAyDWuka2bnJDhfrQlVvkExsf+djRZe2y2hVSpU1ClSV8kIhpd|xkQZfd+4XFIhhElC9QLMT64XfAM9dZWe6yW6KPym5iNIZjg7Q9RydUvwrRWYZydM|K2n61TqDRVbpNF4PYNKSez3zSDYHyrErt1K1MpDMRrc7/iUylDP/xXd8mUuWLSlX|FuIXXO44rQJdt1OGorHtqTTMMLPAymkafTOug2aC7kRM5oTBGWmA1RlJ+orxScfx|VvTnAoxqGk9BR/qOR6bnqABcjRxsnRU5aTJh9nj+8HjQ4XqJ0FLTEoFHv42R/cjd|sDrMtAbp2/fGc8ZlmdXRISDjd8OQ5PBtq3dyjQIDAQABAoIBAQCrlD3wQQ1cR1nJ|AVAC0lSCmwD7gm+xdACUEXMvoKyWTcAkrd3xvYjvNBzGmeh5e2OzoFtCahtcP1ab|f8d7FJEO8T+DeXdhiw1XWylgVt2DKD+9H5OKnT/HH2dCtHIVXArn2m6IyhXFq/BP|iDjD2lDJbghzDjOO4YgQNOQc8gLJR9aigxvHIZhNTv2lUqHcps9X1Lg89QaM8UXo|vIdGSCGhKYChkgEv6s5cC2rO8bomTmPVgryDsNQiz6NSZW1simsPm1ERABvlD63J|dST/Z2lxkpk4I5NT12ifYw1C/kc4kX9JOtIE3Adhg1lSlsJ2QihjhCcTHj9V3jxF|dPDxcXyhAoGBAOwA5UYQUZ4ZW+dZryDGkJlaBm5MqTXG/I24q2a95dg3fhLuXZZN|FT0d5xwj3e998dJzAi5Tw1d0Cxz5uIEUpFh8mgVoPOasEOnydDzn+e+xUqOOXqci|Pre7ys1kQd2ooZo8l8l/1gzT0hkH2lHE9XvbZwFBNnUXEsKzuCiUV3OlAoGBANks|Y97zS8YHu5mEqN91jRVRgxvX+Fkj0cvMdkYQgMFBZYhgHiA/46JFYuvH13W+Tu8P|/bO0a7LmqZDnkvIXsEvV5YpmvPhpB73cUgor9OpuxfX24XpI8hjxwC/84BLi+JEX|buEvvdWiGtTSWJ95KTnUU7dxS9Q3bwA/5nA1Di7JAoGBAKFvo2Yf95SsSB+jS5ah|/XvJBykgK4drzIqtTiIDuFwE6arNfxs3M1YRRGwNZN1US7znixBhn/gMmyWA9OLn|Wdxlr34PZcls3k0J2tVm4aNCqwLSepDdbgWE4h9Je3zCw3icBkCBv8wagVc59e+F|SV8mH/nNwBCsbdrd0RWBE6k5AoGBAK003y5Y4s09K50kFb+rNGuVSDjzxenqTI/7|MTVuQhJgAweCiWR1MCsipeOgzjHlJ3U5TsF9mwvjNcgRObyFsiC5psn8aKjCs970|EiZ0qnAzCwXB8lEiTpwga4SabWgCx/aINvG4rvHsyPOGFBKUgpHRyzcaUD0gPRJ4|5GQHnJkpAoGAR5fC3BeVkQExjG3pZwym9ZSAtHA9xpKw0mE9JedeYpCaSbaYTQqx|Z9IIvXr+VjmQe6v0j2dWtgl+lHVkfWlLTXPhceTWBH2fEbk3pWiM6Yc1yNSefzTQ|El4OtjS+pIwkmS/KsKPlSIz6oiJYvKLzSUZqZ6BuOcHF0+MXO6kE6oE=|-----END RSA PRIVATE KEY-----
```

这样Value的值就准备好了，这里的所有`|`字符，后面都会被替换成换行符。

:::tip
关于多出的空格问题，我没有细调查原因，如果你在粘贴的时候，没有的话，那么上面一步就可以不用做了。
:::

好的，我们来看run中的第二条命令:

**第二条**  `chmod 400 ~/.ssh/my.pem`

它很简单，就是给生成的pem文件加上合适的权限。

**第三条** `ssh -i ~/.ssh/my.pem -o StrictHostKeyChecking=no root@8.130.49.249 "cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d"`

因为有了pem文件，我们就可以在CircleCI的这台服务器上使用`ssh -i ~/.ssh/my.pem root@8.130.49.249`来登录我们服务器了，而之所以用了`-o StrictHostKeyChecking=no`选项，是为了防止登录过程中出现让我们选择是否确认要连接时，会弹出的选项“yes/no”，它会阻塞ssh后续命令的执行，所以加了这个选项后，就不会出现阻塞的过程。

这一条命令的最后，用双引号括起来的部分`"cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d"`就是部署命令，可以看到它很简单：

```sh
cd /root/circleci-ssh-deploy      # 进入项目根目录
git pull                          # 从Github拉取最新的源代码
docker-compose up --build -d      # 使用docker-compose重新构建并部署
```

所以CircleCI方面我们首先需要确保`.circleci/config.yml`文件编写的正确，其次是在CircleCI的设置页配上正确的环境变量。

## 第四步：校验部署是否成功

服务器端和CircleCI都准备了，这时候我们就可以校验下，CircleCI是否能够通过ssh登录到我们的服务器并完成部署。

为了校验，我们可以将circleci-ssh-deploy这个项目的内容做一些更改并提交，比如将“app.js”第六行改为“res.end('10');”，这样如果部署成功，在我们的服务器上访问`http://localhost:8088`，就会一直返回`10`了。

```sh
root@iZ0jl34snwu9foovmkf4m0Z:~# curl localhost:8088
10root@iZ0jl34snwu9foovmkf4m0Z:~#
```

上面出现了`10`，代表我们的服务已经成功的被重新部署了。

与此同时，我们也可以进入CircleCI中看到所有的日志:

![](/imgs/devops/circleci-ssh-deploy/4.png)

## 总结

在这篇文章中，我们通过四步完成了如何在CircleCI上通过ssh远程登录到我们服务器上，并完成自动化部署任务，整个实现思路其实很简单，就是在CircleCI的服务器上，获取到密钥的值，这样它就可以登录到我们的服务器。而为了获取到密钥的值，我们使用了CircleCI提供的环境变量功能，又因为环境变量的Value输入框目前还存在一些小问题，我们上面使用了一些小的Trick来做了应对。

好的，这篇文章就到这里，如果你还在每次手动登录到远程Linux服务器，并执行重复的部署命令，那么不妨试着利用下CircleCI！

