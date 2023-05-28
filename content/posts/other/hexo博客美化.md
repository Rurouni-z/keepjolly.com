记录一些我没用到但是[butterfly](https://butterfly.js.org)上是true的选项
## Page Front-matter
[PFM](https://butterfly.js.org/posts/dc584b87/#Front-matter)
```markdown
---
title:   # 【必需】页面标题
date:  #【必需】页面创建日期
updated:
type:  # 【必需】标签、分类和友情链接三个页面需要配置
comments:  
description:
keywords:
top_img:
mathjax:
katex:
aside:
aplayer:
highlight_shrink:
---

```
**updated	【可选】页面更新日期**<br />**description	【可选】页面描述**<br />keywords	【可选】页面关键字<br />**comments	【可选】显示页面评论模块 (默认 true)**<br />top_img	【可选】页面顶部图片<br />mathjax	【可选】显示mathjax (当设置mathjax的per_page: false时，才需要配置，默认 false)<br />katex	【可选】显示katex (当设置katex的per_page: false时，才需要配置，默认 false)<br />aside	【可选】显示侧边栏 (默认 true)<br />aplayer	【可选】在需要的页面加载aplayer的js和css,请参考文章下面的音乐 配置<br />highlight_shrink	【可选】配置代码框是否展开 (true/false) (默认为设置中highlight_shrink的配置)
## Post Front-matter
```markdown
---
title:  
date:  
updated:
tags:
categories:
keywords:
description:
top_img:
comments:
cover:
toc:
toc_number:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
abcjs:
---

```
title	 【必需】文章标题<br />date	 【必需】文章创建日期<br />updated	【可选】文章更新日期<br />**tags	【可选】文章标签**<br />**categories	【可选】文章分类**<br />keywords	【可选】文章关键字<br />**description	【可选】文章描述**<br />**top_img	【可选】文章顶部图片**<br />cover	【可选】文章缩略图(如果没有设置top_img,文章页顶部将显示缩略图，可设为false/图片地址/留空)<br />**comments	【可选】显示文章评论模块(默认 true)**<br />toc	【可选】显示文章TOC(默认为设置中toc的enable配置)<br />toc_number	【可选】显示toc_number(默认为设置中toc的number配置)<br />toc_style_simple	【可选】显示 toc 简洁模式<br />copyright	【可选】显示文章版权模块(默认为设置中post_copyright的enable配置)<br />copyright_author	【可选】文章版权模块的文章作者<br />copyright_author_href	【可选】文章版权模块的文章作者链接<br />copyright_url	【可选】文章版权模块的文章连结链接<br />copyright_info	【可选】文章版权模块的版权声明文字<br />mathjax	【可选】显示mathjax(当设置 mathjax 的 per_page: false 时，才需要配置，默认 false )<br />katex	【可选】显示 katex (当设置 katex 的 per_page: false 时，才需要配置，默认 false )<br />aplayer	【可选】在需要的页面加载 aplayer 的 js 和 css,请参考文章下面的音乐 配置<br />highlight_shrink	【可选】配置代码框是否展开(true/false)(默认为设置中 highlight_shrink 的配置)<br />aside	【可选】显示侧边栏 (默认 true)<br />abcjs	【可选】加载 abcjs (当设置 abcjs 的 per_page: false 时，才需要配置，默认 false )
## 图库
[https://butterfly.js.org/posts/dc584b87/#%E5%9C%96%E5%BA%AB](https://butterfly.js.org/posts/dc584b87/#%E5%9C%96%E5%BA%AB)

## 网址同步
因为我是从halo迁移过来，原主题的front-matter信息跟hexo不一致，多了一个url属性，表明文件路径
```markdown
# URL
## Set your site url here. For example, if you use GitHub Page, set url as 'https://username.github.io/project'
# https://blog.csdn.net/qq_45020818/article/details/126892843  https://hexo.io/zh-cn/docs/permalinks
url: http://yoursite.com
# 除了下列变量外，您还可使用 Front-matter 中的**所有**属性。
# **.html**防止下载当前网页
permalink: :url.html  
permalink_defaults:
pretty_urls:
  trailing_index: true # Set to false to remove trailing 'index.html' from permalinks
  trailing_html: false # Set to false to remove trailing '.html' from permalinks

# 旧网址的front-matter
---
title: 三维重建之路上
date: 2023-03-26 09:07:02.96
updated: 2023-03-26 09:41:47.726
url: /archives/three-d-reconstruction-1
categories: 
- 笔记
tags: 
- 三维重建
---
```
[参考博客，文中还附加了类别中英文转换，个人感觉网址应该不会重名就没设了](https://blog.csdn.net/Likianta/article/details/79343427)
## 注意事项
### 配置algolia不显示在页面上
在_config.butterfly.yml里已经放入algolia配置选项，不要重新在最底部复制，否则出错，并且配置的时候文档里需要什么，都得配置上去，我没加adminApiKey导致生成失败，我还以为加入环境变量就可以了。
```html
algolia:
appId: "Z7A3XW4R2I"  #must
apiKey: "12db1ad54372045549ef465881c17e743" #must
adminApiKey: "40321c7c207e7f73b63a19aa24c4761b" #must
chunkSize: 5000
indexName: "my-hexo-blog"
fields:
- content:strip:truncate,0,500
- excerpt:strip
- gallery
- permalink
- photos
- slug
- tags
- title
```

