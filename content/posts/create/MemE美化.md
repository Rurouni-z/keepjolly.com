---
title: MemE美化1
date: 2023-05-27 19:51:00 +0800
lastmod: 
summary: 
slug: meme-custom-1
toc: true
rightToc: false
categories: 
- create
tags: 
- Blog
original: true
author: Rurouni
website: www.keepjolly.com
---
## 设置为section
文章路径放在 blog/content/posts ，其内每个文件夹必须有个_index.md文件，为空没事，并且posts下也需要有。

如果需要在第一个section内创建文件夹但是不显示该文件夹名可以配置Permalinks属性为

[permalinks]
    posts = '/posts/:sections[1]/:slug/'

[url pattern](https://gohugo.io/content-management/urls/#permalinks)

```
.
└── content
    └── about
    |   └── index.md       // <- https://example.com/about/
    ├── posts
    |   ├── _index.md      // <- https://example.com/posts/
    |   ├── firstpost.md   // <- https://example.com/posts/firstpost/
    |   ├── happy
    |   |   └── ness.md    // <- https://example.com/posts/ness/  不显示happy
    |   └── secondpost.md  // <- https://example.com/posts/secondpost/
    └── quote
        ├── first.md       // <- https://example.com/quote/first/
        └── second.md      // <- https://example.com/quote/second/
```

```python
######################################
# 分类方式

# MemE 主题支持以下两种分类方式：
# 1. sections       分区
# 2. categories     部类
# 其中，分区是基于站点的 content 目录下的
# 文件夹和子文件夹；部类是基于文章的 Front
# Matter。分类即树状分类，Hexo 是基于文章
# 的 Front Matter，Hugo 则是基于文件系统
# 的结构。由于设计理念的不同，导致了 Hexo
# 与 Hugo 的这个差异，故在此设计这个选项，
# 以对从 Hexo 过来的用户友好。但是请注意：
# Hugo 中无法完全实现基于 Front Matter
# 的树状分类，故如需保留树状分类，建议适应
# Hugo 的设计理念——分区。

categoryBy = "sections"
# 注意：如果你设置为 `sections`，请务必将
#      此配置文件中的类别（taxonomies）中
#      的 `categories` 删除，不然分类页
#      面会失效。同时，你还需要自己新建一个
#      `content/categories/_index.md`
#      文件。
```
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230527195030.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
## 列表页面
此处页面在点击分类页中任意文件夹名即可显示
## 设置网址图标
```toml
# 说明：前往 https://realfavicongenerator.net/
#      生成相关图标和文件，下载后解压，仅保留
#      android-chrome-512x512.png、
#      apple-touch-icon.png、
#      mstile-150x150.png、
#      safari-pinned-tab.svg、favicon.ico、
#      site.webmanifest 这些文件，删除其余。
#      然后将这些文件移动到 ~/blog/static/icons/
#      目录下，再将 favicon.ico、site.webmanifest
#      移动到 ~/blog/static/ 目录下，
#      最后将 site.webmanifest 重命名为
#      manifest.json，并检查和修改相关内容。
```
```json
{
  "name": "Jolly",
  "short_name": "Jolly",
  "icons": [
    {
      "src": "./icons/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}

```
## 图表绘制工具
```toml
# 是否开启（全局设置）图表绘制工具
enableMermaid = false
# 说明：文章的 Front Matter 中的 `mermaid`
#      的优先级高于此处
```
## 极简页脚
```toml
# 极简页脚
# 是否开启
enableMinimalFooter = true
enableVerticalBarStructure = false
# 说明：如果开启此项，显示在右边的部类或分区
#      将会包含全部的第一级部类或分区，并且
#      以竖线（|）分隔开来。

# 是否开启关于页面的极简页脚
enableAboutPageMinimalFooter = false

######################################
# 文章上下篇

# 说明：在 MemE 主题中，文章上下篇是从空间
#      位置角度设计的，而不是像大多数其它主
#      题所做的那样——从时间角度设计。因此，
#      如果你点击左边的上篇，跳转的是一篇更
#      新的文章；如果你点击右边的下篇，跳转
#      的是一篇更旧的文章。

# 是否开启
enablePostNav = false

# 是否仅限于相同的文章分区
postNavInSection = true
######################################
# 页脚
# 是否开启
enableFooter = true

# 是否显示
displayFooter = false
```
[底部留白](https://github.com/reuixiy/hugo-theme-meme/issues/357)
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230527195030-1.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
## life & tech 模板
该处建议参考主题作者的[config.toml](https://github.com/reuixiy/io-oi.me/blob/master/config.toml#L232) 中的menu，以及content文件夹下的文件组织路径，注意，其中的zh文件夹是为了后续的中英文转换，如不需要，直接在content下创建life & tech文件夹
注意文件夹为英文，否则路径会带有中文，Permalink不知道作用
## posts页不显示中文年份
我忘了怎么弄的
可能是
```toml
# 日期的格式
listDateFormat = "2006-01-02"
```
