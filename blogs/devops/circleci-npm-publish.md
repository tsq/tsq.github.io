---
title: 利用CircleCI自动发布npm包
date: 2021-02-14
tags:
 - CircleCI
 - Npm
categories: 
 - Devops
publish: false
---

如果要发布一个npm包，我们可以选择手动的方式进行操作，通常的操作步骤是先在本地使用`npm publish`将包发布到npm中，接着在本地新建一个tag并提交到远程，例如`git tag v1.0.1 && git push orgin v1.0.1`。手动的方式虽然可以实现npm包的发布，但是，如果我们需要经常更新包的版本，与其每次都做一些重复的手动操作，我们其实是可以利用第三方CI/CD平台自动帮我们完成这些操作，这样不仅可以帮我们省掉手动操作带来的耗时，同时我们可以加上自动化测试环节，只有测试通过了，再进行发布操作，从而提高包的质量。这篇文章，我就通过一个小的demo来演示一下如何利用[CircleCI](https://circleci.com/)完成npm包的自动发布。

<!-- more -->

为了学习，我将准备这样一个演示项目：首先这个项目是使用Github进行托管，main分支为默认分支，当我们往main分支提交代码时，会首先触发CircleCI对main分支的代码进行测试，测试如果通过，CircleCI会将当前代码发不到npm，最后CircleCI会根据`package.json`中的`version`字段，往Github提交一个新的tag。

可以看到，测试、npm发布、git tag创建全都由CircleCI自动化完成，无需人工介入。好的，下面我们就来看下具体如何实现的吧！

## 第一步：准备演示项目

我在Github上创建了一个简单的演示项目：[https://github.com/tsq-blog/circleci-npm-publish](https://github.com/tsq-blog/circleci-npm-publish)

::: warning
你需要在package.json中更换name字段，因为这个包名已经被我这个项目占用了。
:::

这个项目的`index.js`中只暴露出了一个简单的加法函数，用于返回两个数的和，而在`test.js`我对这个这个加法函数进行了简单的测试。我们可以通过执行`npm test`查看测试结果。这样我们就有了包以及对应的测试代码。

而在CircleCI的配置文件`.circleci/config.yml`，我是这样写的：

```yml
version: 2.1
orbs:
  node: circleci/node@1.1
  npm-publisher: uraway/npm-publisher@0.2.0
jobs:
  test:
    executor:
      name: node/default
      tag: "14.15"
    steps:
      - checkout
      - run: npm test
workflows:
  test_and_npm_publish_and_git_tag_push:
    jobs:
      - test:
          filters:
            branches:
              only: main
      - npm-publisher/publish-from-package-version:
          requires:
            - test
          filters:
            branches:
              only: main
          ssh-fingerprints: b9:c4:aa:e9:10:4a:16:ca:ef:19:dd:b8:2e:00:4e:fa
          publish-token-variable: NPM_TOKEN
          push-git-tag: true
```

这里，利用了两个orbs，一个提供nodejs环境用于完成测试，一个提供npm包的发布功能以及创建git tag功能。

在`test_and_npm_publish_and_git_tag_push`下的`job`可以看到有两个任务，分别是`test`和`npm-publisher/publish-from-package-version`，我对它们都进行了过滤，只有来自main分支的提交才会触发测试和npm包的发布操作，
另外后者的执行依赖于前者，也就是只有当测试通过了才会执行包的发布和git tag的创建。

关于提供npm包发布功能的`npm-publisher`这个orb，可以通过官方文档：[https://circleci.com/developer/orbs/orb/uraway/npm-publisher](https://circleci.com/developer/orbs/orb/uraway/npm-publisher)了解更多信息。

对于这份配置，我们需要关注以下两个配置项：

```yml
ssh-fingerprints: b9:c4:aa:e9:10:4a:16:ca:ef:19:dd:b8:2e:00:4e:fa
publish-token-variable: NPM_TOKEN
```

首先`publish-token-variable: NPM_TOKEN`这个配置的意思是，我们需要在CircleCI中为这个项目添加一个环境变量，名叫`NPM_TOKEN`，这个token的值，在第二步我们可以了解到，它是通过npm官网生成，通过这个token，CircleCI就可以利用`npm-publisher`这个orb，完成与npm的认证，从而完成包的发布工作。

另一个`ssh-fingerprints: b9:c4:aa:e9:10:4a:16:ca:ef:19:dd:b8:2e:00:4e:fa`这里`b9:c4:aa:e9:10:4a:16:ca:ef:19:dd:b8:2e:00:4e:fa`这个值，在第三步我们可以了解到，我们在CircleCI中为这个项目生成了一个`User key`，这样CircleCI就可以完成与Github之间的认证，当npm包发布完毕后，`npm-publisher`这个orb会接着往Github提交一个新的git tag。

下面我们就来分别看下，如何获取`NPM_TOKEN`和`ssh-fingerprints`的值。

## 第二步：获取npm token

为了获取`NPM_TOKEN`这个环境变量的值，我们需要前往npm官网: [https://www.npmjs.com/](https://www.npmjs.com/) ，
使用自己的账号登录后，点击个人头像，就可以看到菜单项`Access Tokens`，如下图：
![](/imgs/devops/circleci-npm-publish/1.png)

点击后，就会进入token的创建页面，点击按钮`Generate New Token`，需要注意的是，创建时，在类型弹出框中，我们需要选择`Publish`，这样，这个token才会具有发布包的权限，如下图：

![](/imgs/devops/circleci-npm-publish/2.png)

完成后就可以看到生成的token，我们将它手动复制，如下图：

![](/imgs/devops/circleci-npm-publish/3.png)


接下来就需要回到CircleCI中为这个项目新增一个环境变量了，环境变量的Name就是`NPM_TOKEN`, Value就是刚刚复制的值：

![](/imgs/devops/circleci-npm-publish/4.png)

至此`NPM_TOKEN`的配置就完成了。


## 第三步：配置git tag的创建

这一步，我们来配置`ssh-fingerprints`以允许CircleCI往Github提交新的tag。

在CircleCI中，打开项目的设置页，点击`SSH Keys`，在`User Key`的区域，点击按钮`Add User Key`，如下图：

![](/imgs/devops/circleci-npm-publish/5.png)

这时可以看到，这个User Key的fingerprint值，一串冒号分割的16进制值，如下图：

![](/imgs/devops/circleci-npm-publish/6.png)



::: tip
CircleCI要想往Github提交一个tag，必须要完成ssh的认证工作，CircleCI为此采取的方式是，ssh的公钥和私钥由CircleCI自动生成，公钥，CircleCI会将它上传至Github，而私钥由CircleCI自己保存。

因为私钥很重要，不能泄露，因此我们在config.yml中的`ssh-fingerprints`不能直接明文填写私钥的值，转而填写一段刚刚看到的一串冒号分割的16进制值，这样CircleCI在执行过程中，它可以通过这串值找到真正对应的私钥，从而达到隐藏私钥的目的。
:::

最后，将这串值复制并添加到`ssh-fingerprints`配置项。

## 第四步：测试

完成了`NPM_TOKEN`和`ssh-fingerprints`值的配置，准备工作就都做完了，为了测试，我们可以往main分支做一次提交，之后就可以在CircleCI中看到执行结果，我的这次提交可以查看这里:

 [https://app.circleci.com/pipelines/github/tsq-blog/circleci-npm-publish/3/workflows/33e3a04f-21bd-41f2-b67a-ad2b08913fce](https://app.circleci.com/pipelines/github/tsq-blog/circleci-npm-publish/3/workflows/33e3a04f-21bd-41f2-b67a-ad2b08913fce).

![](/imgs/devops/circleci-npm-publish/7.png)

 可以看到，执行成功，接着可以回到npm中找到这个包，校验下新版本有没有被发布成功：

![](/imgs/devops/circleci-npm-publish/8.png)


 最后回到Github上，校验下git tag有没有创建成功：

![](/imgs/devops/circleci-npm-publish/9.png)


## 总结

在这篇文章中，我们利用CircleCI实现了代码的测试，到npm包的发布，再到git tag的创建，全程都由CircleCI自动化完成，如果你想创建一个高质量的npm包，我想这个工作流程一定会给你带来很大的帮助！

