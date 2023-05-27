---
title: hugo主题-meme配置
date: 2023-05-24 21:51:34 +0800
lastmod: 
summary: 
slug: hugo_theme_meme_configuration
draft: false
categories: 
- tech
tags: 
- Blog
- Hugo
original: true
author: Rurouni
website: www.keepjolly.com
---
## 安装git和go
### Installing on Windows git
[官方文档](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
There are also a few ways to install Git on Windows. The most official build is available for download on the Git website. **Just go to** [https://git-scm.com/download/win](https://git-scm.com/download/win) and **the download will start automatically.** Note that this is a project called Git for Windows, which is separate from Git itself; for more information on it, go to [https://gitforwindows.org](https://gitforwindows.org/).
To get an automated installation you can use the [Git Chocolatey package](https://community.chocolatey.org/packages/git). Note that the Chocolatey package is community maintained.
### Go installation
[官方文档](https://go.dev/doc/install)
[download go](https://go.dev/dl/)

1. Open the MSI file you downloaded and follow the prompts to install Go.By default, **the installer will install Go to Program Files or Program Files (x86)**. You can change the location as needed. After installing, you will need to close and reopen any open command prompts so that changes to the environment made by the installer are reflected at the command prompt.(安装完成后关闭所有cmd)
2. Verify that you've installed Go.
   1. In **Windows**, click the **Start** menu.
   2. In the menu's search box, type cmd, then press the **Enter** key.
   3. In the Command Prompt window that appears, type the following command:
>  go version

   4. Confirm that the command prints the installed version of Go.

![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230524215116.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
## 安装hugo
[官方文档](https://gohugo.io/installation/windows/)
Prebuilt binaries are available for a variety of operating systems and architectures. Visit the [latest release](https://github.com/gohugoio/hugo/releases/latest) page, and scroll down to the Assets section.
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230524215116-1.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

1. Download the archive for the desired [edition](https://gohugo.io/installation/windows/#editions), operating system, and architecture
2. Extract the archive
3. Move the executable to the desired directory
4. Add this directory to the PATH environment variable
   1. ![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230524215116-2.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
   2. 不想配置Path可以在hugo安装位置处点击文件夹路径再输入cmd
5. Verify that you have execute permission on the file

Please consult your operating system documentation if you need help setting file permissions or modifying your PATH environment variable.
If you do not see a prebuilt binary for the desired edition, operating system, and architecture, install Hugo using one of the methods described below.
## 创建hugo文件 && 创建MemE主题
在你的博客文件夹中右键git bash here
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230524215116-3.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
输入
> hugo new site blog （创建blog文件夹并放入hugo文件）

注意文件夹名称不要起hugo
### 安装 MemE

1. cd blog
2. git init
3. git submodule add --depth 1 https://github.com/reuixiy/hugo-theme-meme.git themes/meme
4. rm config.toml && cp themes/meme/config-examples/zh-cn/config.toml config.toml
### 新建文章
hugo new "posts/hello-world.md"
hugo new "about/_index.md"
### 启动服务
hugo server -D
### 配置github action
详见此处
## 将hugo配置到其他地方
### 对象存储 COS
未实现，先[mark](https://blog.xm.mk/posts/fc83/)
### IPFS 网络
未实现，先[mark](https://io-oi.me/tech/host-your-blog-on-ipfs/)
## 图床不显示图片
**原因不明，不能复现问题**
我使用的是腾讯云的图床，但是部署到github发现不能使用
最后将config.toml中的enableMediumZoom = false置为false即可（true也没事）
可能是防盗链的关系
