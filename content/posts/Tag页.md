---
title: 查看tag
date: 2023-05-20 21:33:52 +0800
lastmod: 
summary: 
slug: showtag
draft: false
categories: 
- 技巧
tags: 
- '博客'
original: true
author: Rurouni
website: www.keepjolly.com
---
<ul>
  {{ with .Param "tags" }}
    {{ range $index, $tag := (. | sort) }}
      {{ with $.Site.GetPage (printf "/%s/%s" "tags" $tag) }}
        <li><a href="{{ .Permalink }}">#{{ $tag | urlize }}</a></li>
      {{ end }}
    {{ end }}
  {{ end }}
</ul>