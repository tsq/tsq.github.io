import{_ as i,p as l,q as r,s as n,R as e,t as a,w as o,Y as c,n as d}from"./framework-aa5c4115.js";const t={},v={href:"https://docs.docker.com/engine/install/",target:"_blank",rel:"noopener noreferrer"},u=c(`<h2 id="第一步-输入安装脚本" tabindex="-1"><a class="header-anchor" href="#第一步-输入安装脚本" aria-hidden="true">#</a> 第一步：输入安装脚本</h2><p>当我们登录到阿里云ECS后，为了安装Docker，我们可以直接输入以下命令：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">-fsSL</span> https://get.docker.com <span class="token operator">|</span> <span class="token function">bash</span> <span class="token parameter variable">-s</span> <span class="token function">docker</span> <span class="token parameter variable">--mirror</span> Aliyun
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这条命令执行后，会自动执行Docker的安装，整个过程一气呵成，不存在需要手动输入”y”或”n”等确认选项。</p><h2 id="第二步-检查安装是否成功" tabindex="-1"><a class="header-anchor" href="#第二步-检查安装是否成功" aria-hidden="true">#</a> 第二步：检查安装是否成功</h2><p>第一步执行完毕后，为了检查Docker是否安装成功，我们可以输入 docker info 这条命令来查看Docker的相关信息，如果能够正确输出，那么就代表Docker已经安装成功了。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>➜  ~ <span class="token function">docker</span> info
Client:
 Debug Mode: <span class="token boolean">false</span>

Server:
 Containers: <span class="token number">0</span>
  Running: <span class="token number">0</span>
  Paused: <span class="token number">0</span>
  Stopped: <span class="token number">0</span>
 Images: <span class="token number">0</span>
 Server Version: <span class="token number">19.03</span>.13
 Storage Driver: overlay2
  Backing Filesystem: extfs
  Supports d_type: <span class="token boolean">true</span>
  Native Overlay Diff: <span class="token boolean">true</span>
 Logging Driver: json-file
 Cgroup Driver: cgroupfs
 Plugins:
  Volume: <span class="token builtin class-name">local</span>
  Network: bridge <span class="token function">host</span> ipvlan macvlan null overlay
  Log: awslogs fluentd gcplogs gelf journald json-file <span class="token builtin class-name">local</span> logentries splunk syslog
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
 Kernel Version: <span class="token number">5.4</span>.0-47-generic
 Operating System: Ubuntu <span class="token number">20.04</span>.1 LTS
 OSType: linux
 Architecture: x86_64
 CPUs: <span class="token number">2</span>
 Total Memory: <span class="token number">1</span>.84GiB
 Name: iZ8vb8fa17pr9s3louozngZ
 ID: G5YJ:K7DH:GKTI:ASTN:R2VO:TQ22:XROK:2TCI:CNRL:LNFA:AMWJ:5SBH
 Docker Root Dir: /var/lib/docker
 Debug Mode: <span class="token boolean">false</span>
 Registry: https://index.docker.io/v1/
 Labels:
 Experimental: <span class="token boolean">false</span>
 Insecure Registries:
  <span class="token number">127.0</span>.0.0/8
 Live Restore Enabled: <span class="token boolean">false</span>

WARNING: No swap limit support
➜  ~
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>如果我们仔细观察刚刚的安装命令，可以发现，Docker的安装源使用的其实是阿里云提供的源，所以安装才会如此方便和快速。</p>`,9),p={class:"custom-container tip"},m=n("svg",{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},[n("g",{fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[n("circle",{cx:"12",cy:"12",r:"9"}),n("path",{d:"M12 8h.01"}),n("path",{d:"M11 12h1v4h1"})])],-1),b=n("p",{class:"custom-container-title"},"TIP",-1),k={href:"https://developer.aliyun.com/mirror/NPM",target:"_blank",rel:"noopener noreferrer"},h={href:"https://developer.aliyun.com/composer",target:"_blank",rel:"noopener noreferrer"};function f(g,_){const s=d("ExternalLinkIcon");return l(),r("div",null,[n("p",null,[e("现如今，在Linux上使用Docker来部署Web应用正在变得越来越流行。为了使用Docker来部署应用，我们首先需要安装Docker这个程序。对于Docker的安装，一般情况下我们可以参考Docker"),n("a",v,[e("官方文档"),a(s)]),e("来一步步完成安装操作，而这篇文章我将与你分享是：如果我们使用的是阿里云ECS，那么我们可以只通过一条命令就能快速完成Docker的安装。")]),o(" more "),u,n("div",p,[m,b,n("p",null,[e("除了提供Docker源，阿里云在其它方面也为开发者提供了很多便利，我自己切身受益过的有Node.js的 "),n("a",k,[e("cnpm"),a(s)]),e(" 以及PHP的 "),n("a",h,[e("composer"),a(s)]),e("。")])])])}const x=i(t,[["render",f],["__file","quick-install-docker-on-aliyun-ecs.html.vue"]]);export{x as default};
