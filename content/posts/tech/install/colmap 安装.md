---
title: colmap 安装
date: 2024-01-17 23:07:42 +0800
lastmod: 
summary: 
url: 
slug: colmap-install
toc: true
rightToc: false
categories: 
- tech
tags: 
- Install
original: true
author: Rurouni
website: www.keepjolly.com
---

## 预准备

环境：
- Ubuntu 18.04
- cuda11.3
- gcc7.5
- qt5.14.2
- 不必一致
[安装教程](https://colmap.github.io/install.html)

```bash
sudo apt-get install \
    git \
    cmake \
    ninja-build \
    build-essential \
    libboost-program-options-dev \
    libboost-filesystem-dev \
    libboost-graph-dev \
    libboost-system-dev \
    libeigen3-dev \
    libflann-dev \
    libfreeimage-dev \
    libmetis-dev \
    libgoogle-glog-dev \
    libgtest-dev \
    libsqlite3-dev \
    libglew-dev \
    qtbase5-dev \
    libqt5opengl5-dev \
    libcgal-dev \
    libceres-dev
```

## 安装colmap

[参考](https://github.com/colmap/colmap/issues/2148)

- colmap新版本没有dev环境

```bash
git clone --branch 3.8 https://github.com/colmap/colmap.git --single-branch

cd colmap && \
	mkdir build && \
	cd build && \
	sudo cmake .. -DCMAKE_CUDA_ARCHITECTURES=native && \
	sudo make -j$(nproc) && \
	sudo make install
```

## 遇到的错误

- /usr/lib/x86_64-linux-gnu/libQt5Core.so.5: version \`Qt_5.14.2\` not found
	- https://github.com/colmap/colmap/issues/153
```bash
set(Qt5_CMAKE_DIR "/path/to/your/qt/lib/cmake")
set(Qt5Core_DIR ${Qt5_CMAKE_DIR}/Qt5Core)
set(Qt5OpenGL_DIR ${Qt5_CMAKE_DIR}/Qt5OpenGL)
```
- No CMAKE_CUDA_COMPILER could be found
	- sudo vim /etc/environment
	- add "CUDACXX=/usr/local/cuda/bin/nvcc"
	- path to your cuda
	- https://github.com/jetsonhacks/buildLibrealsense2TX/issues/13
