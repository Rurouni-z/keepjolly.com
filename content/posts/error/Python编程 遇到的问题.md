---
title: Python编程 遇到的问题
date: 2023-03-11 20:27:34.663
updated: 2023-03-11 20:27:34.663
url: /archives/python-problem
categories: 
- error
tags: 
- Python
- Collection
---

持续更新中
## imshow：qt.qpa.plugin: could not find the Qt platform plugin "xcb" in ""
这个问题在我用python创建的虚拟环境后碰到，无法找到解决办法，只能用conda创建虚拟环境，然后opencv可以显示图片了
> pip  install  -i  [https://pypi.doubanio.com/simple/](https://pypi.doubanio.com/simple/)  --trusted-host pypi.doubanio.com xxx-package-name
> 更新：卸载重置qt即可

## Linux pycharm opencv不显示代码提示
参考：[链接](https://blog.csdn.net/fangzhihuaa/article/details/113903689)
Linux中anaconda地址是：anaconda3安装路径/envs/虚拟环境名/lib/python版本号/site-packages/cv2
## !ssize.empty() in function resize
顾名思义，某个地方调用opencv库的resize时，传入空值，导致该错误，仔细检查传入值的数据是否为0或者None即可。
但是给的错误信息有点误导意思，因为我用的是另一个版本的opencv，还以为是版本不一致导致的错误。如下，提示的是OpenCV3.4.15版本
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311202709.jpg?imageMogr2/format/webp%7C)
## ImportError: No module named tensorflow
如果你是在jupyter notebook中出现这个错误。先看你是否安装了tensorflow 其次看你是否安装了jupyter notebook。
我用conda管理环境的时候 运行的环境里没有jupyter notebook 他估计自动调用了全局的notebook ，但是全局没有tensorflow，然后就报错了。
