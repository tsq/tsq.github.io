import{_ as l,p as c,q as d,s,R as e,t as i,w as o,Y as n,n as r}from"./framework-aa5c4115.js";const t="/imgs/devops/circleci-ssh-deploy/1.png",p="/imgs/devops/circleci-ssh-deploy/2.png",u="/imgs/devops/circleci-ssh-deploy/3.png",v="/imgs/devops/circleci-ssh-deploy/4.png",m={},h={href:"https://circleci.com/",target:"_blank",rel:"noopener noreferrer"},k=s("p",null,"为了学习，我将准备这样一个演示项目，首先这个项目是使用Github进行托管，main分支为默认分支，当我们往main分支提交代码时，会首先触发CircleCI对main分支的代码进行测试工作，如果测试通过，接着CircleCI会通过ssh登录到我们的部署服务器中，进入到部署服务器后，首先会进入项目根目录，接着会拉取main分支的最新代码，最后会运行重新部署的命令。",-1),b=s("p",null,"好的，下面我将通过四个具体的步骤来详细讲解。",-1),g=s("h2",{id:"第一步-准备演示项目",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#第一步-准备演示项目","aria-hidden":"true"},"#"),e(" 第一步：准备演示项目")],-1),A=s("p",null,"首先我们需要有一个演示项目，并且我们要知道在自动化部署它之前，我们要如何对它进行手动部署。",-1),C={href:"https://github.com/tsq-blog/circleci-ssh-deploy",target:"_blank",rel:"noopener noreferrer"},y=n(`<p>这是一个简单的Node.js服务器，一旦启动就会在8088端口监听http请求，并对所有的请求都返回一个数字。虽然是Node.js项目，不过在部署时，我故意使用了docker-compose的方式，这样即使是用其它语言来开发，部署流程也完全一样，不一样的只是源代码和Dockerfile而已。</p><p>因为这个项目使用了docker-compose来部署，所以部署会变得非常简单，我们只需要进入项目根目录，然后运行命令：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> pull
<span class="token function">docker-compose</span> up <span class="token parameter variable">--build</span> <span class="token parameter variable">-d</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>即可，这样首先会获取最新源码，接着，docker-compose会使用当前的源代码，重新进行构建并最终保持在后台运行。</p><p>所以手动部署，可以简单的概括为，进入项目根目录、获取最新源码、运行<code>docker-compose up --build -d</code>这三个步骤。</p><p>理解完手动部署的过程后，接下来我们来准备一台真实的服务器。</p><h2 id="第二步-准备服务器" tabindex="-1"><a class="header-anchor" href="#第二步-准备服务器" aria-hidden="true">#</a> 第二步：准备服务器</h2><p>这一步，我将以一台阿里云的Ubuntu20.04为例，演示如何搭建满足上述需求的环境。</p><p>首先需要注意的一点是，因为后续我们需要使用ssh的方式登录到远程服务器，而ssh登录方式有多种，我将使用密钥对的方式进行登录，所以在阿里云上创建服务器是，一定要像下图，勾选使用密钥对，这个密钥对我们需要将它下载到本地以备后用。</p><p><img src="`+t+`" alt=""></p><p>我这里下载后的密钥对命名为了<code>my.pem</code>，购买后的服务器获取的公网IP是<code>8.130.49.249</code>，所以在密钥对所在目录下，执行以下命令就可以登录到远程服务器了：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>chmod 400 my.pem                # 修改pem文件的权限，ssh不允许pem文件的权限过大，所以这里使用400
ssh -i my.pem root@8.130.49.249 # 采用密钥对的方式登录
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>进入服务器后，我们首先需要安装git：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">apt</span> update              <span class="token comment"># 初次使用需要对apt做更新</span>
<span class="token function">apt</span> <span class="token function">install</span> <span class="token function">git</span> <span class="token parameter variable">-y</span>      <span class="token comment"># 使用apt安装git</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,14),x={href:"https://tsq.me/blogs/aliyun/setup-docker-deployment-env-for-aliyun-ecs.html",target:"_blank",rel:"noopener noreferrer"},E=n(`<p>完成安装后，我们需要校验下安装是否成功:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>root@iZ0jl34snwu9foovmkf4m0Z:~<span class="token comment"># docker --version</span>
Docker version <span class="token number">20.10</span>.2, build 2291f61
root@iZ0jl34snwu9foovmkf4m0Z:~<span class="token comment"># docker-compose --version</span>
<span class="token function">docker-compose</span> version <span class="token number">1.28</span>.0, build d02a7b1a
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果能够打印出它们的版本号，就代表安装成功了。</p><p>至此，git、docker、docker-compose都已经准备好了，接下来，我们使用git把项目克隆到我们的根目录下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone https://github.com/tsq-blog/circleci-ssh-deploy.git
<span class="token builtin class-name">pwd</span>
/root/circleci-ssh-deploy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5),I=s("div",{class:"custom-container tip"},[s("svg",{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},[s("g",{fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[s("circle",{cx:"12",cy:"12",r:"9"}),s("path",{d:"M12 8h.01"}),s("path",{d:"M11 12h1v4h1"})])]),s("p",{class:"custom-container-title"},"TIP"),s("p",null,"为了让大家都能访问这个项目，我将它设为了公有，所以我这里可以使用了http协议进行克隆，真实的项目应该使用私有仓库，并使用ssh的方式进行克隆。")],-1),T=n(`<p>这样，服务器端的配置就都好了，就等着后面CircleCI远程登录进来，并执行第一步中所说的三个步骤即可。</p><h2 id="第三步-配置circleci" tabindex="-1"><a class="header-anchor" href="#第三步-配置circleci" aria-hidden="true">#</a> 第三步：配置CircleCI</h2><p>CircleCI方面，有两个方面需要注意一下，首先我们来理解下，放在<code>.circleci/config.yml</code>文件的内容：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token number">2.1</span>
<span class="token key atrule">orbs</span><span class="token punctuation">:</span>
  <span class="token key atrule">node</span><span class="token punctuation">:</span> circleci/node@1.1
<span class="token key atrule">jobs</span><span class="token punctuation">:</span>
  <span class="token key atrule">build</span><span class="token punctuation">:</span>
    <span class="token key atrule">executor</span><span class="token punctuation">:</span>
      <span class="token key atrule">name</span><span class="token punctuation">:</span> node/default
      <span class="token key atrule">tag</span><span class="token punctuation">:</span> <span class="token string">&#39;10.4&#39;</span>
    <span class="token key atrule">steps</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> checkout
      <span class="token punctuation">-</span> <span class="token key atrule">node/with-cache</span><span class="token punctuation">:</span>
          <span class="token key atrule">steps</span><span class="token punctuation">:</span>
            <span class="token punctuation">-</span> <span class="token key atrule">run</span><span class="token punctuation">:</span> npm install
      <span class="token punctuation">-</span> <span class="token key atrule">run</span><span class="token punctuation">:</span> npm run test
      <span class="token punctuation">-</span> <span class="token key atrule">run</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
          echo \${MY_PEM} | tr &#39;|&#39; &#39;\\012&#39; &gt; ~/.ssh/my.pem
          chmod 400 ~/.ssh/my.pem
          ssh -i ~/.ssh/my.pem -o StrictHostKeyChecking=no root@8.130.49.249 &quot;cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个配置文件，可以简单的理解为，CircleCI将使用一个服务器来执行任务，这个服务器首先安装有10.4版本的Node.js，具体的执行任务分别是：</p><p><strong>从Github上获取最新的代码</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>checkout
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>checkout是CircleCI内建的命令，专门用于从Github上拉取最新的源代码。</p><p><strong>运行测试</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">npm</span> run <span class="token builtin class-name">test</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>我这里准备的测试很简单，直接输出“hello world”，所以测试会百分之百成功。</p><p><strong>ssh远程登录并部署</strong></p><p>因为，测试已经通过了，所以我们就可以开始部署工作了。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>      - run: <span class="token operator">|</span>
          <span class="token builtin class-name">echo</span> <span class="token variable">\${MY_PEM}</span> <span class="token operator">|</span> <span class="token function">tr</span> <span class="token string">&#39;|&#39;</span> <span class="token string">&#39;\\012&#39;</span> <span class="token operator">&gt;</span> ~/.ssh/my.pem
          <span class="token function">chmod</span> <span class="token number">400</span> ~/.ssh/my.pem
          <span class="token function">ssh</span> <span class="token parameter variable">-i</span> ~/.ssh/my.pem <span class="token parameter variable">-o</span> <span class="token assign-left variable">StrictHostKeyChecking</span><span class="token operator">=</span>no root@8.130.49.249 <span class="token string">&quot;cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>run</code>下面有三条命令，我们来一条条看一下：</p><p><strong>第一条</strong> <code>echo \${MY_PEM} | tr &#39;|&#39; &#39;\\012&#39; &gt; ~/.ssh/my.pem</code></p><p>要想从CircleCI中登录到远程服务器，CircleCI就必须首先有pem文件，怎么才能有像第二步中的my.pem文件呢？一开始确实没有，不过我们可以生成一个，我们可以将my.pem在本地电脑中打开，将它的内容复制，并在CircleCI的项目设置页中，新建一个环境变量，变量的Name，我这里叫&quot;MY_PEM&quot;，Value就是刚刚复制的内容，然后保存。如下图所示，我们需要事先新建这个环境变量。</p><p><img src="`+p+`" alt=""></p><p>不过在Value的值一定要注意下，非常的关键。这里有个问题，这个问题现在有，以后可能会被CircleCI团队优化，问题就是，如果我们直接将复制的内容粘贴到Value输入框中的话，<strong>这个输入框不会保留原始pem文件中的换行符，所以会导致最终保存的Value是非法的密钥对值</strong>。因为有这个问题，所以我这里采取的方案是，将my.pem中的每一行的最后（除最后一行）末尾手动加上一个<code>|</code>字符，这也是<code>echo \${MY_PEM} | tr &#39;|&#39; &#39;\\012&#39; &gt; ~/.ssh/my.pem</code>这么写的原因，echo会首先读取环境变量，输出这个Value，紧接着使用Linux的<code>tr</code>命令，将<code>|</code>字符全部替换成<code>\\012</code>，而<code>\\012</code>就是原来pem文件中的换行符，最后使用<code>&gt; ~/.ssh/my.pem</code>将tr替换后的内容写到<code>my.pem</code>这个文件中。</p><p>为了填写Value，我是这样做的，首先在文本编辑器比如VS Code中，粘贴本地的pem内容：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>-----BEGIN RSA PRIVATE KEY-----
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接着除最后一行，其它行末尾都加上<code>|</code></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>-----BEGIN RSA PRIVATE KEY-----|
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再将加了<code>|</code>的pem内容复制并粘贴到Value输入框中，但是又有个问题，仔细观察你会发现，粘贴后，<code>|</code>字符的后面多出了一个空格，这个空格是不能有的，否则pem文件的内容就不正确了。</p><p><img src="`+u+`" alt=""></p><p>所以我们可以再将这个含有空格的pem内容，复制粘贴到本地的编辑器：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>-----BEGIN RSA PRIVATE KEY-----| MIIEpQIBAAKCAQEAyDWuka2bnJDhfrQlVvkExsf+djRZe2y2hVSpU1ClSV8kIhpd| xkQZfd+4XFIhhElC9QLMT64XfAM9dZWe6yW6KPym5iNIZjg7Q9RydUvwrRWYZydM| K2n61TqDRVbpNF4PYNKSez3zSDYHyrErt1K1MpDMRrc7/iUylDP/xXd8mUuWLSlX| FuIXXO44rQJdt1OGorHtqTTMMLPAymkafTOug2aC7kRM5oTBGWmA1RlJ+orxScfx| VvTnAoxqGk9BR/qOR6bnqABcjRxsnRU5aTJh9nj+8HjQ4XqJ0FLTEoFHv42R/cjd| sDrMtAbp2/fGc8ZlmdXRISDjd8OQ5PBtq3dyjQIDAQABAoIBAQCrlD3wQQ1cR1nJ| AVAC0lSCmwD7gm+xdACUEXMvoKyWTcAkrd3xvYjvNBzGmeh5e2OzoFtCahtcP1ab| f8d7FJEO8T+DeXdhiw1XWylgVt2DKD+9H5OKnT/HH2dCtHIVXArn2m6IyhXFq/BP| iDjD2lDJbghzDjOO4YgQNOQc8gLJR9aigxvHIZhNTv2lUqHcps9X1Lg89QaM8UXo| vIdGSCGhKYChkgEv6s5cC2rO8bomTmPVgryDsNQiz6NSZW1simsPm1ERABvlD63J| dST/Z2lxkpk4I5NT12ifYw1C/kc4kX9JOtIE3Adhg1lSlsJ2QihjhCcTHj9V3jxF| dPDxcXyhAoGBAOwA5UYQUZ4ZW+dZryDGkJlaBm5MqTXG/I24q2a95dg3fhLuXZZN| FT0d5xwj3e998dJzAi5Tw1d0Cxz5uIEUpFh8mgVoPOasEOnydDzn+e+xUqOOXqci| Pre7ys1kQd2ooZo8l8l/1gzT0hkH2lHE9XvbZwFBNnUXEsKzuCiUV3OlAoGBANks| Y97zS8YHu5mEqN91jRVRgxvX+Fkj0cvMdkYQgMFBZYhgHiA/46JFYuvH13W+Tu8P| /bO0a7LmqZDnkvIXsEvV5YpmvPhpB73cUgor9OpuxfX24XpI8hjxwC/84BLi+JEX| buEvvdWiGtTSWJ95KTnUU7dxS9Q3bwA/5nA1Di7JAoGBAKFvo2Yf95SsSB+jS5ah| /XvJBykgK4drzIqtTiIDuFwE6arNfxs3M1YRRGwNZN1US7znixBhn/gMmyWA9OLn| Wdxlr34PZcls3k0J2tVm4aNCqwLSepDdbgWE4h9Je3zCw3icBkCBv8wagVc59e+F| SV8mH/nNwBCsbdrd0RWBE6k5AoGBAK003y5Y4s09K50kFb+rNGuVSDjzxenqTI/7| MTVuQhJgAweCiWR1MCsipeOgzjHlJ3U5TsF9mwvjNcgRObyFsiC5psn8aKjCs970| EiZ0qnAzCwXB8lEiTpwga4SabWgCx/aINvG4rvHsyPOGFBKUgpHRyzcaUD0gPRJ4| 5GQHnJkpAoGAR5fC3BeVkQExjG3pZwym9ZSAtHA9xpKw0mE9JedeYpCaSbaYTQqx| Z9IIvXr+VjmQe6v0j2dWtgl+lHVkfWlLTXPhceTWBH2fEbk3pWiM6Yc1yNSefzTQ| El4OtjS+pIwkmS/KsKPlSIz6oiJYvKLzSUZqZ6BuOcHF0+MXO6kE6oE=| -----END RSA PRIVATE KEY-----
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>接着将所有的&quot;| &quot;替换成&quot;|&quot;，最终如下：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>-----BEGIN RSA PRIVATE KEY-----|MIIEpQIBAAKCAQEAyDWuka2bnJDhfrQlVvkExsf+djRZe2y2hVSpU1ClSV8kIhpd|xkQZfd+4XFIhhElC9QLMT64XfAM9dZWe6yW6KPym5iNIZjg7Q9RydUvwrRWYZydM|K2n61TqDRVbpNF4PYNKSez3zSDYHyrErt1K1MpDMRrc7/iUylDP/xXd8mUuWLSlX|FuIXXO44rQJdt1OGorHtqTTMMLPAymkafTOug2aC7kRM5oTBGWmA1RlJ+orxScfx|VvTnAoxqGk9BR/qOR6bnqABcjRxsnRU5aTJh9nj+8HjQ4XqJ0FLTEoFHv42R/cjd|sDrMtAbp2/fGc8ZlmdXRISDjd8OQ5PBtq3dyjQIDAQABAoIBAQCrlD3wQQ1cR1nJ|AVAC0lSCmwD7gm+xdACUEXMvoKyWTcAkrd3xvYjvNBzGmeh5e2OzoFtCahtcP1ab|f8d7FJEO8T+DeXdhiw1XWylgVt2DKD+9H5OKnT/HH2dCtHIVXArn2m6IyhXFq/BP|iDjD2lDJbghzDjOO4YgQNOQc8gLJR9aigxvHIZhNTv2lUqHcps9X1Lg89QaM8UXo|vIdGSCGhKYChkgEv6s5cC2rO8bomTmPVgryDsNQiz6NSZW1simsPm1ERABvlD63J|dST/Z2lxkpk4I5NT12ifYw1C/kc4kX9JOtIE3Adhg1lSlsJ2QihjhCcTHj9V3jxF|dPDxcXyhAoGBAOwA5UYQUZ4ZW+dZryDGkJlaBm5MqTXG/I24q2a95dg3fhLuXZZN|FT0d5xwj3e998dJzAi5Tw1d0Cxz5uIEUpFh8mgVoPOasEOnydDzn+e+xUqOOXqci|Pre7ys1kQd2ooZo8l8l/1gzT0hkH2lHE9XvbZwFBNnUXEsKzuCiUV3OlAoGBANks|Y97zS8YHu5mEqN91jRVRgxvX+Fkj0cvMdkYQgMFBZYhgHiA/46JFYuvH13W+Tu8P|/bO0a7LmqZDnkvIXsEvV5YpmvPhpB73cUgor9OpuxfX24XpI8hjxwC/84BLi+JEX|buEvvdWiGtTSWJ95KTnUU7dxS9Q3bwA/5nA1Di7JAoGBAKFvo2Yf95SsSB+jS5ah|/XvJBykgK4drzIqtTiIDuFwE6arNfxs3M1YRRGwNZN1US7znixBhn/gMmyWA9OLn|Wdxlr34PZcls3k0J2tVm4aNCqwLSepDdbgWE4h9Je3zCw3icBkCBv8wagVc59e+F|SV8mH/nNwBCsbdrd0RWBE6k5AoGBAK003y5Y4s09K50kFb+rNGuVSDjzxenqTI/7|MTVuQhJgAweCiWR1MCsipeOgzjHlJ3U5TsF9mwvjNcgRObyFsiC5psn8aKjCs970|EiZ0qnAzCwXB8lEiTpwga4SabWgCx/aINvG4rvHsyPOGFBKUgpHRyzcaUD0gPRJ4|5GQHnJkpAoGAR5fC3BeVkQExjG3pZwym9ZSAtHA9xpKw0mE9JedeYpCaSbaYTQqx|Z9IIvXr+VjmQe6v0j2dWtgl+lHVkfWlLTXPhceTWBH2fEbk3pWiM6Yc1yNSefzTQ|El4OtjS+pIwkmS/KsKPlSIz6oiJYvKLzSUZqZ6BuOcHF0+MXO6kE6oE=|-----END RSA PRIVATE KEY-----
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这样Value的值就准备好了，这里的所有<code>|</code>字符，后面都会被替换成换行符。</p>`,30),S=s("div",{class:"custom-container tip"},[s("svg",{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},[s("g",{fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[s("circle",{cx:"12",cy:"12",r:"9"}),s("path",{d:"M12 8h.01"}),s("path",{d:"M11 12h1v4h1"})])]),s("p",{class:"custom-container-title"},"TIP"),s("p",null,"关于多出的空格问题，我没有细调查原因，如果你在粘贴的时候，没有的话，那么上面一步就可以不用做了。")],-1),B=n(`<p>好的，我们来看run中的第二条命令:</p><p><strong>第二条</strong> <code>chmod 400 ~/.ssh/my.pem</code></p><p>它很简单，就是给生成的pem文件加上合适的权限。</p><p><strong>第三条</strong> <code>ssh -i ~/.ssh/my.pem -o StrictHostKeyChecking=no root@8.130.49.249 &quot;cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d&quot;</code></p><p>因为有了pem文件，我们就可以在CircleCI的这台服务器上使用<code>ssh -i ~/.ssh/my.pem root@8.130.49.249</code>来登录我们服务器了，而之所以用了<code>-o StrictHostKeyChecking=no</code>选项，是为了防止登录过程中出现让我们选择是否确认要连接时，会弹出的选项“yes/no”，它会阻塞ssh后续命令的执行，所以加了这个选项后，就不会出现阻塞的过程。</p><p>这一条命令的最后，用双引号括起来的部分<code>&quot;cd /root/circleci-ssh-deploy;git pull;docker-compose up --build -d&quot;</code>就是部署命令，可以看到它很简单：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /root/circleci-ssh-deploy      <span class="token comment"># 进入项目根目录</span>
<span class="token function">git</span> pull                          <span class="token comment"># 从Github拉取最新的源代码</span>
<span class="token function">docker-compose</span> up <span class="token parameter variable">--build</span> <span class="token parameter variable">-d</span>      <span class="token comment"># 使用docker-compose重新构建并部署</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以CircleCI方面我们首先需要确保<code>.circleci/config.yml</code>文件编写的正确，其次是在CircleCI的设置页配上正确的环境变量。</p><h2 id="第四步-校验部署是否成功" tabindex="-1"><a class="header-anchor" href="#第四步-校验部署是否成功" aria-hidden="true">#</a> 第四步：校验部署是否成功</h2><p>服务器端和CircleCI都准备了，这时候我们就可以校验下，CircleCI是否能够通过ssh登录到我们的服务器并完成部署。</p><p>为了校验，我们可以将circleci-ssh-deploy这个项目的内容做一些更改并提交，比如将“app.js”第六行改为“res.end(&#39;10&#39;);”，这样如果部署成功，在我们的服务器上访问<code>http://localhost:8088</code>，就会一直返回<code>10</code>了。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>root@iZ0jl34snwu9foovmkf4m0Z:~<span class="token comment"># curl localhost:8088</span>
10root@iZ0jl34snwu9foovmkf4m0Z:~<span class="token comment">#</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>上面出现了<code>10</code>，代表我们的服务已经成功的被重新部署了。</p><p>与此同时，我们也可以进入CircleCI中看到所有的日志:</p><p><img src="`+v+'" alt=""></p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>在这篇文章中，我们通过四步完成了如何在CircleCI上通过ssh远程登录到我们服务器上，并完成自动化部署任务，整个实现思路其实很简单，就是在CircleCI的服务器上，获取到密钥的值，这样它就可以登录到我们的服务器。而为了获取到密钥的值，我们使用了CircleCI提供的环境变量功能，又因为环境变量的Value输入框目前还存在一些小问题，我们上面使用了一些小的Trick来做了应对。</p><p>好的，这篇文章就到这里，如果你还在每次手动登录到远程Linux服务器，并执行重复的部署命令，那么不妨试着利用下CircleCI！</p>',18);function X(w,D){const a=r("ExternalLinkIcon");return c(),d("div",null,[s("p",null,[s("a",h,[e("CircleCI"),i(a)]),e("是一个非常好用的持续集成平台，我们可以通过它来完成应用的测试、打包和自动化部署。关于自动化部署，其实有很多方案可以选择，比如，通过CircleCI可以将应用部署到AWS的ECS、AWS的S3、Google的GKE、Github的Pages等。除了这些，还有一个更加灵活的方案，就是我们可以在CircleCI中使用ssh登录到自己的服务器中，并通过执行相应的自动化部署脚本，从而达到应用的自动化部署。因为我已经遇到过好几个项目都在使用ssh的方式进行自动化部署，所以这篇文章就来分享下其中的关键点和一些注意事项。")]),o(" more "),k,b,g,A,s("p",null,[e("我这里已经事先准备了一个演示项目："),s("a",C,[e("https://github.com/tsq-blog/circleci-ssh-deploy"),i(a)])]),y,s("p",null,[e("接下来我们需要分别安装docker和docker-compose，关于它们的安装，可以参考我之前的文章："),s("a",x,[e("使用阿里云ECS搭建Docker部署环境"),i(a)]),e("。")]),E,I,T,S,B])}const j=l(m,[["render",X],["__file","circleci-ssh-deploy.html.vue"]]);export{j as default};