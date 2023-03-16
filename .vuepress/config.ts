import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  "title": "程序员阿汤",
  "description": "分享知识 • 分享快乐",
  "dest": "dist",
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "link",
      {
        "rel": "apple-touch-icon-precomposed",
        "href": "/apple.png"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ],
    [
      "meta",
      {
        "name": "copyright",
        "content": "https://github.com/tsq"
      }
    ],
    [
      "meta",
      {
        "name": "author",
        "content": "https://github.com/tsq"
      }
    ]
  ],
  theme: recoTheme({
    primaryColor: '#3eaf7c',
    style: "@vuepress-reco/style-default",
    logo: "/logo.png",
    author: "阿汤",
    authorAvatar: "/avatar.png",
    docsRepo: "https://github.com/tsq/tsq.github.io",
    docsBranch: "main",
    docsDir: "",
    editLinkText: "在Github上编辑",
    lastUpdated: false,
    catalogTitle: "目录",
    autoSetBlogCategories: false,
    navbar: [
      { text: "首页", link: "/", icon: "Home" },
      {
        text: "实验源码",
        link: "https://github.com/tsq-blog",
        icon: "LogoGithub"
      }
    ],
  }),
});
