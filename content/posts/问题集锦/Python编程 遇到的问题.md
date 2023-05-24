---
title: Python编程 遇到的问题
date: 2023-03-11 20:27:34.663
updated: 2023-03-11 20:27:34.663
url: /archives/python-problem
categories: 
- 问题集锦
tags: 
- Python
---

持续更新中
## imshow：qt.qpa.plugin: could not find the Qt platform plugin "xcb" in ""
这个问题在我用python创建的虚拟环境后碰到，无法找到解决办法，只能用conda创建虚拟环境，然后opencv可以显示图片了
>  pip  install  -i  [https://pypi.doubanio.com/simple/](https://pypi.doubanio.com/simple/)  --trusted-host pypi.doubanio.com xxx-package-name

## Linux pycharm opencv不显示代码提示
参考：[链接](https://blog.csdn.net/fangzhihuaa/article/details/113903689)
Linux中anaconda地址是：anaconda3安装路径/envs/虚拟环境名/lib/python版本号/site-packages/cv2
## !ssize.empty() in function resize
顾名思义，某个地方调用opencv库的resize时，传入空值，导致该错误，仔细检查传入值的数据是否为0或者None即可。
但是给的错误信息有点误导意思，因为我用的是另一个版本的opencv，还以为是版本不一致导致的错误。如下，提示的是OpenCV3.4.15版本
![da3de5c330013051f9be766648ade55.jpg](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/03/20230311202709.jpg?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
