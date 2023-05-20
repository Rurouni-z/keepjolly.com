---
title: 形态学--腐蚀运算详细过程
date: 2022-05-10 20:04:00.648
updated: 2022-05-10 20:17:05.138
url: /archives/morphology-erosion
categories: 
- 应用
tags: 
- Python
- 计算机视觉
---

在网上翻看许多，都是只讲定义，不讲过程，故我根据一道题目来详细介绍如何进行腐蚀运算，膨胀运算与腐蚀运算差不多就不多加赘述了。
题目如下：
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/erode/1652099989022-aeabc97e-01aa-439e-8731-a6a82f1519f6.png?imageMogr2/format/webp)
程序如下：
```python
import numpy as np
import cv2

A = np.array(
    [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
     [0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
     [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
     [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0],
     [0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
     [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], np.uint8)
Ac = 1 - A
print(A)
print(Ac)
# print(np.pad(Ac, (1, 1), mode='constant', constant_values=(1, 1)))
print()
T1 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], np.uint8)
T2 = np.array([[1, 0, 1], [0, 0, 0], [1, 0, 1]], np.uint8)
img1 = cv2.erode(A, T1)
# 事实上这里是cv2.erode(Ac, T2, borderValue=1)
img2 = cv2.erode(Ac, T2)
print(img1)
print(img2)
print()
print(img1 & img2)
```
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/erode/1652178834944-470bbccb-eeb8-45a6-866d-ad0f0bb5cb75.png?imageMogr2/format/webp)
## 产生img1
首先讲img1是如何出来的。（安利一个截图神器，**snipaste**）
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/erode/1652178700984-15502084-6486-4bdd-8d9d-e249cc5ed697.png?imageMogr2/format/webp)
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/erode/1652176451686-49ddb2db-2548-41de-85d0-4da0e36557e4.png?imageMogr2/format/webp)
图片我个人感觉很清晰了，除了有点乱。顺序从红色字→绿色字→蓝色字→紫色字→白色字
> 疑问解决：
[Eroding and Dilating](https://docs.opencv.org/4.x/db/df6/tutorial_erosion_dilatation.html)
[cv2.erode参数解释](http://opencv.jp/opencv-2.2_org/cpp/imgproc_image_filtering.html#cv-erode)
如果无指定，默认为结构元素中点

## 产生img2 
接下来是img2，原理差不多，除了一开始遇到补集，看到好多1有点慌。
**注意：当遇到这种情况，opencv会为图像扩充边界，其值为1.**
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/erode/1652183808346-615c12e5-15d4-4549-973c-41aede64701a.png?imageMogr2/format/webp)
图中不同颜色的矩阵大部分值不变，是因为在每次比较都是比较原图，而不是修改后的图。
## 求并集
全为1才为1
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/erode/1652183929130-f20288b6-083c-47c2-b19b-758cb542ec58.png?imageMogr2/format/webp)