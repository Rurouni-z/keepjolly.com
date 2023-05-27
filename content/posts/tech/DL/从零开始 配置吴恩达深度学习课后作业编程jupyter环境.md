---
title: 从零开始 配置吴恩达深度学习课后作业/编程/jupyter环境
date: 2022-02-22 16:47:58.541
updated: 2022-03-14 20:06:00.6
url: /archives/从零开始配置吴恩达深度学习课后作业环境
categories: 
- tech
tags: 
- Python
- ComputerVision
---

​
安装anaconda后 [Anaconda | Individual Edition ​](https://www.anaconda.com/products/individual)

将文件路径放入环境变量中

![](https://img-blog.csdnimg.cn/20210321231028426.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ0MjE0Njcx,size_16,color_FFFFFF,t_70)
​​
## 创建吴恩达课后作业的python环境

### conda创建虚拟环境
conda创建虚拟环境：[Anaconda创建环境、删除环境、激活环境、退出环境](https://blog.csdn.net/H_O_W_E/article/details/77370456)

```Batchfile
 conda create -n dl_wu python=3.6
```


> 如果遇到CondaHTTPError: HTTP 000 CONNECTION FAILED for url <https://repo.anaconda.com/pkgs/main/win-64/current_repodata.json>
Elapsed: -这个问题。

解决方法：

1. conda config --add channels r
2. 将文件内容改成
channels:
  - http://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
ssl_verify: true
show_channel_urls: true
![](https://img-blog.csdnimg.cn/7737e8ecd6b94fcba1a6c0bdf29700e2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAWl90aW1lcg==,size_20,color_FFFFFF,t_70,g_se,x_16)
参考网址：
[CondaHTTPError: HTTP 000 CONNECTION FAILED for url <https://repo.anaconda.com/pkgs/main/win-64/current_repodata.json Elapsed: >-错误解决方法](https://www.cnblogs.com/Yefudaling/p/12422210.html)
[Anaconda 解决 “CondaHTTPError: HTTP 000 CONNECTION FAILED for url“ 问题 | 解决spyder无法更新到最新版本](https://blog.csdn.net/weixin_44510468/article/details/107103783)

###  安装tensorflow、keras
python和tensorflow对应的版本：[TensorFlow的历史版本与对应Python版本](https://blog.csdn.net/baishuiniyaonulia/article/details/118977952)
keras和tensorflow对应的版本：[Tensorflow | TF与Keras版本对应](https://blog.csdn.net/weixin_43360896/article/details/114333831)

这里我装的是**tensorflow1.14和python3.6**

（不小心删掉pip的话 我是更新失败了就没了：[python pip报错 Cannot open Scripts\pip-script.py](https://blog.csdn.net/myhes/article/details/106582262)
更新用这个语句：
```batchfile
python -m pip install --upgrade pip
```
）

另外装tensorflow的时候遇到这个问题
![](https://img-blog.csdnimg.cn/8d2c6dd34d5f491fa737ad454bd44aa7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAWl90aW1lcg==,size_20,color_FFFFFF,t_70,g_se,x_16)
解决方法：pip config set install.trusted-host https://pypi.tuna.tsinghua.edu.cn/simple
（清华源感觉不好用 可以试试豆瓣源）
（小技巧：win键+v 调出粘贴板，旁边三个小点点可以选择固定）
参考链接：[公司内网 pip 永久设置 指定源和trusted-host](https://blog.csdn.net/qq_31720305/article/details/106386078)

### 最后
其他包 缺啥安啥就行
豆瓣源：pip install -i https://pypi.douban.com/simple/ 包名


​
