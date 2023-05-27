---
title: picgo进阶玩法+腾讯云
date: 2022-05-31 22:36:39.402
updated: 2022-05-31 22:45:13.465
url: /archives/picgo-jin-jie-wan-fa--teng-xun-yun
categories: 
- error
tags: 
- Blog
- Picgo
---

参考链接：

- [借助数据万象（原万象优图），让 hexo 也用上 webp](https://cloud.tencent.com/developer/article/1474450)
- [Base64编码解码](https://tool.chinaz.com/tools/base64.aspx)
- [自定义链接格式](https://www.google.com/search?q=picgo%E8%87%AA%E5%AE%9A%E4%B9%89%E9%93%BE%E6%8E%A5%E6%A0%BC%E5%BC%8F&oq=picgo%E8%87%AA%E5%AE%9A%E4%B9%89%E9%93%BE%E6%8E%A5%E6%A0%BC%E5%BC%8F&aqs=chrome..69i57j69i61l2.6215j0j4&sourceid=chrome&ie=UTF-8)
- [添加盲水印](https://cloud.tencent.com/document/api/436/46782)
- [阿里云+picgo+自定义链接](https://tin6.com/post/output-webp-format-images-based-on-alibaba-oss/)
- [盲水印价格](https://cloud.tencent.com/document/product/460/58117)
- [数据万象常见问题](https://cloud.tencent.com/document/product/460/32832)

因为想着今晚已经浪费好长时间了，索性把picgo上传图片优化一下。
## 无法上传图片
> TypeError: Cannot create property ‘xxx’ on string

启用[兼容模式](https://zhuanlan.zhihu.com/p/489236769)打开软件，我选的是Windows8

## 上传图片为webp格式并加盲水印
在图床设置下选择腾讯云cos，设定网址后缀如下：?imageMogr2/format/webp|?watermark/3/type/3/text/XXXX

- |?watermark/3/type/3/text/XXXX：生成盲水印，另外盲水印目前的价格是添加盲水印：1元/千次 提取盲水印：1元/千次
- XXXX记得通过上述的[Base64编码解码](https://tool.chinaz.com/tools/base64.aspx)生成你的base64字符串
- 官方文档好像不可以https开头，目前用$url没有什么问题
- 微信小程序的多处理规则无效应该怎么办？
   - 解决方案如下：
      - 使用样式。
      - 把操作符 “|” 替换成 “%7C”。

![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531224449.png?imageMogr2/format/webp|?watermark/3/type/3/text/a2VlcGpvbGx5)

## 提取盲水印
因为需要别人拿我的照片，并且要上传到他的cos才能提取盲水印
这里放链接：[Link](https://cloud.tencent.com/developer/article/1416987)、[Link2](https://cloud.tencent.com/document/api/436/46782#.E6.8F.90.E5.8F.96.E7.9B.B2.E6.B0.B4.E5.8D.B0)
