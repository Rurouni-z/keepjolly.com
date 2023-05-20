---
title: picgo安装插件不成功
date: 2022-05-31 21:39:04.656
updated: 2022-05-31 21:47:49.634
url: /archives/picgo-install-plugin
categories: 
- 问题集锦
tags: 
- 博客
---

[安装picgo](https://cloud.tencent.com/developer/article/1834573)
一开始发现picgo-plugin-super-prefix-master这个插件，故安装，因为从github上下下来，所以采取了本地上传插件进行安装，这一步坑死我了。
<a name="s1Nqf"></a>
## super-prefix安装
在插件设置里输入**super-prefix**，搜索后即可安装成功，注意作者是gclove
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531213739.png?imageMogr2/format/webp)
<a name="rw9zn"></a>
### 遇到的坑
我是直接在GitHub上[download](https://github.com/gclove/picgo-plugin-super-prefix/archive/refs/heads/master.zip)下来，然后本地上传，非常不建议本地上传，有bug
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531213739-1.png?imageMogr2/format/webp)
<a name="mt5Ag"></a>
### 修改package.json
在这个路径C:\Users\xxxx\AppData\Roaming\picgo下找到package.json，首先将里面的本地上传的super-prefix删除(ctrl+f 查找即可)，如果没有也没事
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531213739-2.png?imageMogr2/format/webp)
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531213739-3.png?imageMogr2/format/webp)
<a name="xPSIg"></a>
### 删除node_modules中的.package-lock.json的字段值
1.先从[第一步](#s1Nqf)从搜索栏安装后
2.错误复现不了了，总之在文件最上面会有个../.../destop/picgo-plugin-super-prefix的一串代码，一直删除**{  xxxxx},**为止,然后重启软件即可
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531213739-4.png?imageMogr2/format/webp)
<a name="WI8eW"></a>
## pic-migrate安装
安装照上面来即可，但是安装完成后记得配置它，文件名后缀任意即可
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/2022/0520220531213739-5.png?imageMogr2/format/webp)