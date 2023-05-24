---
title: Halo博客搭建---一个属于自己的网站
date: 2022-03-19 20:11:01.786
updated: 2022-03-28 18:19:32.685
url: /archives/halo-blog-build-a-website-of-your-own
categories: 
- 博客
tags: 
- 博客
- 服务器
---

概要：本博客使用Halo搭建，域名通过name.com进行购买，使用cloudflare进行cdn代理，服务器是阿里云的，对象存储用的是腾讯云的按量付费50g。
## 购买域名
首先，当然是买个域名啦，可以选择国内网址，但是要备案，好处就是国内比较便宜，备案也较为轻松，也可以选国外网址，不需要备案，而且更加随心所欲一点。
### 域名网址
我这里用的是name.com买的网址。这是我的[分享链接](https://www.name.com/zh-cn/referral/4777a0)，（购买会便宜36，当然我也有点小利润）

1. 先输入你心仪的域名，如keepjolly.com，他就会告诉你这个域名是否被购买，以及其他后缀的域名。.com后缀会稍微贵一些，其他域名会便宜点

![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647478544371-b15bcc98-d75f-4518-b060-81b0e49a448.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

2. 点击加入购物车，然后点上面的购物车图标，（~~如果点击结账，就会跳转到下面的界面，然后点击购物车）~~

![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647478668852-d7030955-903f-4fec-a4d2-1acbe13a5cf.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
这是点击结账的页面。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647478849173-0d1cebce-d2f6-4012-8b9e-d85a3dd6484.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

3. 选择你要购买几年，如果有信心运营下去的话，建议多买几年，首先买一年试试水吧

![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647479212000-92c67d24-48fe-420a-a3ef-fabb6bf6785.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
促销码可以Google一下，我当初便宜了一年的Advanced Security + Privacy
> [**促销码**](https://www.pigji.com/970.html)**：**PRIVACYPLEASE 减去那个附加项、RENEW 续费便宜15%
> 联合使用的话，先renew，然后在域名管理页再续费privacy，（目前还没试过）

然后就可以付款了。

5. 付款可以选择支付宝，然后就不截图了。
- 买后之后（因为我是买后再写博文，所以没有买后的跳转页面，我这里直接放上域名管理页面）
6. 这是域名管理页面，一般都是自动勾选上的，自动续订需要绑信用卡，下面的域名服务器等下要替换成cloudflare。

![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647479816157-6c619eb3-6ac5-481d-9b20-01e8008d90c.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

8. 域名购买就到这里结束了
## 给域名套上cdn
因为我的是国外域名，所以弄了个国外的cdn，如果是在国内购买域名，建议选国内的cdn（另外也有可能买服务器或者域名会送cdn服务）。（另外有大佬也说，套国外的cdn对国内会影响访问速度，而且也不需要ddos防御，毕竟小网站，但最后反正也免费，索性就配置一下）。
### 注册cloudflare
这里就不说了，这都不会建议别套cdn了😂。这个cdn网站还有中文
### 添加要加速的网站
就是添加站点把你的网址输入进去即可。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647678898220-72a625f4-fe2e-4b61-8283-7aa7a529a92.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647678926632-fc7efa34-73c8-4b13-a493-44fb7d8d9f5.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
### 选择付费计划
白嫖怪当然选择免费计划啦，主要就是防止ddos攻击。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647678991846-3de9b528-b0d0-442d-8baf-56bbf709784.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
如果是国外的域名购买网站如**namesilo**、**godaddy**，[Link here](https://zhuanlan.zhihu.com/p/82909515)
这里展示一下name、和阿里云的。
### 查看dns记录
建议也用上面那个[链接](https://zhuanlan.zhihu.com/p/82909515)，这里我因为点了返回，直接进入下一步了。
### 完成名称服务器设置
复制cloudflare的名称服务器，一共两条
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647679682736-dcf7e621-ad70-43a8-836e-8cd77d8ca9a.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
#### name.com
选择最下面的管理域名服务器
![](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647479816157-6c619eb3-6ac5-481d-9b20-01e8008d90c.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
添加刚刚复制的那两条，添加完成后，cloudflare就能托管你的网站了
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647679555669-05837aa9-f21d-47ba-a048-37bca41fe6d.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
#### aliyun.com
首先当然是登录啦，登陆成功后点击第一步的“我的阿里云”。然后如果你买了域名的话，在第二步应该能看见你的域名“控制台”，点进去。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647679994486-135aa6df-07e6-4841-9378-34045cbe627.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
然后在域名列表里，点击你的网址，（国内记得备案哦，备案就不介绍了，网上查一查吧）
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647680196991-8e454160-3098-49af-a2ee-7442090604e.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
点击“修改DNS”
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647680333113-1d31d213-4aa2-4363-8e2f-d756437c988.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
复制cloudflare 的名称服务器，cv就完事了
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647680378484-860a8dab-4a40-4ce6-8175-afe678410d4.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
### cloudflare快速入门指南
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647681427107-a50d0a29-5875-4f05-9321-7a11301cc24.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
全选是就行了，最后就是这样子。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647681454195-05f18d32-f98b-4ec7-bf7e-f8f8a0c677f.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

### 其他设置
参考上面的[link](https://zhuanlan.zhihu.com/p/82909515)（快速入门指南以及包括了大部分了）。另外，如果需要进行端到端加密的话，[官网](https://developers.cloudflare.com/ssl/get-started/)是这样子介绍的，我因为有段时间没弄这篇博客，有点忘记怎么弄了。这里就给个[本机生成SSL证书](https://www.keepjolly.com/archives/openssl-install-and-get-sslcert)，（好像大概率用的是宝塔自动产生的SSL证书），但是具体怎么套入，_看看官网，或者我帮你试试_。另外自己的域名购买网站记得加上SSL证书，这里也不说了，应该把本机生成的放进去就好了，或者宝塔里的，（时间有点久，不知道怎么操作了，抱歉）。另外看到阿里云有付费的SSL证书，Google后，其实免费的对于个人博客来说就够了。
#### 阿里云的SSL证书签发
点击开启SSL证书
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647689548378-792215e1-893a-4eba-b633-1d450932352.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
买免费的就行了
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647689583445-23346d75-42af-43ec-bfbb-98cabf4b472.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
点证书申请，然后输入你的域名，然后下一步
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647689690408-355ef6bb-c990-4560-9eec-370a866a25c.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
然后在cloudflare的DNS记录里新建txt，对应cv就行了。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647689819411-a415d0f3-17d4-4b0d-8832-f2dccfd9380.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
## 购买服务器
这里选的是[阿里云](https://www.aliyun.com/daily-act/ecs/activity_selection?userCode=d2oiabj6)的，如果需要国外的，点更多商品。下面的点开后，我选的是ECS突发性能型 t6 - 新加坡，下面是我的配置，因为没有新用户，很贵。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/halo/1647690726368-f4597509-3045-434b-bd9a-b55fc7df890e.png)
## 搭建博客
这里推荐一个up，[BV1JN411Q7Na](https://www.bilibili.com/video/BV1JN411Q7Na?p=4)（[文字版](https://www.wjcms.net/archives/%E4%BB%8E%E9%9B%B6%E7%BA%BF%E4%B8%8A%E9%83%A8%E7%BD%B2halo%E5%8D%9A%E5%AE%A2%E5%8C%85%E5%90%ABhalo%E5%8D%9A%E5%AE%A2%E8%AE%BE%E7%BD%AE%E5%9F%9F%E5%90%8D%E8%AE%BF%E9%97%AE)建议两者结合），我时隔已久，而且已经是装完的状态了，所以无法展示了。按照他的来可以搭建出来Halo的博客，但后来我记得部署完halo后，halo页面无法显示，可能按照清缓存，重启服务器，等待一会儿就行了。
啊啊啊，原本想从0开始搭建出自己的博客来着，属于是推着推着就忘了好多。如果有需要，我可以帮你尝试一下建博客（不保证行不行，因为我也是看网上教程来的）。
## 对象存储
国外买国外的存储桶，记得开防盗链，然后用[picgo](https://github.com/PicGo/PicGo-Core)管理，插件是[picgo-plugin-pic-migrater](https://github.com/PicGo/picgo-plugin-pic-migrater/blob/master/README_CN.md)它可以将语雀导出的markdown里的图片自动上传到存储桶，并新建一个.md文件，如果导入图片不显示，可能是你的链接没有https://。
## 博客主题
[joe2.0](https://qinhua.github.io/halo-theme-joe2.0/#/)
## 搜索引擎检索
这里只在[必应](https://www.bing.com/webmasters/home)（可以直接从你的Google里导入，但还是得把你网站地图放进去https://www.你的域名/sitemap.xml ）、[Google](https://search.google.com/)、[百度](https://ziyuan.baidu.com/dashboard)上弄了，
![](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo%2Fblog%2Fhalo%2Fgoogle-search.jpg)
