module.exports = {
  "title": "程序员阿汤",
  "description": "Stay Hungry Stay Foolish",
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
  "theme": "reco",
  "themeConfig": {
    subSidebar: 'auto',
    "nav": [
      {
        "text": "首页",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "时间线",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      {
        "text": "关于",
        "link": "/about/",
        "icon": "reco-faq"
      },
    ],
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "目录"
      },
      "tag": {
        "location": 3,
        "text": "标签"
      }
    },
    "logo": "/logo.png",
    "search": true,
    "searchMaxSuggestions": 10,
    "author": "阿汤",
    "authorAvatar": "/avatar.png"
  },
  "markdown": {
    "lineNumbers": false
  }
}
