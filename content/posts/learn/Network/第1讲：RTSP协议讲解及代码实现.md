---
title: 第1讲：RTSP协议讲解及代码实现
date: 2023-05-26 21:02:17 +0800
lastmod: 
summary: 
slug: RTSP-protocol-explanation-and-code-implementation
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
- RTSP是一个实时传输流协议，是一个应用层的协议。通常说的RTSP包括RTSP协议、RTP协议、RTCP协议，对于这些协议的作用简单的理解如下
   - RTSP协议：负责服务器与客户端之间的**请求与响应**
   - RTP协议：负责服务器与客户端之间**传输媒体数据**
   - RTCP协议：负责提供有关RTP传输质量的反馈，就是**确保RTP传输的质量**
   - 三者的关系：rtsp并不会发送媒体数据，只是完成服务器和客户端之间的信令交互，rtp协议负责媒体数据传输，rtcp负责rtp数据包的监视和反馈。rtp和rtcp并没有规定传输层的类型，可以选择udp和tcp。Rtsp的传输层则要求是基于tcp。
## 准备工作
### 安装ffmepg

因为已经装过了，所以这里[自行安装](https://www.google.com.hk/search?q=ffmpeg%E4%B8%8B%E8%BD%BDubuntu)。

### 安装wireshark

1. sudo apt-get update
2. sudo apt-get install wireshark
3. 出现一个对话框选yes
4. 将wireshark加入到当前用户，使其可以命令行访问，sudo vim /etc/group
   1. （应该在最后一行）找到wireshark，最后加入你的ubuntu用户名
   2. wireshark:x:129:ubuntu用户名
5. 然后命令行输入sudo wireshark即可
6. [参考博客](https://blog.csdn.net/magiclyj/article/details/77231707)

注意运行需要管理员运行，即sudo

选择本地回环：loopback

![1.jpg](https://pic.keepjolly.com/halo/blog/2023/05/20230526210441.jpg?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

然后双击该行，进入监听

随后运行程序即可，然后再开启一个终端（ctrl+alt+T），输入ffplay -i rtsp://127.0.0.1:8554

然后wireshark就会出现

![2.jpg](https://pic.keepjolly.com/halo/blog/2023/05/20230526210441-1.jpg?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)

## RTSP相关选项

- [options](https://blog.csdn.net/mlfcjob/article/details/109120103)请求，用于查询RTSP服务器支持的方法（如DESCRIBE、SETUP、PLAY等）。
   - ![3.jpg](https://pic.keepjolly.com/halo/blog/2023/05/20230526210441-2.jpg?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
- [DESCRIBE](https://blog.csdn.net/mlfcjob/article/details/109120169)请求，用于获取有关流媒体的信息，例如它的编码格式、分辨率、码率等。（[sdp](https://blog.csdn.net/uianster/article/details/125902301)）
- [SETUP](https://blog.csdn.net/mlfcjob/article/details/109120217)请求，作用是指明媒体流该以什么方式传输；每个流PLAY之前必须执行SETUP操作；发送SETUP请求时，客户端会指定两个端口，一个端口用于接收RTP数据；另一个端口接收RTCP数据，偶数端口用来接收RTP数据，相邻的奇数端口用于接收RTCP数据！
- [PLAY](https://blog.csdn.net/mlfcjob/article/details/109336283)请求，发送播放请求的时候可以指定播放区间！发起播放请求后，如果连接正常，则服务端开始播放，即开始向客户端按照之前在TRASPORT中约定好的方式发送音视频数据包！播放流程便这样开始了
## Linux代码
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <string>
#pragma comment(lib, "ws2_32.lib")
#include <stdint.h>

#pragma warning( disable : 4996 )

#define SERVER_PORT      8554

#define SERVER_RTP_PORT  55532
#define SERVER_RTCP_PORT 55533

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
static void closesocket(int fd){
    close(fd);
}
// 以上就是正常的tcp连接
static int handleCmd_OPTIONS(char* result, int cseq)  //reply信息
{
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Public: OPTIONS, DESCRIBE, SETUP, PLAY\r\n"
        "\r\n",
        cseq);

    return 0;
}

static int handleCmd_DESCRIBE(char* result, int cseq, char* url)  //reply信息
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

static int handleCmd_SETUP(char* result, int cseq, int clientRtpPort)  //reply信息
{
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Transport: RTP/AVP;unicast;client_port=%d-%d;server_port=%d-%d\r\n"
        "Session: 66334873\r\n"
        "\r\n",
        cseq,
        clientRtpPort,
        clientRtpPort + 1,
        SERVER_RTP_PORT,
        SERVER_RTCP_PORT);

    return 0;
}

static int handleCmd_PLAY(char* result, int cseq)  //reply信息
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

    int clientRtpPort, clientRtcpPort;
    char* rBuf = (char*)malloc(10000);  // client to server 缓冲区
    char* sBuf = (char*)malloc(10000); // s to c 缓冲区

    while (true) {
        int recvLen;

        recvLen = recv(clientSockfd, rBuf, 2000, 0);
        if (recvLen <= 0) {
            break;
        }

        rBuf[recvLen] = '\0';
        std::string recvStr = rBuf;
        printf(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n");  // c to s buff
        printf("%s rBuf = %s \n",__FUNCTION__,rBuf);

        const char* sep = "\n";
        char* line = strtok(rBuf, sep);
        while (line) {
             
            if (strstr(line, "OPTIONS") || strstr(line, "DESCRIBE") || strstr(line, "SETUP") || strstr(line, "PLAY")) {
                // sscanf函数的返回值是一个整数类型，表示成功读取并匹配的参数个数。
                if (sscanf(line, "%s %s %s\r\n", method, url, version) != 3) {  // 判断Request头
                    // error
                }
            }
            else if (strstr(line, "CSeq")) {
                if (sscanf(line, "CSeq: %d\r\n", &CSeq) != 1) {  // 判断当前line前strlen个是否是CSeq
                    // error
                }
            }
            else if (!strncmp(line, "Transport:", strlen("Transport:"))) {  // 判断是否transport
                // Transport: RTP/AVP/UDP;unicast;client_port=13358-13359
                // Transport: RTP/AVP;unicast;client_port=13358-13359

                if (sscanf(line, "Transport: RTP/AVP/UDP;unicast;client_port=%d-%d\r\n",
                    &clientRtpPort, &clientRtcpPort) != 2) {
                    // error
                    printf("parse Transport error \n");
                }
            }
            line = strtok(NULL, sep);
        }
    	// 相等返回0，取反则进入执行
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
        else if (!strcmp(method, "SETUP")) {
            if (handleCmd_SETUP(sBuf, CSeq, clientRtpPort))
            {
                printf("failed to handle setup\n");
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
            printf("undefined method = %s \n", method);
            break;
        }
        printf("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
        printf("%s sBuf = %s \n", __FUNCTION__, sBuf);

        send(clientSockfd, sBuf, strlen(sBuf), 0);  // 给客户端发送信息


        //send RTP pack
        if (!strcmp(method, "PLAY")) {

            printf("start play\n");
            printf("client ip:%s\n", clientIP);
            printf("client port:%d\n", clientRtpPort);

            while (true) {


                sleep(40);
                //usleep(40000);//1000/25 * 1000
            }
   
            break;
        }

        memset(method,0,sizeof(method)/sizeof(char));  // 重置信息
        memset(url,0,sizeof(url)/sizeof(char));
        CSeq = 0;

    }

    closesocket(clientSockfd);
    free(rBuf);
    free(sBuf);
}


int main(int argc, char* argv[])
{
    int serverSockfd;

    serverSockfd = createTcpSocket();
    if (serverSockfd < 0)
    {
        printf("failed to create tcp socket\n");
        return -1;
    }
    if (bindSocketAddr(serverSockfd, "0.0.0.0", SERVER_PORT) < 0)
    {
        printf("failed to bind addr\n");
        return -1;
    }

    if (listen(serverSockfd, 10) < 0)
    {
        printf("failed to listen\n");
        return -1;
    }

    printf("%s rtsp://127.0.0.1:%d\n", __FILE__, SERVER_PORT);

    while (true) {
        int clientSockfd;
        char clientIp[40];
        int clientPort;

        clientSockfd = acceptClient(serverSockfd, clientIp, &clientPort);
        if (clientSockfd < 0)
        {
            printf("failed to accept client\n");
            return -1;
        }

        printf("accept client;client ip:%s,client port:%d\n", clientIp, clientPort);

        doClient(clientSockfd, clientIp, clientPort);
    }
    closesocket(serverSockfd);
    return 0;
}
```
## ffmpeg入门

- [ffmpeg命令行 视频生成图片](https://zhuanlan.zhihu.com/p/413567427)
   - ffmpeg -i input.mp4 -r 25 -f image2 data/image%3d.jpg
- [ffmpeg命令行 图片合并视频](https://zhuanlan.zhihu.com/p/413449964)
   - ffmpeg -r 1 -f image2 -i data/%d.jpg -vcodec libx264 -s 640*480 -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p out.mp4
- [ffmpeg常用命令行](https://zhuanlan.zhihu.com/p/596277744)
   - 注意linux查看摄像头列表命令不一致
   - **摄像头推流到RTMP服务**
      - ffmpeg -f dshow -i video="USB webcam" -vcodec libx264 -acodec aac -ar 44100 -ac 1 -r 25 -s 1920*1080 -f flv rtmp://192.168.1.3/live/desktop
   - **摄像头推流到RTSP（rtp over tcp）**
      - ffmpeg -f dshow -i video="FULL HD webcam" -rtsp_transport tcp -vcodec libx264 -preset ultrafast -acodec libmp3lame -ar 44100 -ac 1 -r 25 -f rtsp rtsp://192.168.0.1/webcam
