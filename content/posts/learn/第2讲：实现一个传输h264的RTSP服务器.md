---
title: 第2讲：实现一个传输h264的RTSP服务器
date: 2023-05-26 21:03:50 +0800
lastmod: 
summary: 
slug: h264-RTSP-server
draft: false
categories: 
- learn
tags: 
- C++
- RTSP
original: true
author: Rurouni
website: www.keepjolly.com
---
## vscode配置
[vscode编译多个cpp文件](https://blog.csdn.net/Yujian2563/article/details/124749727)
将${file}更改为选中部分，使之编译所有cpp文件。注意：变更之后本工程内不能出现多个main函数！！
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
或者使用命令行：gcc  file1.cpp file2.cpp main.cpp -o myprogram
或者使用cmake
```cmake
#假设我们有三个源代码文件：

#main.cpp
#myclass.cpp
#utils.cpp
#以及两个头文件：

#myclass.h
#utils.h
#那么，我们首先需要在CMakeLists.txt中指定这些源代码文件，并创建一个库：

cmake_minimum_required(VERSION 3.5)

project(myproject)

## 添加源代码文件
add_library(mylib SHARED 
    myclass.cpp 
    utils.cpp
)

## 包含头文件搜索路径
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

## 指定头文件
set(MY_HEADERS
    myclass.h
    utils.h
)

## 指定生成可执行文件，并链接库
add_executable(myapp main.cpp)
target_link_libraries(myapp mylib)
```
# 项目功能
服务端需要源源不断的读取一个本地h264视频文件，并将读取到的h264视频流封装到RTP数据包中，再推送至客户端。这样我们就实现了一个简单的支持RTSP协议流媒体分发服务。
# RTP理解
RTP:实时传输协议（Real-time Transport Protocol或简写RTP）是一个网络传输协议.
RTP定义了两种报文：RTP报文和RTCP报文，RTP报文用于传送媒体数据（如音频和视频），它由 RTP报头和数据两部分组成，RTP数据部分称为有效载荷(payload)；RTCP报文用于传送控制信息，以实现协议控制功能。RTP报文和RTCP 报文将作为下层协议（TCP/UDP）的数据单元进行传输。如果使用UDP，则RTP报文和RTCP报文分别使用两个相邻的UDP端口，RTP报文使用**低端口**，RTCP报文使用**高端口**。如果使用其它的下层协议（TCP），RTP报文和RTCP报文可以合并，放在一个数据单元中一起传送，控制信息在前，媒体数据在后。通常，RTP是由应用程序实现的。
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444-1.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
```cpp
// RTP头的结构体
 
struct RtpHeader
{
    /* byte 0 */
    uint8_t csrcLen : 4; //CSRC计数器，占后4位，指示CSRC 标识符的个数。
    uint8_t extension : 1; //占1位，后第五位，如果X=1，则在RTP报头后跟有一个扩展报头。
    uint8_t padding : 1; //填充标志，占1位，如果P=1，则在该报文的尾部填充一个或多个额外的八位组，它们不是有效载荷的一部分。
    uint8_t version : 2; //RTP协议的版本号，占2位，当前协议版本号为2。

    /* byte 1 */
    uint8_t payloadType : 7;//有效载荷类型，占7位，用于说明RTP报文中有效载荷的类型，如GSM音频、JPEM图像等。
    uint8_t marker : 1;//标记，占1位，不同的有效载荷有不同的含义，对于视频，标记一帧的结束；对于音频，标记会话的开始。

    /* bytes 2,3 */
    uint16_t seq;//占16位，用于标识发送者所发送的RTP报文的序列号，每发送一个报文，序列号增1。接收者通过序列号来检测报文丢失情况，重新排序报文，恢复数据。

    /* bytes 4-7 */
    uint32_t timestamp;//占32位，时戳反映了该RTP报文的第一个八位组的采样时刻。接收者使用时戳来计算延迟和延迟抖动，并进行同步控制。

    /* bytes 8-11 */
    uint32_t ssrc;//占32位，用于标识同步信源。该标识符是随机选择的，参加同一视频会议的两个同步信源不能有相同的SSRC。

   /*标准的RTP Header 还可能存在 0-15个特约信源(CSRC)标识符
   
   每个CSRC标识符占32位，可以有0～15个。每个CSRC标识了包含在该RTP报文有效载荷中的所有特约信源

   */
};

// RTP包的结构体
// 包含一个RTP头部和RTP载荷
struct RtpPacket
{
    struct RtpHeader rtpHeader;
    uint8_t payload[0];
};
```
## H264理解
[链接](https://mp.weixin.qq.com/s/SJblG5lj8nzQweM1VnRTEA)

- I帧(intraframe frame),关键帧。
   - 采用帧内压缩技术。I帧是所有数据帧最关键的帧，如果缺少了I帧，后面的数据帧将无法使用。IDR帧属于I帧。举例我将GOP中第一帧就可以称作I帧。在编码时，I帧是不需要参考前后帧数据，是独立编码。GOP至少有一个I帧。
- P帧(forward Predicted frame)，向前参考帧。
   - 压缩时，只参考前面已经处理的帧，采用帧间压缩技术。它占I帧的一半大小。
- B帧(Bidirectionally predicted frame)，双向参考帧。
   - 压缩时，既参考前面已经处理的帧，也参考后面的帧，帧间压缩技术。它占I帧1/4大小。压缩率变高

**编码后数据，根据I帧P帧B帧的特性，在解码的过程是按I帧、P帧和B帧进行解码，文件播放还是按I帧、B帧和P帧顺序播放**
IDR帧和I帧的关系：
IDR(Instantannous Decoder Refresh) 解码器立即刷新
作用：在解码的过程，一旦有一帧数据出现错误，将是无法恢复的过程，后面数据帧不能使用。当有了IDR帧，解码器收到IDR帧时，就会将缓冲区的数据清空，找到第一个IDR帧，重新解码。I和IDR帧都使用帧内预测，在编码解码中为了方便，首个I帧要和其他I帧区别开，**把第一个I帧叫IDR**，这样方便控制编码和解码流程。IDR帧必须是一个I帧，但是I帧不一定是IDR帧，这个帧出现的时候，是告诉解码器，可以清除掉所有的参考帧，这是一个全新的序列，新的GOP已经开始。I帧有被跨帧参考的可能,IDR不会。
每个GOP中的第一帧就是IDR帧。 
## H264码流进行RTP封装
[RTP封装](https://blog.csdn.net/jwybobo2007/article/details/7054140)
**H.264由一个一个的NALU组成**，每个NALU之间使用**00 00 00 01**或**00 00 01**分隔开
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444-2.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

1. F(forbiden):禁止位，占用NALU头的第一个位，当禁止位值为1时表示语法错误；
2. NRI:参考级别，占用NALU头的第二到第三个位；值越大，该NAL越重要。
3. Type:Nalu数据类型，也就是标识该NALu的数据类型是哪种，占用NALU头的第4到第8个位；
- ![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444-3.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
- [图片来源](https://blog.csdn.net/qq_29350001/article/details/78226286#t0)
- 0x61 (0 11 00001) I帧 type = 1
- 0x41 (0 10 00001) P帧 type = 1
- 0x01 (0 00 00001) B帧 type = 1

打包方式：

1. 单NALU打包

所谓单NALU打包就是将一整个NALU的数据放入RTP包（RTP头+RTP载荷）的**载荷**中，这是最简单的一种方式。

2. 分片打包

每个RTP包都有大小限制的，因为RTP一般都是使用UDP发送，UDP没有流量控制，所以要限制每一次发送的大小，所以如果一个NALU的太大，就需要分成多个RTP包发送，至于如何分成多个RTP包，如下：
首先要明确，RTP包的格式是绝不会变的，永远都是RTP头+RTP载荷
RTP头部是固定的，那么只能在**RTP载荷中去添加额外信息**来说明这个RTP包是表示同一个NALU
如果是分片打包的话，那么在RTP载荷开始有**两个字节的信息**，然后再是NALU的内容
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444-4.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
第一个字节**FU Indicator**，其格式如下
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444-5.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
高三位：与NALU第一个字节的高三位相同
Type：28，表示该RTP包一个分片，为什么是28？因为H.264的规范中定义的，此外还有许多其他Type，这里不详讲
第二个字节**FU Header**，其格式如下
![image.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2023/05/20230526210444-6.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
S：标记该分片打包的第一个RTP包
E：比较该分片打包的最后一个RTP包
Type：NALU的Type，不同与FU Indicator的type
## 代码
**ffmpeg -i test.mp4 -codec copy -bsf: h264_mp4toannexb -f h264 test.h264 **生成h264文件
### rtp.h文件
```cpp
#pragma once
#include <stdint.h>

#define RTP_VERSION              2

#define RTP_PAYLOAD_TYPE_H264   96
#define RTP_PAYLOAD_TYPE_AAC    97

#define RTP_HEADER_SIZE         12
#define RTP_MAX_PKT_SIZE        1400

 /*
  *    0                   1                   2                   3
  *    7 6 5 4 3 2 1 0|7 6 5 4 3 2 1 0|7 6 5 4 3 2 1 0|7 6 5 4 3 2 1 0
  *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  *   |V=2|P|X|  CC   |M|     PT      |       sequence number         |
  *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  *   |                           timestamp                           |
  *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  *   |           synchronization source (SSRC) identifier            |
  *   +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
  *   |            contributing source (CSRC) identifiers             |
  *   :                             ....                              :
  *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  *
  */
struct RtpHeader
{
    /* byte 0 */
    uint8_t csrcLen : 4;//CSRC计数器，占4位，指示CSRC 标识符的个数。
    uint8_t extension : 1;//占1位，如果X=1，则在RTP报头后跟有一个扩展报头。
    uint8_t padding : 1;//填充标志，占1位，如果P=1，则在该报文的尾部填充一个或多个额外的八位组，它们不是有效载荷的一部分。
    uint8_t version : 2;//RTP协议的版本号，占2位，当前协议版本号为2。

    /* byte 1 */
    uint8_t payloadType : 7;//有效载荷类型，占7位，用于说明RTP报文中有效载荷的类型，如GSM音频、JPEM图像等。
    uint8_t marker : 1;//标记，占1位，不同的有效载荷有不同的含义，对于视频，标记一帧的结束；对于音频，标记会话的开始。

    /* bytes 2,3 */
    uint16_t seq;//占16位，用于标识发送者所发送的RTP报文的序列号，每发送一个报文，序列号增1。接收者通过序列号来检测报文丢失情况，重新排序报文，恢复数据。

    /* bytes 4-7 */
    uint32_t timestamp;//占32位，时戳反映了该RTP报文的第一个八位组的采样时刻。接收者使用时戳来计算延迟和延迟抖动，并进行同步控制。

    /* bytes 8-11 */
    uint32_t ssrc;//占32位，用于标识同步信源。该标识符是随机选择的，参加同一视频会议的两个同步信源不能有相同的SSRC。

   /*标准的RTP Header 还可能存在 0-15个特约信源(CSRC)标识符
   
   每个CSRC标识符占32位，可以有0～15个。每个CSRC标识了包含在该RTP报文有效载荷中的所有特约信源

   */
};

struct RtpPacket
{
    struct RtpHeader rtpHeader;
    uint8_t payload[0];
};

void rtpHeaderInit(struct RtpPacket* rtpPacket, uint8_t csrcLen, uint8_t extension,
    uint8_t padding, uint8_t version, uint8_t payloadType, uint8_t marker,
    uint16_t seq, uint32_t timestamp, uint32_t ssrc);
    
int rtpSendPacketOverTcp(int clientSockfd, struct RtpPacket* rtpPacket, uint32_t dataSize, char channel);
int rtpSendPacketOverUdp(int serverRtpSockfd, const char* ip, int16_t port, struct RtpPacket* rtpPacket, uint32_t dataSize);



```
### rtp.cpp
```cpp
#include "rtp.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <string>
#include <stdint.h>
void rtpHeaderInit(struct RtpPacket* rtpPacket, uint8_t csrcLen, uint8_t extension,
    uint8_t padding, uint8_t version, uint8_t payloadType, uint8_t marker,
    uint16_t seq, uint32_t timestamp, uint32_t ssrc)
{
    rtpPacket->rtpHeader.csrcLen = csrcLen;
    rtpPacket->rtpHeader.extension = extension;
    rtpPacket->rtpHeader.padding = padding;
    rtpPacket->rtpHeader.version = version;
    rtpPacket->rtpHeader.payloadType = payloadType;
    rtpPacket->rtpHeader.marker = marker;
    rtpPacket->rtpHeader.seq = seq;
    rtpPacket->rtpHeader.timestamp = timestamp;
    rtpPacket->rtpHeader.ssrc = ssrc;
}
int rtpSendPacketOverTcp(int clientSockfd, struct RtpPacket* rtpPacket, uint32_t dataSize, char channel)
{

    rtpPacket->rtpHeader.seq = htons(rtpPacket->rtpHeader.seq);
    rtpPacket->rtpHeader.timestamp = htonl(rtpPacket->rtpHeader.timestamp);
    rtpPacket->rtpHeader.ssrc = htonl(rtpPacket->rtpHeader.ssrc);

    uint32_t rtpSize = RTP_HEADER_SIZE + dataSize;
    char* tempBuf = (char *)malloc(4 + rtpSize);
    tempBuf[0] = 0x24;//$
    tempBuf[1] = channel;// 0x00;
    tempBuf[2] = (uint8_t)(((rtpSize) & 0xFF00) >> 8);
    tempBuf[3] = (uint8_t)((rtpSize) & 0xFF);
    memcpy(tempBuf + 4, (char*)rtpPacket, rtpSize);

    int ret = send(clientSockfd, tempBuf, 4 + rtpSize, 0);

    rtpPacket->rtpHeader.seq = ntohs(rtpPacket->rtpHeader.seq);
    rtpPacket->rtpHeader.timestamp = ntohl(rtpPacket->rtpHeader.timestamp);
    rtpPacket->rtpHeader.ssrc = ntohl(rtpPacket->rtpHeader.ssrc);

    free(tempBuf);
    tempBuf = NULL;

    return ret;
}
int rtpSendPacketOverUdp(int serverRtpSockfd, const char* ip, int16_t port, struct RtpPacket* rtpPacket, uint32_t dataSize)
{
    
    struct sockaddr_in addr;
    int ret;

    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr(ip);

    rtpPacket->rtpHeader.seq = htons(rtpPacket->rtpHeader.seq); //h to n从主机字节顺序转变成网络字节顺序
    rtpPacket->rtpHeader.timestamp = htonl(rtpPacket->rtpHeader.timestamp);
    rtpPacket->rtpHeader.ssrc = htonl(rtpPacket->rtpHeader.ssrc);

    ret = sendto(serverRtpSockfd, (char *)rtpPacket, dataSize + RTP_HEADER_SIZE, 0,
        (struct sockaddr*)&addr, sizeof(addr));

    rtpPacket->rtpHeader.seq = ntohs(rtpPacket->rtpHeader.seq);
    rtpPacket->rtpHeader.timestamp = ntohl(rtpPacket->rtpHeader.timestamp);
    rtpPacket->rtpHeader.ssrc = ntohl(rtpPacket->rtpHeader.ssrc);

    return ret;

}

```
### main.cpp
```cpp
#include "rtp.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <string>
#include <stdint.h>


#define H264_FILE_NAME   "./data/test.h264"  // 修改文件位置
#define SERVER_PORT      8554
#define SERVER_RTP_PORT  55532
#define SERVER_RTCP_PORT 55533
#define BUF_MAX_SIZE     (1024*1024)

static int createTcpSocket()
{
    int sockfd;
    int on = 1;

    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0)
        return -1;

    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, (const char*)&on, sizeof(on));

    return sockfd;
}

static int createUdpSocket()
{
    int sockfd;
    int on = 1;

    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0)
        return -1;

    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, (const char*)&on, sizeof(on));

    return sockfd;
}

static int bindSocketAddr(int sockfd, const char* ip, int port)
{
    struct sockaddr_in addr;

    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr(ip);

    if (bind(sockfd, (struct sockaddr*)&addr, sizeof(struct sockaddr)) < 0)
        return -1;

    return 0;
}

static int acceptClient(int sockfd, char* ip, int* port)
{
    int clientfd;
    socklen_t len = 0;
    struct sockaddr_in addr;

    memset(&addr, 0, sizeof(addr));
    len = sizeof(addr);

    clientfd = accept(sockfd, (struct sockaddr*)&addr, &len);
    if (clientfd < 0)
        return -1;

    strcpy(ip, inet_ntoa(addr.sin_addr));
    *port = ntohs(addr.sin_port);

    return clientfd;
}
static int closesocket(int fd){
    close(fd);
    return 1;
}
static inline int startCode3(char* buf) // h264文件必定已001 || 0001开头
{
    if (buf[0] == 0 && buf[1] == 0 && buf[2] == 1)
        return 1;
    else
        return 0;
}

static inline int startCode4(char* buf)
{
    if (buf[0] == 0 && buf[1] == 0 && buf[2] == 0 && buf[3] == 1)
        return 1;
    else
        return 0;
}

static char* findNextStartCode(char* buf, int len)  // 找到下一个nalu包开始
{
    int i;

    if (len < 3)
        return NULL;

    for (i = 0; i < len - 3; ++i)
    {
        if (startCode3(buf) || startCode4(buf))
            return buf;

        ++buf;  // http://c.biancheng.net/view/1769.html
    }

    if (startCode3(buf))
        return buf;

    return NULL;
}

static int getFrameFromH264File(FILE* fp, char* frame, int size) {
    int rSize, frameSize;
    char* nextStartCode;

    if (fp < 0)
        return -1;

    rSize = fread(frame, 1, size, fp); // 读取1*size个数据

    if (!startCode3(frame) && !startCode4(frame)) // 判断frame是否合法
        return -1;

    nextStartCode = findNextStartCode(frame + 3, rSize - 3);  // 排除startCode前三位？
    if (!nextStartCode)
    {
        //lseek(fd, 0, SEEK_SET);
        //frameSize = rSize;
        return -1;
    }
    else
    {
        frameSize = (nextStartCode - frame);  // 高地址-低地址
        // 从当前位置前移rSize-frameSize个（第一次是文件头到第一个nalu包尾的数据）
        //并且下次读取从该位置读取，所以不会一直是相同值
        fseek(fp, frameSize - rSize, SEEK_CUR);  

    }

    return frameSize;
}

static int rtpSendH264Frame(int serverRtpSockfd, const char* ip, int16_t port,
    struct RtpPacket* rtpPacket, char* frame, uint32_t frameSize)
{
 
    uint8_t naluType;
    int sendBytes = 0;
    int ret;

    naluType = frame[0]; // nalu头第一个字节

    printf("frameSize=%d \n", frameSize);

    if (frameSize <= RTP_MAX_PKT_SIZE) // nalu长度小于最大包长：单一NALU单元模式
    {

         //*   0 1 2 3 4 5 6 7 8 9
         //*  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         //*  |F|NRI|  Type   | a single NAL unit ... |
         //*  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

        memcpy(rtpPacket->payload, frame, frameSize);
        ret = rtpSendPacketOverUdp(serverRtpSockfd, ip, port, rtpPacket, frameSize);
        if(ret < 0)
            return -1;

        rtpPacket->rtpHeader.seq++;
        sendBytes += ret;
        if ((naluType & 0x1F) == 6 || (naluType & 0x1F) == 7 || (naluType & 0x1F) == 8) // 如果是SEI、SPS、PPS就不需要加时间戳
            goto out;
    }
    else // nalu长度小于最大包场：分片模式
    {

         //*  0                   1                   2
         //*  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
         //* +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         //* | FU indicator  |   FU header   |   FU payload   ...  |
         //* +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

         //*     FU Indicator
         //*    0 1 2 3 4 5 6 7
         //*   +-+-+-+-+-+-+-+-+
         //*   |F|NRI|  Type   |
         //*   +---------------+

         //*      FU Header
         //*    0 1 2 3 4 5 6 7
         //*   +-+-+-+-+-+-+-+-+
         //*   |S|E|R|  Type   |
         //*   +---------------+


        int pktNum = frameSize / RTP_MAX_PKT_SIZE;       // 有几个完整的包
        int remainPktSize = frameSize % RTP_MAX_PKT_SIZE; // 剩余不完整包的大小
        int i, pos = 1;

        // 发送完整的包
        for (i = 0; i < pktNum; i++)
        {
            // 0x60：0110 0000、 28：0001 1100
            rtpPacket->payload[0] = (naluType & 0x60) | 28;  // & 获取NRI、| 获取TYPE = 28
            rtpPacket->payload[1] = naluType & 0x1F; // 1F：0001 1111 获取NALU的type

            if (i == 0) //第一包数据
                rtpPacket->payload[1] |= 0x80; // 判断start  1000 0000
            else if (remainPktSize == 0 && i == pktNum - 1) //最后一包数据
                rtpPacket->payload[1] |= 0x40; // 判断end 0100 0000

            memcpy(rtpPacket->payload+2, frame+pos, RTP_MAX_PKT_SIZE);  // 除FU两个字节，将剩余数据放入load
            ret = rtpSendPacketOverUdp(serverRtpSockfd, ip, port, rtpPacket, RTP_MAX_PKT_SIZE+2); // +2包含FU
            if(ret < 0)
                return -1;

            rtpPacket->rtpHeader.seq++;
            sendBytes += ret;
            pos += RTP_MAX_PKT_SIZE;
        }

        // 发送剩余的数据
        if (remainPktSize > 0)
        {
            rtpPacket->payload[0] = (naluType & 0x60) | 28;
            rtpPacket->payload[1] = naluType & 0x1F;
            rtpPacket->payload[1] |= 0x40; //end

            memcpy(rtpPacket->payload+2, frame+pos, remainPktSize+2);
            ret = rtpSendPacketOverUdp(serverRtpSockfd, ip, port, rtpPacket, remainPktSize+2);
            if(ret < 0)
                return -1;

            rtpPacket->rtpHeader.seq++;
            sendBytes += ret;
        }
    }
    rtpPacket->rtpHeader.timestamp += 90000 / 25; // https://blog.csdn.net/jwybobo2007/article/details/7235942
    out:
    return sendBytes;

}


static int handleCmd_OPTIONS(char* result, int cseq)
{
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Public: OPTIONS, DESCRIBE, SETUP, PLAY\r\n"
        "\r\n",
        cseq);

    return 0;
}

static int handleCmd_DESCRIBE(char* result, int cseq, char* url)
{
    char sdp[500];
    char localIp[100];

    sscanf(url, "rtsp://%[^:]:", localIp);

    sprintf(sdp, "v=0\r\n"
        "o=- 9%ld 1 IN IP4 %s\r\n"
        "t=0 0\r\n"
        "a=control:*\r\n"
        "m=video 0 RTP/AVP 96\r\n"
        "a=rtpmap:96 H264/90000\r\n"
        "a=control:track0\r\n",
        time(NULL), localIp);

    sprintf(result, "RTSP/1.0 200 OK\r\nCSeq: %d\r\n"
        "Content-Base: %s\r\n"
        "Content-type: application/sdp\r\n"
        "Content-length: %zu\r\n\r\n"
        "%s",
        cseq,
        url,
        strlen(sdp),
        sdp);

    return 0;
}

static int handleCmd_SETUP(char* result, int cseq, int client_Rtp_Port)
{
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Transport: RTP/AVP;unicast;client_port=%d-%d;server_port=%d-%d\r\n"
        "Session: 66334873\r\n"
        "\r\n",
        cseq,
        client_Rtp_Port,
        client_Rtp_Port + 1,
        SERVER_RTP_PORT,
        SERVER_RTCP_PORT);

    return 0;
}

static int handleCmd_PLAY(char* result, int cseq)
{
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Range: npt=0.000-\r\n"
        "Session: 66334873; timeout=10\r\n\r\n",
        cseq);

    return 0;
}

static void doClient(int clientSockfd, const char* clientIP, int clientPort) {

    char method[40];
    char url[100];
    char version[40];
    int CSeq;

    int serverRtpSockfd = -1, serverRtcpSockfd = -1;
    int client_Rtp_Port, client_Rtcp_Port;
    char* rBuf = (char*)malloc(BUF_MAX_SIZE);
    char* sBuf = (char*)malloc(BUF_MAX_SIZE);

    while (true) {  // 循环接收客户端发送的每个请求并做处理
        int recvLen;

        recvLen = recv(clientSockfd, rBuf, BUF_MAX_SIZE, 0);
        if (recvLen <= 0) {
            break;
        }

        rBuf[recvLen] = '\0';
        printf("%s rBuf = %s \n",__FUNCTION__,rBuf);

        const char* sep = "\n";
        char* line = strtok(rBuf, sep);
        while (line) { // 解析客户端发送的请求
            if (strstr(line, "OPTIONS") ||
                strstr(line, "DESCRIBE") ||
                strstr(line, "SETUP") ||
                strstr(line, "PLAY")) {

                if (sscanf(line, "%s %s %s\r\n", method, url, version) != 3) {
                    // error
                }
            }
            else if (strstr(line, "CSeq")) {
                if (sscanf(line, "CSeq: %d\r\n", &CSeq) != 1) {
                    // error
                }
            }
            else if (!strncmp(line, "Transport:", strlen("Transport:"))) {
                // Transport: RTP/AVP/UDP;unicast;client_port=13358-13359
                // Transport: RTP/AVP;unicast;client_port=13358-13359

                if (sscanf(line, "Transport: RTP/AVP/UDP;unicast;client_port=%d-%d\r\n",
                    &client_Rtp_Port, &client_Rtcp_Port) != 2) {
                    // error
                    printf("parse Transport error \n");
                }
            }
            line = strtok(NULL, sep);
        }
        // 服务端回应客户端请求，目前只是填充了sBuf
        if (!strcmp(method, "OPTIONS")) {
            if (handleCmd_OPTIONS(sBuf, CSeq))
            {
                printf("failed to handle options\n");
                break;
            }
        }
        else if (!strcmp(method, "DESCRIBE")) {
            if (handleCmd_DESCRIBE(sBuf, CSeq, url))
            {
                printf("failed to handle describe\n");
                break;
            }
        }
        else if (!strcmp(method, "SETUP")) {  //SETUP返回服务端 端口号
            if (handleCmd_SETUP(sBuf, CSeq, client_Rtp_Port))  
            {
                printf("failed to handle setup\n");
                break;
            }
            // 创建服务端 端口号 用于通信
            serverRtpSockfd = createUdpSocket(); 
            serverRtcpSockfd = createUdpSocket();

            if (serverRtpSockfd < 0 || serverRtcpSockfd < 0)
            {
                printf("failed to create udp socket\n");
                break;
            }

            if (bindSocketAddr(serverRtpSockfd, "0.0.0.0", SERVER_RTP_PORT) < 0 ||
                bindSocketAddr(serverRtcpSockfd, "0.0.0.0", SERVER_RTCP_PORT) < 0)
            {
                printf("failed to bind addr\n");
                break;
            }

        }
        else if (!strcmp(method, "PLAY")) {  
            if (handleCmd_PLAY(sBuf, CSeq))
            {
                printf("failed to handle play\n");
                break;
            }
        }
        else {
            printf("未定义的method = %s \n", method);
            break;
        }
        /*
        sBuf = RTSP/1.0 200 OK
        CSeq: 2
        Content-Base: rtsp://127.0.0.1:8554
        Content-type: application/sdp
        Content-length: 125
        ...
        */
        printf("sBuf = %s \n", sBuf);
        /*
        doClient rBuf = SETUP rtsp://127.0.0.1:8554/track0 RTSP/1.0
        Transport: RTP/AVP/UDP;unicast;client_port=16010-16011
        CSeq: 3
        User-Agent: Lavf58.45.100
        */
        printf("%s sBuf = %s \n", __FUNCTION__, sBuf);
        
        send(clientSockfd, sBuf, strlen(sBuf), 0);  // 回应客户端请求 用填充后的sBuf


        //开始播放，发送RTP包to Client
        if (!strcmp(method, "PLAY")) {

            int frameSize, startCode;
            char* frame = (char*)malloc(500000);
            struct RtpPacket* rtpPacket = (struct RtpPacket*)malloc(500000);
            FILE* fp = fopen(H264_FILE_NAME, "rb");  // read binary
            if (!fp) {
                printf("读取 %s 失败\n", H264_FILE_NAME);
                break;
            }
            // 正常顺序 1: version padding extension csrcLen; 2: payloadType; 3: seq; 4: timestamp; 5:ssrc; 6:csrc
            rtpHeaderInit(rtpPacket, 0, 0, 0, RTP_VERSION, RTP_PAYLOAD_TYPE_H264, 0,
                0, 0, 0x88923423);

            printf("start play\n");
            printf("client ip:%s\n", clientIP);
            printf("client port:%d\n", client_Rtp_Port);

            while (true) {
                frameSize = getFrameFromH264File(fp, frame, 500000);
                if (frameSize < 0)
                {
                    printf("读取%s结束,frameSize=%d \n", H264_FILE_NAME, frameSize);
                    break;
                }

                if (startCode3(frame))
                    startCode = 3;
                else
                    startCode = 4;

                frameSize -= startCode;
                rtpSendH264Frame(serverRtpSockfd, clientIP, client_Rtp_Port,
                    rtpPacket, frame + startCode, frameSize);

               

                usleep(40000);
                //usleep(40000);//1000/25 * 1000
            }
            free(frame);
            free(rtpPacket);

            break;
        }

        memset(method,0,sizeof(method)/sizeof(char));
        memset(url,0,sizeof(url)/sizeof(char));
        CSeq = 0;

    }

    closesocket(clientSockfd);
    if (serverRtpSockfd) {
        closesocket(serverRtpSockfd);
    }
    if (serverRtcpSockfd > 0) {
        closesocket(serverRtcpSockfd);
    }

    free(rBuf);
    free(sBuf);

}


int main(int argc, char* argv[])
{
    int rtspServerSockfd;


    rtspServerSockfd = createTcpSocket();
    if (rtspServerSockfd < 0)
    {
        printf("failed to create tcp socket\n");
        return -1;
    }

    if (bindSocketAddr(rtspServerSockfd, "0.0.0.0", SERVER_PORT) < 0)
    {
        printf("failed to bind addr\n");
        return -1;
    }

    if (listen(rtspServerSockfd, 10) < 0)
    {
        printf("failed to listen\n");
        return -1;
    }

    printf("%s rtsp://127.0.0.1:%d\n", __FILE__, SERVER_PORT);

    while (true) {
        int clientSockfd;
        char clientIp[40];
        int clientPort;

        clientSockfd = acceptClient(rtspServerSockfd, clientIp, &clientPort);
        if (clientSockfd < 0)
        {
            printf("failed to accept client\n");
            return -1;
        }

        printf("accept client;client ip:%s,client port:%d\n", clientIp, clientPort);

        doClient(clientSockfd, clientIp, clientPort);
    }
    closesocket(rtspServerSockfd);

    return 0;
}
```
