---
title: 查看tag
date: {{ dateFormat "2006-01-02" .Date }}
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
