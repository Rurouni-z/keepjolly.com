---
title: 微信头像透明or半透明
date: 2022-04-16 21:34:50.282
updated: 2022-04-16 21:34:50.282
url: /archives/wei-xin-tou-xiang-tou-ming-or-ban-tou-ming
categories: 
- tech
tags: 
- 
---

## 下载软件
准备工作：下载[夜神模拟器](https://www.yeshen.com/cn/download/fullPackage?formal)、下载“[安卓终端模拟器](https://f-droid.org/packages/jackpal.androidterm/)”[apk](https://f-droid.org/repo/jackpal.androidterm_72.apk)文件、下载“[豌豆荚](https://www.wandoujia.com/)”apk文件
将透明图片或者半透明图片移入夜神模拟器，（途中可能需要文件管理器的权限，直接允许即可）
## 安装apk文件
将apk文件拖入夜神模拟器中，安装**安卓终端模拟器**、**豌豆荚**。
> 注意，夜神模拟器需要安卓5.0版本的，7.0没试过，可以尝试一下

## 下载微信
豌豆荚的历史版本在微信的下载页面最下面，如果是mumu模拟器可能无法显示，需要点击安装/下载才会显示
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/profile/1650114121426-2353b685-a9cb-4f7a-8b3e-3259ad52f746.png)
在豌豆荚中下载8.06版本的**微信**，（只要能安装并且登录的就行，如果你是安卓5.0版本的，不能安装最新版微信）
安装好微信后，登录并且新设备需要接受短信（登陆的时候用鼠标点击输入框，不要用tab键或其他，可能输入没反应）
## 进行移花接木
打开安卓终端模拟器
输入“su”回车，再输入“pm uninstall -k com.tencent.mm”回车，如果无响应，新建一个窗口，或者点击那个灰色竖条
 ![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/profile/1650113645387-b4816c1d-aa98-4a76-82e6-0b49e94eac3f.png)
在win+r后输入
> **adb shell pm uninstall -k com.tencent.mm.**

点击确定
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/profile/1650113715862-a9ab8df0-474d-448c-b919-798950b46930.png)
此时微信已经卸载，并且已经保存登录状态
## 下载旧版本微信
在豌豆荚下载7.0.9版本的微信，安装完后点击打开即可进行切换头像，将你放入的头像用触摸板两指放大或者ctrl+鼠标滚轮放大，放着上下移动都可以，多试试就能出来透明头像
tips：

- 如果是黑字透明底，更换头像的时候无法显示。
- 非透明建议改成其他颜色，并且区域小一点，否则放大容易超出头像框
- iphone手机免疫一切透明	

参考链接：
[https://zhuanlan.zhihu.com/p/473839446](https://zhuanlan.zhihu.com/p/473839446)
另一个办法，比较繁琐，成功率较低：[https://zhuanlan.zhihu.com/p/445720417](https://zhuanlan.zhihu.com/p/445720417)
