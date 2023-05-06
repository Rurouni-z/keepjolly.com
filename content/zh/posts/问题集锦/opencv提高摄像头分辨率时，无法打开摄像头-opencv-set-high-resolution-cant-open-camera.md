---
title: opencv提高摄像头分辨率时，无法打开摄像头
date: 2022-11-16 16:40:52.665
updated: 2022-11-16 16:52:21.056
url: /archives/opencv-set-high-resolution-cant-open-camera
categories: 
- 问题集锦
tags: 
- Python
- opencv
---

前言
本文环境是win7，opencv-python，有两个摄像头设备
参考链接：

- [万能的StackOverflow-1](https://stackoverflow.com/questions/19448078/python-opencv-access-webcam-maximum-resolution)
- [万能的StackOverflow-2](https://stackoverflow.com/questions/29664399/capturing-video-from-two-cameras-in-opencv-at-once)
## 遇到的问题
win7设备上需要调高摄像头分辨率，有两个摄像头，一个固定一个usb，但是只能控制在640 x 480，才能两个都能使用，否则调整随机调整摄像头分辨率两个都无法点亮。并且在win10使用单个摄像头，修改为3000 x 2000 输出的图片分辨率可以直接自适应为2048 x 1536，可以点亮摄像头。
## 解决办法一
因为要对程序做迁移，但是在win10上可以直接任意设置分辨率来时opencv自适应摄像头最大分辨率，但是在win7无法实现，所以设定分辨率为固定值

- 640 x 480
- 800 x 600
- 1024 x 768
- 1280 x 960
- 1920 x 1080
- 2048 x 1536
- .....
- 注意越大分辨率需求的算力越大，以及有些分辨率可能不是通用，可以多试试
- 或者在代码上多设置几个大整数，然后get CV_CAP_PROP_FRAME_WIDTH，输出看一下，摄像头的分辨率是多少
```python
cap = cv2.VideoCapture(0)
print("Frame default resolution: (" + str(cap.get(cv.CV_CAP_PROP_FRAME_WIDTH)) + "; " + str(cap.get(cv.CV_CAP_PROP_FRAME_HEIGHT)) + ")")
cap.set(cv.CV_CAP_PROP_FRAME_WIDTH, 800)
cap.set(cv.CV_CAP_PROP_FRAME_HEIGHT, 600)
```
## 解决办法二
未经测试，就是有多个摄像头设备的时候，占用一个总线，所以导致冲突了，多添加一个usb card（我也不知道是啥，可能是usb接口）
[https://stackoverflow.com/a/29702444](https://stackoverflow.com/a/29702444)