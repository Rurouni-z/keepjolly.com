---
title: zmq 小白简易安装C++版
date: 2023-05-26 20:55:03 +0800
lastmod: 
summary: 
slug: zmq-install
draft: false
categories: 
- tech
tags: 
- Install
original: true
author: Rurouni
website: www.keepjolly.com
---
主要参考博客:[ 在cmake工程中使用ZeroMQ](https://www.cnblogs.com/y4247464/p/14241876.html),并加以补充
次要博客:[Linux下ZeroMQ的编译安装与运行](https://blog.csdn.net/qq_41453285/article/details/105989698)
文中提到arm,我只装在linux系统上，原本想用在通信中，最后还是用tcp实现了
# 安装libzmq

1. git clone [https://github.com/zeromq/libzmq.git](https://github.com/zeromq/libzmq.git) 
   1. 在当前文件夹内下载libzmq文件夹,建议先cd到你想要放的文件夹
2. cd libzmq
3. ./autogen.sh
4. ./configure
## 安装zmqpp

1. git clone [https://github.com/zeromq/zmqpp.git](https://github.com/zeromq/zmqpp.git)
   1. 同理,找个文件夹放
2. make -j4 && sudo make install

上述安装完成后查看头文件和库文件路径
> 如果当前在用户路径下 cd ../../user

> 头文件路径 ： /usr/local/include
> 库文件路径 : /usr/local/lib

## CMakeList.txt
```cmake
cmake_minimum_required(VERSION 3.10)

if (CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64")
    set(ARCH_DIR x86)
else()
    set(ARCH_DIR arm)
endif()

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS}")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")


include_directories(
    ${CMAKE_SOURCE_DIR}/../opencv3415/include
)

set(link_libs  ${CMAKE_SOURCE_DIR}/../opencv3415/lib/libopencv_core.so
               ${CMAKE_SOURCE_DIR}/../opencv3415/lib/libopencv_highgui.so
               ${CMAKE_SOURCE_DIR}/../opencv3415/lib/libopencv_imgcodecs.so
               ${CMAKE_SOURCE_DIR}/../opencv3415/lib/libopencv_imgproc.so
               ${CMAKE_SOURCE_DIR}/../opencv3415/lib/libopencv_videoio.so
               zmq
               zmqpp
    )

add_executable(server src/Server.cpp)  # 可执行文件server .cpp文件路径
target_link_libraries(server PRIVATE ${link_libs})




```
## server.cpp简易案例
### server
```cpp
#include <iostream>
#include <zmqpp/zmqpp.hpp>
#include <thread>
#include <opencv2/opencv.hpp>
#include <mutex>

using namespace std;
using namespace cv;

 int main() {
   zmqpp::context context;
   zmqpp::socket_type type = zmqpp::socket_type::rep;
   zmqpp::socket socket(context, type);
   std::string address = "tcp://*:5555";
   socket.bind(address);
      while (true) {
         zmqpp::message message;
         socket.receive(message);
         std::string image_data;
         message.get(image_data, 0); // use get() to retrieve message content
         td::cout << "Received image with size " << image_data.size() << " bytes" << std::endl;
         // process the image data here
         zmqpp::message reply;
         std::string reply_message = "Image received!";
         reply.add(reply_message);
         socket.send(reply);
   }
   return 0;
}
```
### client
```python
import zmq  # pip install zmq
context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect("tcp://localhost:5555")
with open("image.jpg", "rb") as file:
    image_data = file.read()
message = zmq.Frame(image_data)
socket.send(message)
reply = socket.recv()
print(reply)
```
