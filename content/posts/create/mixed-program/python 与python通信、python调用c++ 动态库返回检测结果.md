---
title: python 与python通信、python调用c++ 动态库返回检测结果
date: 2023-01-08 11:17:34.624
updated: 2023-01-08 11:22:28.082
url: /archives/python-and-ctypes
categories: 
- create
tags: 
- Python
- TCP
- Ctype
---

## 项目需求
python 客户端将opencv读取到的图片发送给python服务端，然后python服务端将opencv图发送给Linux设备，将处理结果通过C++ 传给服务端，然后服务端再传给客户端。
这里服务端可以改成C++ 写的，就不用这么麻烦了，但是需要将python的pickle包解码成C++ 的pickle包，还未尝试。
以下所给代码，并不一定能跑通，思路在哪里，结合自己的代码
## 第一步，python间通信
这种方式能一次性全部发送，一次性全部接受（如发一张图片，接受一张，发两张，接受两张）
### 方法一
#### Python Client
```python
import datetime
import pickle
import time
import cv2
from multiprocessing.connection import Client
import os

host = 'localhost'
port = 9006
frame_num = 0

def connect_and_send(path, mode='file'):
    global frame_num
    client = Client((host, port))
    while 1:
        img_dict_list = []
        # 从文件夹读取图片
        if mode == 'file':
            img_list = []
            img_path = './data'
            for filename in os.listdir(img_path):
                read_img = cv2.imread(img_path + '/' + filename)
                img_list.append(read_img)
            # 存入dict
            for i in range(len(img_list)):
                img_obj = {'frame_num': i + 1, 'image': img_list[i],
                           'time': time.strftime('%Y%m%d%H%M%S', time.localtime())}
                img_dict_list.append(img_obj)
        else:
            read_img = cv2.imread(path)
            img_obj = {'frame_num': frame_num + 1, 'image': read_img,
                       'time': datetime.datetime.now().strftime('%M%S.%f')}
            img_dict_list.append(img_obj)
            frame_num += 1

        # 1. obj to pickle 用json的话会慢，因为read_img需要to_list()
        data_bytes = pickle.dumps(img_dict_list)
        # 2. 发送文件
        print('client send: ', datetime.datetime.now().strftime('%M%S.%f'))
        client.send(data_bytes)

        det_result = client.recv()
        print('client receive: ', datetime.datetime.now().strftime('%M%S.%f'))
        det_result = pickle.loads(det_result)
        print(det_result)
        break


if __name__ == '__main__':
    connect_and_send('data/ship.jpg', mode='1')
```
#### Python Server端
```python
import datetime
import pickle

import cv2
import numpy as np
from multiprocessing.connection import Listener

host = '192.168.0.2'
port = 9006
server_sock = Listener((host, port))
print("Connecting... ...")
sock = server_sock.accept()
while 1:
    try:
        received_bytes = sock.recv()
        print('server receive: ', datetime.datetime.now().strftime('%M%S.%f'))
    except Exception as e:
        received_bytes = None
        print(e)
    if not received_bytes:   # 当客户端下线，不让服务端下线
        server_sock.close()
        sock.close()
        print("Client's data is empty !!!")
        server_sock = Listener((host, port))
        print("Reset Sever")
        sock = server_sock.accept()
        continue
    else:
        # bytes to list
        img_dict_list = pickle.loads(received_bytes)
        # detect
        det_dict_list = []
        img_num = len(img_dict_list)

        img = img_dict_list[0]['image']
        # img send to server
        det_obj = {'frame_num': 1, 'det_output': getCResult(lib, det, img, img_num),  # getCResult获取检测结果
                   'time': datetime.datetime.now().strftime('%Y%m%d%H%M%S.%f')}
        det_dict_list.append(det_obj)
        # send result to client
        content = pickle.dumps(det_dict_list)
        print('server send: ', datetime.datetime.now().strftime('%M%S.%f'))
        sock.send(content)
```
参考链接：[Python，用简单代码上传内存中的图片到远程服务器进行处理](https://zhuanlan.zhihu.com/p/64534116)、[Python传输图片（同一局域网下版本）](https://blog.csdn.net/a19990412/article/details/80919703)
## 第二步，python调用C++ 动态库（opencv）返回检测结果
一共有[cython、pybind11、ctypes等包](https://bushyang.medium.com/python-c-c-%E6%95%B4%E5%90%88-adbfbf6051fd)，这里用的是ctypes
首先你需要有个.so文件，可以用cmake生成，注意python中你要调的包的位置，用camke不改.so文件的路径的话自动在当前文件夹生成，所以会报 **undefined symbol: strTest，**Linux指令：cp 复制文件
cmake自行查阅吧，这里做个示范
```
project(xxx)
add_library(xxx SHARED xxx.cpp)   //这里会将.cpp中的非类方法加入到.so文件中
add_executable(yyy yyy.cpp)
target_link_libraries(yyy xxx)
link：https://www.cnblogs.com/blog-3123958139/p/5575360.html
```
### 难点一：传输字符串 string to std::string
C++ 端：
```c
extern "C" {   // 加了才能识别到括号内的方法，必须！用C格式写代码
	int Detect_Init(Detect* det, char* config_path){  // det用于调用类方法，后续会讲
    	std:string config_path1(config_path, sizeof(config_path));  // 将char*转为string类型
    	return det->Init(config_path1);
	}
}
```
python端
```python
from ctypes import *
import ctypes

ll = ctypes.cdll.LoadLibrary
lib = ll("../lib/libDetect.so")
# 设置传递参数类型argtypes和返回类型restype
lib.Detect_new.argtypes = []
lib.Detect_new.restype = ctypes.c_void_p
lib.Detect_Init.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
lib.Detect_Init.restype = ctypes.c_int
# 创建一个Detect对象，后续会讲
det = lib.Detect_new()

# init
# 注意将string.encode()不行，编码到.就结束了
config = bytes("../../weights/DetectConfig.yaml", encoding='utf-8')  # 字符串任意，注意路径
# 如果需要传递可修改字符串，参考：https://zhuanlan.zhihu.com/p/215790047
# 使用create_string_buffer("test".encode('utf-8')) 
lib.Detect_Init(det, config)

```
参考链接：[Python调用C的基础学习（传递数字、字符串、数组（一维、二维）、结构体）](https://blog.csdn.net/qq_31342997/article/details/88374804#t8)
### 难点二：调用C++ 类方法
C++ 端
```cpp
class Foo{  //此处不贴自己的代码了，粘贴参考链接的代码
    public:
        Foo(int);
        void bar();
        int foobar(int);
    private:
        int val;
};
Foo::Foo(int n)  {val = nl;}
void Foo::bar() {
    std::cout << "Value is " << val << std::endl;
}
int Foo::foobar(int n)   {return val + n;}
extern "C"{  //用于python调用
    Foo* Foo_new(int n) {return new Foo(n);}  //核心点，创建一个调用类方法的对象
    void Foo_bar(Foo* foo) {foo->bar();}
    int Foo_foobar(Foo* foo, int n) {return foo->foobar(n);}
}
```
python端
```python
import ctypes
lib = ctypes.cdll.LoadLibrary('./libfoo.so')   # 注意路径
class Foo(object):   # 也可以不写类，直接放在一个def里
    def __init__(self, val):
        lib.Foo_new.argtypes = [ctypes.c_int]
        lib.Foo_new.restype = ctypes.c_void_p
        lib.Foo_bar.argtypes = [ctypes.c_void_p]
        lib.Foo_bar.restype = ctypes.c_void_p
        lib.Foo_foobar.argtypes = [ctypes.c_void_p, ctypes.c_int]
        lib.Foo_foobar.restype = ctypes.c_int
        self.obj = lib.Foo_new(val)
    def bar(self):
        lib.Foo_bar(self.obj)
    
    def foobar(self, val):
        return lib.Foo_foobar(self.obj, val)

f=Foo(5)
# Calling f.bar() will print a message including the value...
f.bar()
# Now we'll use foobar to add a value to that stored in our Foo object, f
print (f.foobar(7))
# Now we'll do the same thing - but this time demonstrate that it's a normal
# Python integer...
x = f.foobar(2)
print (type(x))
```
参考链接：[Calling C++  Classes from Python, with ctypes…](https://www.auctoris.co.uk/2017/04/29/calling-c-classes-from-python-with-ctypes/)、[python 调用 C++ dll, 包含类以及opencv Mat](https://www.jianshu.com/p/0306a9898d68)、
### 难点三：传输结构体并带Mat图片
此处一个坑点是C++ 结构体的**变量顺序**和**变量类型**必须与python的类一致！！！！一定要仔细校对
C++ 类型和Python类型对照[网址](https://docs.python.org/zh-cn/3/library/ctypes.html#fundamental-data-types)
二维数据在python里需要倒着写 C++ [20][5],python [5][20]
C++ 端
```cpp
extern "C" {
 typedef struct 
{
    int image_num;
    int width[32];
    int height[32];
    char* frame[32];    // 注意是char* 网上不是uchar*就是POINTER(ubyte) 实际上char*也可，为了与python对应
}PythonImage;

void getInfo(PythonImage  input){  //验证是否传输成功
    printf("-----Information------\n");
    printf("width: %d, height: %d\n", input.width[0], input.height[0]);
}
DetectOutput Detect_Run(Detect* det, PythonImage  img){  // DetectOutput是嵌套结构体，只要细心一般都能返回
    cv::Mat frame(img.height[0], img.width[0], CV_8UC3, img.frame[0]);  // 将char* 转为 Mat格式
    return det->Run(frame);  //将图片发给检测算法
}
}
```
python端
```cpp
from ctypes import *
import ctypes

class PythonImage(Structure):
    _fields_ = [('image_num', c_int),  # 注意 _fields_ 是双下划线
                ('width', c_int * val),  # val=32
                ('height', c_int * val),
                ('frame', c_char_p * val)]   # 与C++ 保持一致
        
ll = ctypes.cdll.LoadLibrary
lib = ll("../lib/libDetect.so")
lib.Detect_Run.argtypes = [ctypes.c_void_p, PythonImage]  # 注意此处填class名而不是Structure
lib.Detect_Run.restype = DetectOutput
det = lib.Detect_new()
pi = PythonImage()

PARAM = c_int * 32
height = PARAM()
height[0] = frame.shape[0]
pi.height = height

width = PARAM()
width[0] = frame.shape[1]
pi.width = width
# 对cv2图片进行处理
frame_data = np.asarray(frame, dtype=np.uint8)
frame_data = frame_data.ctypes.data_as(c_char_p)
pi.frame[0] = frame_data
pi.image_num = image_num  # 传输图片的数量

lib.getInfo.argtypes = [PythonImage]
lib.getInfo(pi)
lib.Detect_Run(det, pi)  # 检测结果
```
参考链接：[python调用c/C++ 时传递结构体参数](https://www.cnblogs.com/pyse/p/8590829.html)
### 小难点1：嵌套结构体传输/读取指针值/ctypes BUG？
注意C++ 结构体的**变量顺序**和**变量类型**必须与python的类一致！！！！一定要仔细校对，其他应该没有什么问题
C++ 端（可能是C的字节对齐原因）
```cpp
typedef enum AttributeType
{
    PERSON_HEAD = 0,                          
    PERSON_NECK,             
} AttributeType;

typedef struct cv_box 
{
    float x;                              
    float y;                             
    float w;                                            
    float h;                                              
} cv_box;                                              
   
typedef struct cv_object
{
    cv_box bbox;                             
    int classes;                                                           
    float *prob;                                 
    AttributeType attribute;       
    int a[7];
} cv_object;    

typedef struct cv_object_list
{
    cv_object object[128];
    int object_num;   // 注意这里的顺序 必须object_num 在object[128] 上面，  ！！！bug
										// 即两行互换位置，否则无法读取object_num的值，具体为什么不清楚
	int test[7];
}cv_object_list; 
```
python端
```python
class cv_box(Structure):
    _fields_ = [('x', c_float),
                ('y', c_float),
                ('w', c_float),
                ('h', c_float)]

class cv_object(Structure):
    _fields_ = [('bbox', cv_box),
                ('classes', c_int),
                ('prob', POINTER(c_float)),  
                ('attribute', c_int),   # 枚举类型是c_int
                ('a', c_int * 7)]

class cv_object_list(Structure):
    _fields_ = [('object', cv_object * 128),
                ('object_num', c_int),
               ('test', c_int * 7)]
# 输出指针值
prob = POINTER(c_float)(object[0].prob)   # 即float* prob
print(prob.contents.value)  # 获取到c_float()中括号内的值
参考链接：https://blog.csdn.net/Kelvin_Yan/article/details/86546784#t2
```
### 小难点2：python获取C++  .h文件内容
参考链接：[Python解析C++ 头文件](https://blog.csdn.net/whahu1989/article/details/111652840)
```python
import CppHeaderParser

cppHeader = CppHeaderParser.CppHeader("../include/type.h")
val = 32
OBJECT_NUM = 128
for h in cppHeader.defines:
    if 'BATCH_SIZE' in h:
        val = int(h.split(' ')[-1])
    if 'OBJECT_NUM' in h:
        OBJECT_NUM = int(h.split(' ')[-1])
```
## 第三步 传输视频
参考博客：[opencv cv2.imshow显示图片一片黑色](https://blog.csdn.net/weixin_43211480/article/details/100925410)、[ python:读取视频，处理后，实时计算帧数fps](https://blog.csdn.net/w5688414/article/details/78426153)、[opencv imencode跟imdecode函数jpg（python）](https://blog.csdn.net/a19990412/article/details/80940310)
首先如果转换m4s格式到mp4格式，使用命令：ffmpeg -i all.m4s -c copy video.mp4 
这个比较简单，总体思路就是opencv读取视频，按帧发送，然后接受回传结果并绘制
客户端
```python
def send_data(img_dict):
    start = int(round(time.time() * 1000))
    start_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    # 1. send data
    data_bytes = pickle.dumps(img_dict)
    client.send(data_bytes)  # 貌似client是全局变量
    # 2. receive data
    det_result = client.recv()
    det_result = pickle.loads(det_result)
    # print(det_result)
    # cal time cost
    end = int(round(time.time() * 1000))
    end_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    time_cost = end - start
    print('client total time cost: ', time_cost)
    # 3. draw boxes 自己写
    draw_box(det_result, img_dict)
    # 4. save logs 自己写
    det_frame_num = det_result['frame_num']
    save_logs(time_cost, start_time, end_time, det_frame_num)

def image_send(img):
    global frame_num
    img_param = [cv2.IMWRITE_JPEG_QUALITY， 95] # 压缩率
    _, img = cv2.imencode('.jpg', img, img_param)
    # 为了统一图片，如果单要视频，可以直接传输图片img
    img_obj = {'frame_num': frame_num, 'image': img}
    frame_num += 1
    send_data(img_obj)

def read_video_send(path):
    global frame_num
    frame_num = 1  # 重置frame_num 使其适配视频第一帧
    video = cv2.VideoCapture(path)
    while True:
        _, img = video.read()
        cv2.imshow('client', img)
        cv2.waitKey(1)  # 不加就黑屏
        start = time.time()
        image_send(img)  # send img
        end = time.time()
        seconds = end - start
        fps = 1 / seconds
        print("Estimated FPS: {0}".format(fps))	
        
if __name__ == '__main__':
    img_file = './data'
    img_pa = './data/1.jpg'
    client = Client((host, port))
    mode = 'video'
    if mode == 'image':
        read_img = cv2.imread(img_pa)
        image_send(read_img)
    elif mode == 'images':
        read_images_send(img_file)
    elif mode == 'video':
        read_video_send('./video/1.mp4')
```
服务端
```python
def connect_send(host, port, lib, det):
    server_sock = Listener((host, port))
    print("Connecting... ...")
    sock = server_sock.accept()
    while 1:
        try:
            received_bytes = sock.recv()
        except Exception as e:
            received_bytes = None
            print(e)
        if received_bytes is None:  # 不能是not received，否则传视频有问题
            server_sock.close()
            sock.close()
            print("Client's data is empty !!!")
            server_sock = Listener((host, port))
            print("Reset Sever")
            sock = server_sock.accept()
            continue
        else:
            # bytes to list to cv
            img_dict = pickle.loads(received_bytes)
            img_dict['image'] = cv2.imdecode(img_dict['image'], cv2.IMREAD_COLOR)
            # detect one image
            det_dict = detect_img(img_dict, lib, det, 1)
            # send result to client
            content = pickle.dumps(det_dict)
            sock.send(content)
```
