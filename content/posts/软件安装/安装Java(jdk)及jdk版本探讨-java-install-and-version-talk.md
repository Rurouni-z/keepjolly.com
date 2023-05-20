---
title: 安装Java(jdk)及jdk版本探讨
date: 2022-03-13 18:16:11.921
updated: 2022-03-13 18:39:21.364
url: /archives/java-install-and-version-talk
categories: 
- 软件安装
tags: 
---


[JAVA安装](https://segmentfault.com/a/1190000039862163) 首推
[JAVA安装](https://juejin.cn/post/6844903937095499789) 
不知道你们注意到安装完java后会出现两个jre文件，特地去Google一下：[网址](https://blog.csdn.net/weixin_45948234/article/details/111474003)
放在jdk文件里的jre文件夹是专用jre，它是用于开发java程序用
而与jdk同文件夹下的jre文件是公用jre，它是为了运行操作系统中的程序。
<table><tr>
<td><img src="https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo%2Fblog%2Fjava_version%2Fimage.png" width = "154" height = "86" /></td>
<td><img src="https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo%2Fblog%2Fjava_version%2Fimage%20(1).png" width = "154" height = "86"/></td>
</tr></table> 
注意平时所说的“java自动更新”不是所安装的JDK版本的更新，它指的是这个公用JRE运行时环境的更新，这个更新让你的计算机能够使用最新版本正常的运行一些网站或则Web应用等等当中的java程序

---

安装教程随处可见，这里重点讲一下java的版本号的区别（虽说也是能Google到，但还是留个档）
[参考博客](https://www.jianshu.com/p/661dcc6e73ee)1、[参考博客](https://www.modb.pro/db/85249)2、[参考博客](https://candy.blog.csdn.net/article/details/110434437)3
## (1) Java与JDK的区别与关系
Java等价于JDK。
## (2) JDK8与JDK1.8的区别与关系
JDK8或者JDK1.8也是同一个东西。
## (3) JDK与J2SE的区别与关系
Java（即JDK）有3个版本：J2SE(Java Platform，Standard Edition)、J2EE(Java Platform，Enterprise Edition)、J2ME(Java Platform，Micro Edition)，所以J2SE是3个版本中的其中一个，即标准版本。
## (4) java jdk-XXXX-i586与jdk-XXXX-x64区别?
i586是32位系统、x64是64位系统
## (5) java jdk-XXXX-aarch64与jdk-XXXX-x64区别?(Linux)
x86_64就是我们常用的台式机的体系架构，是基于冯诺依曼体系架构的。x86_64 Linux可以理解为在普通台式机上安装的Linux操作系统。
AArch64是一种ARMv8架构，也是一种计算机的体系架构。AArch64 Linux可以理解为在ARMv8架构的计算机上安装的Linux操作系统。
使用$ arch可查看Linux版本 图片来自：[网址](https://candy.blog.csdn.net/article/details/110434437)
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo%2Fblog%2Fjava_version%2Fimage%20(2).png)

注意JDK8u202以下是免费的，往上就要商业付费，个人使用不需要

图片并排显示：
```html
<table><tr>
<td><img src=pic1.jpg border=0></td>
<td><img src=pic2.jpg border=0></td>
</tr></table>

```
