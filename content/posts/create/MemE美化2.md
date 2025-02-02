---
title: MemE关键美化
date: 2023-05-27 19:59:46 +0800
lastmod: 
summary: 运用snippet简化配置front-matter；运用action简化配置algolia上传；修改about页加入视频和音频；创建toc右边显示，定制为页面级显示；加入豆瓣条目。
slug: meme-custom-important
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
## hugo坑
- 使用shortcode时，无论放何处都会生效，必须取消shortcode格式，如：
  - {a(加入a破坏shortcode){ music }}
  - 目前已知问题:目录跳转无法生效

## 配置front matter
使用[vscode snippet](https://code.visualstudio.com/docs/editor/userdefinedsnippets)快捷生成front matter
参考博客：[vs-code-workflows-for-hugo](https://moonbooth.com/hugo/vs-code/#vs-code-workflows-for-hugo)、 [markdown-snippets-not-working-in-vscode](https://bingdoal.github.io/others/2021/12/markdown-snippets-not-working-in-vscode/)
在使用了obsidian后，加入一些插件如quickadd等，优化了文章撰写，但是obsidian不能在网页端登陆，虽然多个平台都有部署安装包，此外**仅支持md文件**使我不能继续使用下去。
后来沉思一下现有写文章流程，缺点是什么，发现是不能生成front matter，故东找西找，甚至一度又回归到obsidian后，终于发现vscode的snippet，正好几乎完美符合我的需求（不能自动呈现所有tags）。
目前我的写作流程是：

1. 语雀上写好文章后导出md
2. 用pic-go插件pic-migrate转换语雀图片并生成新md文件
3. 在vscode上加入front matter
4. 在vscode上上传至github
```json
{
	"hugo post template":{
		"scope": "markdown",  // Add comma separated ids of the languages where the snippet is applicable in the scope field.
        "prefix": "post",  // trigger the snippet
        "body": [  // expanded and inserted where trigger
            "---",
            "title: ${TM_FILENAME/(.*)\\..+$/$1/}",
            "date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND +0800",
			"lastmod: ",
            "summary: ",
            "slug: $2", // url: www.keepjolly.com/tags/:slug/
			"toc: ${3|true,false|}",
			"rightToc: ${4|false,true|}",
			"categories: ",
			"- ${5|tech,learn,algorithm,error,create,other,life|}",
			"tags: ",
			"- ${6|ComputerVision,C++,LeetCode,Blog,Others,Install|}",
			"original: true",
			"author: Rurouni",
			"website: www.keepjolly.com",
			"---"
        ]
    },
	"update time":{
		"scope": "yaml",
		"prefix": "update",
		"body": "$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND +0800"
	}
}

```
完整可支持的[front-matter](https://github.com/reuixiy/hugo-theme-meme#supported-front-matter)，貌似也可以定制，自行百度吧
## 配置搜索功能
参考博客：[修改algolia的设置](https://www.dreamsafari.info/2020/04/hugo-loveit-mod/#23-%E4%BF%AE%E6%94%B9algolia%E7%9A%84%E8%AE%BE%E7%BD%AE)、[hugo添加algolia搜索支持](https://edward852.github.io/post/hugo%E6%B7%BB%E5%8A%A0algolia%E6%90%9C%E7%B4%A2%E6%94%AF%E6%8C%81/)
### 配置config.toml
```toml
# Algolia 的搜索索引
[outputFormats.Algolia]
    mediaType = "application/json"
    baseName = "algolia"
    isPlainText = true
    notAlternative = true
# 摘要的字数限制  此处用于algolia检索
summaryLength = 70

# Hugo 的输出控制
[outputs]
    page = ["HTML"]
    home = ["HTML", "SectionsAtom", "SectionsRSS", "SearchIndex", "Algolia"]
    section = ["HTML"]
    taxonomy = ["HTML"]
    term = ["HTML"]

# 菜单配置
[menu]
    ## 菜单栏
    [[menu.main]]  # 多加入一个搜索栏
        weight = 8
        identifier = "search"
        post = "search"

######################################
# Algolia search

# 说明：需要开启 `Algolia` 在Hugo 的输出控制，且需要每
#      次将生成的 algolia.json 文件上传到
#      Algolia

enableAlgoliaSearch = true

algoliaAppId = ""
algoliaApiKey = ""
algoliaIndexName = ""
# 说明：https://www.algolia.com/
```
### algolia官网查找key
![image](https://pic.keepjolly.com/halo/blog/2023/05/20230527195908.png?imageMogr2/format/webp%7C)
或者登录后访问[网址](https://www.algolia.com/account/api-keys)，然后找到对应Application ID、ApiKey、IndexName，找不到可以自行在参考博客中查找。
### 覆盖index.algolia.json配置
然后在博客主目录/layouts下新建index.algolia.json来覆盖meme中的配置，此处内容参考[dreamsafari的json](https://github.com/dreamsafari/LoveIt/blob/master/layouts/_default/list.algolia.json)
此处需多加一个参数summary，内容为content内容，或者$page.Summary（但是此处显示会无法转义字符，目前无法解决，以后应该也不会解决，等有缘人），否则会显示undefined
```json
{{- range $i, $c := $chunked -}}
{{- $index = $index | append (dict "objectID" (print $page.File.UniqueID "_" $i) "order" $i "title" $page.Title "date" $page.Date "url" $page.Permalink "tags" $page.Params.tags "categories" $page.Params.Categories "summary" $c) -}}
{{- end -}}
```
### 修改algolia搜索配置
此处配置搜索选项，参考[修改algolia的设置](https://www.dreamsafari.info/2020/04/hugo-loveit-mod/#23-%E4%BF%AE%E6%94%B9algolia%E7%9A%84%E8%AE%BE%E7%BD%AE)
![image](https://pic.keepjolly.com/halo/blog/2023/05/20230527195908-1.png?imageMogr2/format/webp%7C)
### 自动上传algolia.json
详见github action处
## 配置about页及视频
### 视频
```html
<video src="QmTz7jzWdGrTVKT7YwNwX9cEgfg4smNFHVxnaFDR82BrXt" poster="../images/Gypsy Heart.jpg" controls >
  如需下载：<a href="https://gateway.pinata.cloud/ipfs/QmTz7jzWdGrTVKT7YwNwX9cEgfg4smNFHVxnaFDR82BrXt">MP4</a>
</video>

config.toml
# 是否开启
enableVideoHost = true  # 相对路径获取图片，用于poster属性

# 视频外链地址
videoHostURL = "https://gateway.pinata.cloud/ipfs/"  # 用于src属性，使其链接干净
# !!必须src开头，否则无法识别到hash!!
```
为了使封面图poster与视频适配：
[设置object-fit: 无效](https://stackoverflow.com/questions/10826784/make-html5-video-poster-be-same-size-as-video-itself)，被迫剪裁图片以适配视频。
### 音乐
如果想配置[音乐](https://tianheg.xyz/posts/hugo-toc-conflicts-with-aplayer/)

1. 根目录下的layouts\shortcodes\创建music.html

该代码同时支持列表和单曲模式
```css
<!-- 使用meting-js的方式  https://immmmm.com/hugo-shortcodes-music/ -->
<!-- require APlayer https://aplayer.js.org/#/zh-Hans/?id=%E5%85%A5%E9%97%A8 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css">
<script src="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js"></script>
{{- if .IsNamedParams -}}

<div id="player"></div>

{{- if .Get "url" -}}
<script>
    const ap1 = new APlayer({
        container: document.getElementById('player'),
        lrcType: 3,
        audio: [{
            name: '{{ .Get `name` }}',
            artist: '{{ .Get `artist` }}',
            url: '{{ .Get `url` }}',
            cover: '{{ .Get `cover` }}',
            lrc: '{{ .Get `lrc` }}',
            theme: '#f44336'
        }]
    });
</script>
{{- else if .Get "auto" -}}
<script>
    const ap = new APlayer({
        container: document.getElementById('player'),
        mini: false,
        autoplay: false,
        theme: '#FADFA3',
        loop: 'all',
        order: 'random',
        preload: 'auto',
        volume: 0.7,
        mutex: true,
        listFolded: false,
        listMaxHeight: 90,
        lrcType: 3,
        audio: [
            {
                name: '{{ .Get `name1` }}',
                artist: '{{ .Get `artist1` }}',
                url: '{{ .Get `url1` }}',
                cover: '{{ .Get `cover1` }}',
                lrc: '{{ .Get `lrc1` }}',
                theme: '#f44336'
            },
            {
                name: '{{ .Get `name2` }}',
                artist: '{{ .Get `artist2` }}',
                url: '{{ .Get `url2` }}',
                cover: '{{ .Get `cover2` }}',
                lrc: '{{ .Get `lrc2` }}',
                theme: '#46718b'
            }
        ]
    });
</script>
{{- end -}}

{{- end -}}

```

2. 在about/_index.md中修改代码
```css
{a(去掉a){< music url="xxx.mp3" 
 name="Try" artist="Colbie Caillat" cover="../songs/Gypsy Heart song.jpg" lrc="xxx.lrc">}}
```

3. 在assets\scss\custom\_custom.scss中修改暗夜样式
```css
// Aplayer
:root[data-theme="light"]{
    .aplayer-pic{
        background-color: #b7daff;
    }
}
:root[data-theme="dark"]{
    .aplayer {
        background: #212121
    }

     .aplayer.aplayer-withlist .aplayer-info {
        border-bottom-color: #5c5c5c
    }

     .aplayer.aplayer-fixed .aplayer-list {
        border-color: #5c5c5c
    }

     .aplayer .aplayer-body {
        background-color: #212121
    }

     .aplayer .aplayer-info {
        border-top-color: #212121
    }

     .aplayer .aplayer-info .aplayer-music .aplayer-title {
        color: #fff
    }

     .aplayer .aplayer-info .aplayer-music .aplayer-author {
        color: #fff
    }

     .aplayer .aplayer-info .aplayer-controller .aplayer-time {
        color: #eee
    }

     .aplayer .aplayer-info .aplayer-controller .aplayer-time .aplayer-icon path {
        fill: #eee
    }

     .aplayer .aplayer-list {
        background-color: #212121
    }

     .aplayer .aplayer-list::-webkit-scrollbar-thumb {
        background-color: #999
    }

     .aplayer .aplayer-list::-webkit-scrollbar-thumb:hover {
        background-color: #bbb
    }

     .aplayer .aplayer-list li {
        color: #fff;
        border-top-color: #666
    }

     .aplayer .aplayer-list li:hover {
        background: #4e4e4e
    }

     .aplayer .aplayer-list li.aplayer-list-light {
        background: #6c6c6c
    }

     .aplayer .aplayer-list li .aplayer-list-index {
        color: #ddd
    }

     .aplayer .aplayer-list li .aplayer-list-author {
        color: #ddd
    }

     .aplayer .aplayer-lrc {
        text-shadow: -1px -1px 0 #666
    }

     .aplayer .aplayer-lrc:before {
        background: -moz-linear-gradient(top, #212121 0%, rgba(33, 33, 33, 0) 100%);
        background: -webkit-linear-gradient(top, #212121 0%, rgba(33, 33, 33, 0) 100%);
        background: linear-gradient(to bottom, #212121 0%, rgba(33, 33, 33, 0) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#212121', endColorstr='#00212121', GradientType=0)
    }

     .aplayer .aplayer-lrc:after {
        background: -moz-linear-gradient(top, rgba(33, 33, 33, 0) 0%, rgba(33, 33, 33, 0.8) 100%);
        background: -webkit-linear-gradient(top, rgba(33, 33, 33, 0) 0%, rgba(33, 33, 33, 0.8) 100%);
        background: linear-gradient(to bottom, rgba(33, 33, 33, 0) 0%, rgba(33, 33, 33, 0.8) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00212121', endColorstr='#cc212121', GradientType=0)
    }

     .aplayer .aplayer-lrc p {
        color: #fff
    }

     .aplayer .aplayer-miniswitcher {
        background: #484848
    }

     .aplayer .aplayer-miniswitcher .aplayer-icon path {
        fill: #eee
    }
}
```
#### 配置视频介绍文字

1. _index.md
```html
<h2 class="try">Try</h2>
<!-- <p style="text-align:center" class="colbie">Colbie Caillat</p> -->
<p style="text-align:center">
<em>
You don't have to try so hard<br>
You don't have to, give it all away<br>
You just have to get up, get up, get up, get up<br>
You don't have to change a single thing</em>
</p>
```

2. config.toml
```toml
# 网络字体链接
fontsLink = "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&family=Source+Code+Pro:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel+Decorative:wght@700&display=swap"
```

3. assets/scss/custom/_custom.scss
```css
// about页
.try {   // io-oi.me
      margin-top: 50px;
      text-align: center;
      font-family: 'Cinzel Decorative', serif !important;
      background-image: linear-gradient(90deg, #f37055 0, #ef4e7b 40%, #f37055 45%, #a166ab 50%, #f37055 55%, #ef4e7b 60%, #f37055 100%);
      background-size: cover;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
     }
.colbie {
  text-align: center;
  font-family: 'Cinzel Decorative', serif !important;
  background-image: linear-gradient(90deg, #f37055 0, #ef4e7b 40%, #f37055 45%, #a166ab 50%, #f37055 55%, #ef4e7b 60%, #f37055 100%);
  background-size: cover;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}


// https://io-oi.me/tech/get-started-with-variable-fonts/
@font-face {
  font-family: 'Amstelvar';
  font-display: swap;
  src: url('#{$baseRelURL}/fonts/Amstelvar-Italic-VF.woff2') format('woff2-variations'),
    url('#{$baseRelURL}/fonts/Amstelvar-Italic-VF.woff2') format("woff2");
  font-weight: 100 900;
  font-stretch: 50% 125%;
  font-style: italic;
}


@font-face {
  font-family: 'Amstelvar';
  font-display: swap;
  src: url('#{$baseRelURL}/fonts/Amstelvar-Roman-VF.woff2') format('woff2-variations'),
    url('#{$baseRelURL}/fonts/Amstelvar-Roman-VF.woff2') format('woff2');
  font-weight: 100 900;
  font-stretch: 50% 125%;
  font-style: normal;
}


body {
  font-family: 'Amstelvar', 'Noto Serif SC',  serif;
}


:root {
  --text-wdth: 90;
  --text-opsz: 40;
  --text-YTLC: 460;
}


body {
  font-variation-settings:
    'wdth' var(--text-wdth),
    'opsz' var(--text-opsz),
    'YTLC' var(--text-YTLC);
}


.post-title {
  font-family: 'glyph-correction', 'Amstelvar', 'Noto Serif SC', serif;
  font-variation-settings:
    'wght' 550,
    'opsz' 60,
    'YOPQ' 90;
}


.list-item-time {
  font-feature-settings: 'tnum';
}


blockquote.quote {
  position: relative;
  margin: 2em auto !important;
  padding-left: 3em;
  color: inherit;
  border: none;
  p {
    text-indent: 0 !important;
  }
  &::before {
    position: absolute;
    left: 0;
    content: '“';
    font-size: 3em;
    font-weight: bold;
    line-height: 1;
  }
  &.poetry {
    display: table;
    padding: 0;
    &::before {
      left: -1em;
    }
    p {
      margin: 0 0 1em;
    }
    p:last-child {
      margin: 0;
    }
  }
  &.en {
    p {
      line-height: 1.618;
      text-align: left;
      hyphens: auto;
      -webkit-hyphens: auto;
      -moz-hyphens: auto;
    }
  }
  &.italic {
    p {
      font-style: italic;
    }
  }
}


@media (max-width: $maxWidth) {
  blockquote.quote {
    &.poetry {
      padding-left: 3em;
      &::before {
        left: 0;
      }
      }
      }
      }
```
## 配置toc到页面右边
[参考博客](https://yyqx.online/posts/%E5%8D%9A%E5%AE%A2%E4%BE%A7%E8%BE%B9%E5%AF%BC%E8%88%AA%E6%A0%8F/)
原本想实现滚动动画的，技术力不够，等大佬
### 创建mytoc.html
```html
<!-- 注意需要在页面的front-matter中toc：false并rightToc：true -->
{{ if (.Params.rightToc | default false ) }}
<div class="post-toc" id="post-toc">
  <aside>
    <header>
      <h4>文章の字数: {{ .WordCount }}</h4> 
    </header>
    {{ $emtLiPtrn := "(?s)<ul>\\s<li>\\s<ul>(.*)</li>\\s</ul>" }}
    {{ $rplcEmtLi := "<ul>$1" }}
      {{ .TableOfContents | replaceRE $emtLiPtrn $rplcEmtLi | safeHTML }}
      <!-- https://github.com/gohugoio/hugo/issues/1778#issuecomment-483880269 -->
      <!-- {{.TableOfContents}} -->
  </aside>
  <a href="#" id="toc-toggle"></a>
</div>

{{ end }}

```
### 创建single.html
```html
{{ define "main" }}
    {{ partial "pages/post.html" . }}
<!--   	将主题的single复制后新加的内容 -->
    <div class = "toc-wrapper">  
        {{ partial "mytoc.html" . }}
    </div>
{{ end }}

```
### 修改_custom.scss样式
```css
.post-toc {
  position: fixed;
  right: 5px;
  max-width: 40%;
  overflow: auto;
  top: 5%;
  width: 25vw;
  bottom: 30px
}

.toc-wrapper {
  ::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    height: 40px;
    background-color: #eee;
    border-radius: 16px;

    &:hover {
      background-color: #ddd;
    }
  }
}
@media only screen and (max-width: 1224px) {
  .post-toc {
    display: none;
  }
} 
```
## 配置豆瓣短码
### 创建douban.md
xxx\layouts\shortcodes 下创建douban.md
```html
{{ $dbUrl := .Get 0 }}
{{ $dbApiUrl := "https://neodb.social/api/" }}
{{ $dbType := "" }}

{{ if ( findRE `^.*neodb\.social\/.*` $dbUrl ) }}
    {{ $dbType = replaceRE `.*neodb.social\/(.*\/.*)` "$1" $dbUrl }}
{{ else }}
    {{ $dbType = $dbUrl }}
    {{ $dbApiUrl = "https://neodb.social/api/catalog/fetch?url=" }}
{{ end }}

<!-- {{ $dbFetch := getJSON $dbApiUrl $dbType }} -->

{{ if $dbFetch }}
    {{ $itemRating := 0 }}{{ with $dbFetch.rating }}{{ $itemRating = . }}{{ end }}
    <div class="db-card">
        <div class="db-card-subject">
            <div class="db-card-post"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="{{ $dbFetch.cover_image_url }}"></div>
            <div class="db-card-content">
                <div class="db-card-title"><a href="{{ $dbUrl }}" class="cute" target="_blank" rel="noreferrer">{{ $dbFetch.title }}</a></div>
                <div class="rating"><span class="allstardark"><span class="allstarlight" style="width:{{mul 10 $itemRating }}%"></span></span><span class="rating_nums">{{ $itemRating }}</span></div>
                <div class="db-card-abstract">{{ $dbFetch.brief }}</div>
            </div>
            <div class="db-card-cate">{{ $dbFetch.category }}</div>
        </div>
    </div>
{{else}}
    <p style="text-align: center;"><small>远程获取内容失败，请检查 API 有效性。</small></p>
{{end}}

```
### 修改custom.scss样式
在源文件下追加，修改了一些样式，使其更适配Meme
```html
// douban (api unstable)
.db-card{background:#fafafa;border-radius: 5px;}
.db-card-subject{display: flex;align-items:flex-start;line-height:1.6;padding:12px;position:relative;}
.dark .db-card{background:#252627;}
.db-card-content {flex:1 1 auto;}
.db-card-post {width: 96px;margin-right: 15px;display: flex;flex: 0 0 auto;}
.db-card-title {margin-bottom: 5px;font-size: 18px;}
.db-card-title a{text-decoration: none!important}
.db-card-abstract,.db-card-comment{font-size:14px;overflow: hidden;max-height:4rem;}
.db-card-cate{position: absolute;top:0;right:0;background:#f99b01;padding:1px 8px;font-size:small;font-style:italic;border-radius:0 8px 0 8px;text-transform:capitalize;}
.db-card-post img{margin:0;width: 96px!important;border-radius: 5px;-o-object-fit: cover;object-fit: cover;}
.rating{margin: 0 0 5px;font-size:13px;line-height: 1;display: flex;align-items: center;}
.rating .allstardark{position:relative;color: #f99b01;height: 16px;width: 80px;background-size: auto 100%;margin-right: 8px;background-repeat: repeat;background-image: url(data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxwYXRoIGQ9Ik05MDguMSAzNTMuMWwtMjUzLjktMzYuOUw1NDAuNyA4Ni4xYy0zLjEtNi4zLTguMi0xMS40LTE0LjUtMTQuNS0xNS44LTcuOC0zNS0xLjMtNDIuOSAxNC41TDM2OS44IDMxNi4ybC0yNTMuOSAzNi45Yy03IDEtMTMuNCA0LjMtMTguMyA5LjMtMTIuMyAxMi43LTEyLjEgMzIuOS42IDQ1LjNsMTgzLjcgMTc5LjEtNDMuNCAyNTIuOWMtMS4yIDYuOS0uMSAxNC4xIDMuMiAyMC4zIDguMiAxNS42IDI3LjYgMjEuNyA0My4yIDEzLjRMNTEyIDc1NGwyMjcuMSAxMTkuNGM2LjIgMy4zIDEzLjQgNC40IDIwLjMgMy4yIDE3LjQtMyAyOS4xLTE5LjUgMjYuMS0zNi45bC00My40LTI1Mi45IDE4My43LTE3OS4xYzUtNC45IDguMy0xMS4zIDkuMy0xOC4zIDIuNy0xNy41LTkuNS0zMy43LTI3LTM2LjN6TTY2NC44IDU2MS42bDM2LjEgMjEwLjNMNTEyIDY3Mi43IDMyMy4xIDc3MmwzNi4xLTIxMC4zLTE1Mi44LTE0OUw0MTcuNiAzODIgNTEyIDE5MC43IDYwNi40IDM4MmwyMTEuMiAzMC43LTE1Mi44IDE0OC45eiIgZmlsbD0iI2Y5OWIwMSIvPjwvc3ZnPg==);
}
.rating .allstarlight{position: absolute;left: 0;color: #f99b01;height:16px;overflow: hidden;background-size: auto 100%;background-repeat: repeat;background-image: url(data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxwYXRoIGQ9Ik05MDguMSAzNTMuMWwtMjUzLjktMzYuOUw1NDAuNyA4Ni4xYy0zLjEtNi4zLTguMi0xMS40LTE0LjUtMTQuNS0xNS44LTcuOC0zNS0xLjMtNDIuOSAxNC41TDM2OS44IDMxNi4ybC0yNTMuOSAzNi45Yy03IDEtMTMuNCA0LjMtMTguMyA5LjMtMTIuMyAxMi43LTEyLjEgMzIuOS42IDQ1LjNsMTgzLjcgMTc5LjEtNDMuNCAyNTIuOWMtMS4yIDYuOS0uMSAxNC4xIDMuMiAyMC4zIDguMiAxNS42IDI3LjYgMjEuNyA0My4yIDEzLjRMNTEyIDc1NGwyMjcuMSAxMTkuNGM2LjIgMy4zIDEzLjQgNC40IDIwLjMgMy4yIDE3LjQtMyAyOS4xLTE5LjUgMjYuMS0zNi45bC00My40LTI1Mi45IDE4My43LTE3OS4xYzUtNC45IDguMy0xMS4zIDkuMy0xOC4zIDIuNy0xNy41LTkuNS0zMy43LTI3LTM2LjN6IiBmaWxsPSIjZjk5YjAxIi8+PC9zdmc+);}
@media (max-width:550px) {
	.db-card{margin:0.8rem 1rem;}
	.db-card-comment{display: none;}
}

```
### 注意事项

- 所给api可能不稳定，可能需要更换。
- 也可以试试[本地缓存](https://blog.yandaojiang.com/posts/others/hugo_shortcodes%E7%A4%BA%E4%BE%8B/#%E8%B1%86%E7%93%A3%E6%9D%A1%E7%9B%AE)
- 使用：
   - {a(去掉a){< douban(shortcode_name) "https://book.douban.com/subject/35496106/">}}

参考网址：

- [文章内显示豆瓣条目](https://immmmm.com/post-show-douban-item/)
- [Hugo 豆瓣短代码](https://immmmm.com/hugo-shortcodes-douban/)
- [引入豆瓣（暂时没用）](https://www.sulvblog.cn/posts/blog/shortcodes/#5-%e5%bc%95%e5%85%a5%e8%b1%86%e7%93%a3%e9%98%85%e8%af%bb%e5%92%8c%e7%94%b5%e5%bd%b1%e5%8d%a1%e7%89%87)
