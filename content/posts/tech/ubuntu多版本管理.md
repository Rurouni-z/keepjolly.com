---
title: ubuntu多版本管理
date: 2023-05-28 09:33:29 +0800
lastmod: 2023-06-10 22:41:12 +0800
summary: ubuntu多版本管理GCC、OpenCV、Cuda
url: 
slug: Ubuntu-multi-version-management
toc: true
rightToc: false
categories: 
- tech
tags: 
- Ubuntu
- C++
original: true
author: Rurouni
website: www.keepjolly.com
---
> 默认已安装
> sudo apt-get install build-essential
> sudo apt-get install cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
> sudo apt-get install python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev



## 管理GCC

1. 前提是安装了多个gcc版本，可采取如下命令
> sudo apt-get install gcc-11 g++-11

2. 然后选择要使用的gcc版本
> update-alternatives _--config gcc_

3. 输入你想使用的版本的序号，如1
4. 查看当前版本
> gcc -v

[参考链接](https://lantern.cool/tool-linux-muti-gcc/index.html)
## 管理opencv

1. 下载[源文件](https://github.com/opencv/opencv/archive/3.4.15.zip)，本文选的是opencv3.4.15 `..source..`版本
2. 在任意目录下创建存放opencv安装路径
```bash
conda deactivate
mkdir otherpackages
cd otherpackages
mkdir opencv3.4.15
```

3. 解压缩opencv-3.4.15.zip文件
```bash
cd opencv-3.4.15
mkdir build
cd build
```

4. cmake opencv
```bash
cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX="/home/yourusername/otherpackages/opencv3.4.15"  ..
```

5. 编译 && 安装
```bash
make -j8 && sudo make install
```
没报其他错误的话，OpenCV已经顺利被安装到自定义路径otherpackages/opencv3.4.15中了

6. 使用opencv
   1. 将otherpackages中的opencv3.4.15复制到项目路径
      1. 在qt.pro中粘贴代码
```bash
INCLUDEPATH += ./opencv3415/include \
               ./opencv3415/include/opencv \
               ./opencv3415/include/opencv2

LIBS += -L./opencv3415/lib -lopencv_core -lopencv_highgui \
        -lopencv_imgcodecs -lopencv_imgproc -lopencv_videoio \
```

      2. 如果是cmake
```bash
include_directories(
    ${CMAKE_SOURCE_DIR}/./opencv3415/include
)

set(link_libs  ${CMAKE_SOURCE_DIR}/./opencv3415/lib/libopencv_core.so
               ${CMAKE_SOURCE_DIR}/./opencv3415/lib/libopencv_highgui.so
               ${CMAKE_SOURCE_DIR}/./opencv3415/lib/libopencv_imgcodecs.so
               ${CMAKE_SOURCE_DIR}/./opencv3415/lib/libopencv_imgproc.so
               ${CMAKE_SOURCE_DIR}/./opencv3415/lib/libopencv_videoio.so
)

add_executable(main  ./main.cpp)
target_link_libraries(main ${link_libs})
```
 [参考博客](https://zhuanlan.zhihu.com/p/510292490)
## 管理cuda

1. 删除原软链接
> cd /usr/local
> sudo unlink cuda

2. 建立新链接
> sudo ln -snf /usr/local/`..cuda-xx..` /usr/local/cuda
> cuda-xx是文件夹名

3. 查看当前版本
> nvcc -V

[参考链接](https://zhuanlan.zhihu.com/p/410764884)
