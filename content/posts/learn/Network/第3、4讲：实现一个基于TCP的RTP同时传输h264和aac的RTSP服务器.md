---
title: 第3、4讲：实现一个基于TCP的RTP同时传输h264和aac的RTSP服务器
date: 2023-05-26 21:04:25 +0800
lastmod: 
summary: 
slug: RTSP-server-of-h264-and-aac-based-on-RTP-over-TCP
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
## 音频原理
[博客](https://zhuanlan.zhihu.com/p/53475069)

1. **声音**

**频率（音调）：声音1秒内周期性变化的次数**

人耳的听觉范围在20Hz-20kHz。 低频的声音沉闷厚重，高频的声音尖锐刺耳。 高于 20kHz的声音为超声波。

**振幅（响度）：声音的大小**

有的时候，我们用分贝（dB）形容声音大小。值得注意的是，**dB是一个比值，是一个数值，没有任何单位标注。（功率强度之比的对数的10倍）**

2. **声音采集与存储**

**采样**，指把时间域或空间域的连续量转化成离散量的过程 。

对声音的采样常用麦克风等设备将声音信号转换成电信号，再用模/数转换器将电信号转换成一串用1和0表示的二进制数字（数字信号）。

**采样频率**指录音设备在一秒钟内对声音信号的采样次数。采样频率越高，声音的还原就越真实越自然。

目前主流的采样频率有22.05KHz、44.1KHz、48KHz三种。

### PCM
PCM(Pulse Code Modulation)也被称为 脉码编码调制。PCM中的声音数据没有被压缩，如果是单声道的文件，采样数据按时间的先后顺序依次存入。(它的基本组织单位是BYTE(8bit)或WORD(16bit))

**一般情况下，一帧PCM是由2048次采样组成的**（参考[请问PCM格式的音频流，每次读入或输出的块的大小是必须固定为4096B么](http://discussion.forum.nokia.com/forum/showthread.php?129458-%E8%AF%B7%E9%97%AEPCM%E6%A0%BC%E5%BC%8F%E7%9A%84%E9%9F%B3%E9%A2%91%E6%B5%81%EF%BC%8C%E6%AF%8F%E6%AC%A1%E8%AF%BB%E5%85%A5%E6%88%96%E8%BE%93%E5%87%BA%E7%9A%84%E5%9D%97%E7%9A%84%E5%A4%A7%E5%B0%8F%E6%98%AF%E5%BF%85%E9%A1%BB%E5%9B%BA%E5%AE%9A%E4%B8%BA4096B%E4%B9%88&s=e79e9dd1707157281e3725a163844c49)）。

如果是双声道的文件，采样数据按时间先后顺序交叉地存入。如图所示:

![image](https://pic.keepjolly.com/halo/blog/2023/05/20230526210449.png?imageMogr2/format/webp%7C)

## aac的码流格式
[AAC的ADTS头文件信息介绍](https://blog.csdn.net/jay100500/article/details/52955232)、[C++ 解析aac-adts的头部信息](https://blog.csdn.net/u013113678/article/details/123134860)、[AAC ADTS格式分析](https://www.cnblogs.com/zhangxuan/p/8809245.html)、[保留用](https://xie.infoq.cn/article/403c31f46c2ee5e39fdbede0e)

![image](https://pic.keepjolly.com/halo/blog/2023/05/20230526210449-1.png?imageMogr2/format/webp%7C)

AAC音频格式：Advanced Audio Coding(高级音频解码)，是一种由MPEG-4标准定义的有损音频压缩格式，由Fraunhofer发展，Dolby, Sony和AT&T是主要的贡献者。

- ADIF：Audio Data Interchange Format 音频数据交换格式。这种格式的特征是可以确定的找到这个音频数据的开始，不需进行在音频数据流中间开始的解码，即它的解码必须在明确定义的开始处进行。故这种格式常用在**磁盘文件**中。
- ADTS的全称是Audio Data Transport Stream。是AAC音频的传输流格式。AAC音频格式在MPEG-2（ISO-13318-7 2003）中有定义。AAC后来又被采用到MPEG-4标准中。这种格式的特征是它是一个有同步字的比特流，解码可以在这个流中任何位置开始。它的特征类似于mp3数据流格式。常用在**数据传输**中。
### ADTS Header

- syncword ：总是0xFFF, 代表一个ADTS帧的开始, 用于同步.解码器可通过0xFFF确定每个ADTS的开始位置.因为它的存在，解码可以在这个流中任何位置开始, 即可以在任意帧解码。
- ID：MPEG Version: 0 for MPEG-4，1 for MPEG-2
- Layer：always: '00'
- protection_absent：Warning, set to 1 if there is no CRC and 0 if there is CRC
- profile：表示使用哪个级别的AAC
   - profile的值等于 Audio Object Type的值减1. 但是有17个，2bit能表示？
   - profile = MPEG-4 Audio Object Type - 1
   - ![image](https://pic.keepjolly.com/halo/blog/2023/05/20230526210449-2.png?imageMogr2/format/webp%7C)
- sampling_frequency_index：采样率的下标
   - ![image](https://pic.keepjolly.com/halo/blog/2023/05/20230526210449-3.png?imageMogr2/format/webp%7C)
- channel_configuration：声道数，比如2表示立体声双声道
   - ![image](https://pic.keepjolly.com/halo/blog/2023/05/20230526210449-4.png?imageMogr2/format/webp%7C)

接下来看下adts_variable_header();

![image](https://pic.keepjolly.com/halo/blog/2023/05/20230526210449-5.png?imageMogr2/format/webp%7C)

- aac_frame_length：一个ADTS帧的长度包括ADTS头和AAC原始流。
   - frame length, this value must include 7 or 9 bytes of header length:
   - aac_frame_length = (protection_absent == 1 ? 7 : 9) + size(AACFrame)
   - protection_absent=0时, header length=9bytes
   - protection_absent=1时, header length=7bytes
- adts_buffer_fullness：0x7FF 说明是码率可变的码流。
- number_of_raw_data_blocks_in_frame：表示ADTS帧中有number_of_raw_data_blocks_in_frame + 1个AAC原始帧。所以说number_of_raw_data_blocks_in_frame == 0 表示说ADTS帧中有一个AAC数据块。(一个AAC原始帧包含一段时间内1024个采样及相关数据)
## 代码
rtp.h、 rtp.cpp参考前文
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

#define SERVER_PORT     8554
#define SERVER_RTP_PORT  55532
#define SERVER_RTCP_PORT 55533
#define BUF_MAX_SIZE    (1024*1024)
#define AAC_FILE_NAME   "./data/test.aac"

static int createTcpSocket() {
    int sockfd;
    int on = 1;

    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0)
        return -1;

    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, (const char*)&on, sizeof(on));

    return sockfd;
}

static int createUdpSocket() {
    int sockfd;
    int on = 1;

    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0)
        return -1;

    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, (const char*)&on, sizeof(on));

    return sockfd;
}

static int bindSocketAddr(int sockfd, const char* ip, int port) {
    struct sockaddr_in addr;

    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr(ip);

    if (bind(sockfd, (struct sockaddr*)&addr, sizeof(struct sockaddr)) < 0)
        return -1;

    return 0;
}
static int closesocket(int fd){
    close(fd);
    return 1;
}
struct AdtsHeader {
    unsigned int syncword;  //12 bit 同步字 '1111 1111 1111'，一个ADTS帧的开始
    uint8_t id;        //1 bit 0代表MPEG-4, 1代表MPEG-2。
    uint8_t layer;     //2 bit 必须为0
    uint8_t protectionAbsent;  //1 bit 1代表没有CRC，0代表有CRC
    uint8_t profile;           //2 bit AAC级别（MPEG-2 AAC中定义了3种profile，MPEG-4 AAC中定义了6种profile）
    uint8_t samplingFreqIndex; //4 bit 采样率
    uint8_t privateBit;        //1bit 编码时设置为0，解码时忽略
    uint8_t channelCfg;        //3 bit 声道数量
    uint8_t originalCopy;      //1bit 编码时设置为0，解码时忽略
    uint8_t home;               //1 bit 编码时设置为0，解码时忽略

    uint8_t copyrightIdentificationBit;   //1 bit 编码时设置为0，解码时忽略
    uint8_t copyrightIdentificationStart; //1 bit 编码时设置为0，解码时忽略
    unsigned int aacFrameLength;               //13 bit 一个ADTS帧的长度包括ADTS头和AAC原始流
    unsigned int adtsBufferFullness;           //11 bit 缓冲区充满度，0x7FF说明是码率可变的码流，不需要此字段。CBR可能需要此字段，不同编码器使用情况不同。这个在使用音频编码的时候需要注意。

    /* number_of_raw_data_blocks_in_frame
     * 表示ADTS帧中有number_of_raw_data_blocks_in_frame + 1个AAC原始帧
     * 所以说number_of_raw_data_blocks_in_frame == 0
     * 表示说ADTS帧中有一个AAC数据块并不是说没有。(一个AAC原始帧包含一段时间内1024个采样及相关数据)
     */
    uint8_t numberOfRawDataBlockInFrame; //2 bit
};

static int parseAdtsHeader(uint8_t* in, struct AdtsHeader* res) {
    static int frame_number = 0;
    memset(res, 0, sizeof(*res));

    if ((in[0] == 0xFF) && ((in[1] & 0xF0) == 0xF0))
    {
        res->id = ((uint8_t)in[1] & 0x08) >> 3;//第二个字节与0x08与运算之后，获得第13位bit对应的值
        res->layer = ((uint8_t)in[1] & 0x06) >> 1;//第二个字节与0x06与运算之后，右移1位，获得第14,15位两个bit对应的值
        res->protectionAbsent = (uint8_t)in[1] & 0x01;
        res->profile = ((uint8_t)in[2] & 0xc0) >> 6;
        res->samplingFreqIndex = ((uint8_t)in[2] & 0x3c) >> 2;
        res->privateBit = ((uint8_t)in[2] & 0x02) >> 1;
        res->channelCfg = ((((uint8_t)in[2] & 0x01) << 2) | (((unsigned int)in[3] & 0xc0) >> 6));
        res->originalCopy = ((uint8_t)in[3] & 0x20) >> 5;
        res->home = ((uint8_t)in[3] & 0x10) >> 4;
        res->copyrightIdentificationBit = ((uint8_t)in[3] & 0x08) >> 3;
        res->copyrightIdentificationStart = (uint8_t)in[3] & 0x04 >> 2;
        
        res->aacFrameLength = (((((unsigned int)in[3]) & 0x03) << 11) |
            (((unsigned int)in[4] & 0xFF) << 3) |
            ((unsigned int)in[5] & 0xE0) >> 5);

        res->adtsBufferFullness = (((unsigned int)in[5] & 0x1f) << 6 |
            ((unsigned int)in[6] & 0xfc) >> 2);
        res->numberOfRawDataBlockInFrame = ((uint8_t)in[6] & 0x03);

        return 0;
    }
    else
    {
        printf("failed to parse adts header\n");
        return -1;
    }
}

static int rtpSendAACFrame(int socket, const char* ip, int16_t port,
    struct RtpPacket* rtpPacket, uint8_t* frame, uint32_t frameSize) {
    //打包文档：https://blog.csdn.net/yangguoyu8023/article/details/106517251/
    int ret;

    rtpPacket->payload[0] = 0x00;
    rtpPacket->payload[1] = 0x10;
    rtpPacket->payload[2] = (frameSize & 0x1FE0) >> 5; //高8位
    rtpPacket->payload[3] = (frameSize & 0x1F) << 3; //低5位

    memcpy(rtpPacket->payload + 4, frame, frameSize);

    ret = rtpSendPacketOverUdp(socket, ip, port, rtpPacket, frameSize + 4);
    if (ret < 0)
    {
        printf("failed to send rtp packet\n");
        return -1;
    }

    rtpPacket->rtpHeader.seq++;

    /*
     * 如果采样频率是44100
     * 一般AAC每个1024个采样为一帧
     * 所以一秒就有 44100 / 1024 = 43帧
     * 时间增量就是 44100 / 43 = 1025
     * 一帧的时间为 1 / 43 = 23ms
     */
    rtpPacket->rtpHeader.timestamp += 1025;

    return 0;
}

static int acceptClient(int sockfd, char* ip, int* port) {
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

static char* getLineFromBuf(char* buf, char* line) {
    while (*buf != '\n')
    {
        *line = *buf;
        line++;
        buf++;
    }

    *line = '\n';
    ++line;
    *line = '\0';

    ++buf;
    return buf;
}

static int handleCmd_OPTIONS(char* result, int cseq) {
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Public: OPTIONS, DESCRIBE, SETUP, PLAY\r\n"
        "\r\n",
        cseq);

    return 0;
}

static int handleCmd_DESCRIBE(char* result, int cseq, char* url) {
    char sdp[500];
    char localIp[100];

    sscanf(url, "rtsp://%[^:]:", localIp);

    sprintf(sdp, "v=0\r\n"
        "o=- 9%ld 1 IN IP4 %s\r\n"
        "t=0 0\r\n"
        "a=control:*\r\n"
        "m=audio 0 RTP/AVP 97\r\n"
        "a=rtpmap:97 mpeg4-generic/44100/2\r\n"
        "a=fmtp:97 profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3;config=1210;\r\n"
   
        //"a=fmtp:97 SizeLength=13;\r\n"
        "a=control:track0\r\n",
        time(NULL), localIp);

    sprintf(result, "RTSP/1.0 200 OK\r\nCSeq: %d\r\n"
        "Content-Base: %s\r\n"
        "Content-type: application/sdp\r\n"
        "Content-length: %d\r\n\r\n"
        "%s",
        cseq,
        url,
        strlen(sdp),
        sdp);

    return 0;
}

static int handleCmd_SETUP(char* result, int cseq, int clientRtpPort) {
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Transport: RTP/AVP;unicast;client_port=%d-%d;server_port=%d-%d\r\n"
        "Session: 66334873\r\n"
        "\r\n",
        cseq,
        clientRtpPort,
        clientRtpPort + 1,
        SERVER_RTP_PORT,
        SERVER_RTCP_PORT
    );

    return 0;
}

static int handleCmd_PLAY(char* result, int cseq) {
    sprintf(result, "RTSP/1.0 200 OK\r\n"
        "CSeq: %d\r\n"
        "Range: npt=0.000-\r\n"
        "Session: 66334873; timeout=10\r\n\r\n",
        cseq);

    return 0;
}


static void doClient(int clientSockfd, const char* clientIP, int clientPort) {

    int serverRtpSockfd = -1, serverRtcpSockfd = -1;

    char method[40];
    char url[100];
    char version[40];
    int CSeq;

    int clientRtpPort, clientRtcpPort;
    char* rBuf = (char*)malloc(BUF_MAX_SIZE);
    char* sBuf = (char*)malloc(BUF_MAX_SIZE);

    while (true) {
        int recvLen;

        recvLen = recv(clientSockfd, rBuf, BUF_MAX_SIZE, 0);
        if (recvLen <= 0) {
            break;
        }

        rBuf[recvLen] = '\0';
        printf("%s rBuf = %s \n", __FUNCTION__, rBuf);

        const char* sep = "\n";
        char* line = strtok(rBuf, sep);
        while (line) {
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
                    &clientRtpPort, &clientRtcpPort) != 2) {
                    // error
                    printf("parse Transport error \n");
                }
            }
            line = strtok(NULL, sep);
        }

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

        printf("%s sBuf = %s \n", __FUNCTION__, sBuf);

        send(clientSockfd, sBuf, strlen(sBuf), 0);


        //开始播放，发送RTP包
        if (!strcmp(method, "PLAY")) {

            struct AdtsHeader adtsHeader;
            struct RtpPacket* rtpPacket;
            uint8_t* frame;
            int ret;

            FILE* fp = fopen(AAC_FILE_NAME, "rb");
            if (!fp) {
                printf("读取 %s 失败\n", AAC_FILE_NAME);
                break;
            }

            frame = (uint8_t*)malloc(5000);
            rtpPacket = (struct RtpPacket*)malloc(5000);

            rtpHeaderInit(rtpPacket, 0, 0, 0, RTP_VERSION, RTP_PAYLOAD_TYPE_AAC, 1, 0, 0, 0x32411);

            while (true)
            {
                ret = fread(frame, 1, 7, fp);
                if (ret <= 0)
                {
                    printf("fread err\n");
                    break;
                }
                printf("fread ret=%d \n",ret);

                if (parseAdtsHeader(frame, &adtsHeader) < 0)
                {
                    printf("parseAdtsHeader err\n");
                    break;
                }
                ret = fread(frame, 1, adtsHeader.aacFrameLength - 7, fp);
                if (ret <= 0)
                {
                    printf("fread err\n");
                    break;
                }

                rtpSendAACFrame(serverRtpSockfd, clientIP, clientRtpPort,
                    rtpPacket, frame, adtsHeader.aacFrameLength - 7);

                // Sleep(1);
                usleep(23223);//1000/43.06 * 1000
            }

            free(frame);
            free(rtpPacket);

            break;

        }

        memset(method, 0, sizeof(method) / sizeof(char));
        memset(url, 0, sizeof(url) / sizeof(char));
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

int main() {

    int rtspServerSockfd;

    int ret;

    rtspServerSockfd = createTcpSocket();
    if (rtspServerSockfd < 0)
    {
        printf("failed to create tcp socket\n");
        return -1;
    }

    ret = bindSocketAddr(rtspServerSockfd, "0.0.0.0", SERVER_PORT);
    if (ret < 0)
    {
        printf("failed to bind addr\n");
        return -1;
    }

    ret = listen(rtspServerSockfd, 10);
    if (ret < 0)
    {
        printf("failed to listen\n");
        return -1;
    }

    printf("%s rtsp://127.0.0.1:%d\n", __FILE__, SERVER_PORT);

    while (1)
    {
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
## 第4讲：实现一个基于TCP的RTP同时传输h264和aac的RTSP服务器
这个只是将前两讲组合在一起，并用线程分别开启，所以直接合并成一个博客。
> 如果之前的rtp.cpp不能使用，请重新在[北小菜](https://gitee.com/Vanishi/BXC_RtspServer_study)下载

在前三期视频的学习基础上，本期其实比较简单，相对于之前实现的功能，变化如下

1. 客户端请求RTSP的Describe请求时，RTSP服务器返回的SDP协议，需要同时**包含音频流和视频流的信息**。 
2. 客户端请求RTSP的Setup请求时，RTSP服务器不需要再对应创建RTP和RTCP的UDP连接通道，因为TCP版的RTP传输，客户端与服务器交互时，无论是RTSP信令还是RTP数据包或者是RTCP数据包，都是使用同一个tcp连接通道。只不过这个tcp连接通道在发送rtp数据包或者rtcp数据包时，需要**加一些分隔字节**。 	
3. 客户端请求RTSP的Play请求时，RTSP服务器在对Play请求回复以后，还需要源源不断的同时向客户端发送音频流和视频流的RTP数据包。 	
4. 有几点注意，在这个案例项目中，使用的h264视频文件，对应的fps需要是25。另外由于Nalu的数量并不等于视频帧数量的原因，该案例的音视频并不能同步
```cpp
//
// Created by sun on 11/24/20.
//

#include "rtp.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <string>
#include <stdint.h>
#include <thread>

#define AAC_FILE_NAME   "../data/test.aac"
#define H264_FILE_NAME   "../data/test.h264"
#define SERVER_PORT      8554
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
static inline int startCode3(char* buf)
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

static char* findNextStartCode(char* buf, int len)
{
    int i;

    if (len < 3)
        return NULL;

    for (i = 0; i < len - 3; ++i)
    {
        if (startCode3(buf) || startCode4(buf))
            return buf;

        ++buf;
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

    rSize = fread(frame, 1, size, fp);

    if (!startCode3(frame) && !startCode4(frame))
        return -1;

    nextStartCode = findNextStartCode(frame + 3, rSize - 3);
    if (!nextStartCode)
    {
        //lseek(fd, 0, SEEK_SET);
        //frameSize = rSize;
        return -1;
    }
    else
    {
        frameSize = (nextStartCode - frame);
        fseek(fp, frameSize - rSize, SEEK_CUR);

    }

    return frameSize;
}

struct AdtsHeader {
    unsigned int syncword;  //12 bit 同步字 '1111 1111 1111'，说明一个ADTS帧的开始
    unsigned int id;        //1 bit MPEG 标示符， 0 for MPEG-4，1 for MPEG-2
    unsigned int layer;     //2 bit 总是'00'
    unsigned int protectionAbsent;  // bit 1表示没有crc，0表示有crc
    unsigned int profile;           // 2bit 表示使用哪个级别的AAC
    unsigned int samplingFreqIndex; //4 bit 表示使用的采样频率
    unsigned int privateBit;        //1 bit
    unsigned int channelCfg; //3 bit 表示声道数
    unsigned int originalCopy;         //1 bit
    unsigned int home;                  //1 bit

    /*下面的为改变的参数即每一帧都不同*/
    unsigned int copyrightIdentificationBit;   //1 bit
    unsigned int copyrightIdentificationStart; //1 bit
    unsigned int aacFrameLength;               //13 bit 一个ADTS帧的长度包括ADTS头和AAC原始流
    unsigned int adtsBufferFullness;           //11 bit 0x7FF 说明是码率可变的码流

    /* number_of_raw_data_blocks_in_frame
     * 表示ADTS帧中有number_of_raw_data_blocks_in_frame + 1个AAC原始帧
     * 所以说number_of_raw_data_blocks_in_frame == 0
     * 表示说ADTS帧中有一个AAC数据块并不是说没有。(一个AAC原始帧包含一段时间内1024个采样及相关数据)
     */
    unsigned int numberOfRawDataBlockInFrame; //2 bit
};

static int parseAdtsHeader(uint8_t* in, struct AdtsHeader* res) {
    static int frame_number = 0;
    memset(res, 0, sizeof(*res));

    if ((in[0] == 0xFF) && ((in[1] & 0xF0) == 0xF0))
    {
        res->id = ((unsigned int)in[1] & 0x08) >> 3;
        res->layer = ((unsigned int)in[1] & 0x06) >> 1;
        res->protectionAbsent = (unsigned int)in[1] & 0x01;
        res->profile = ((unsigned int)in[2] & 0xc0) >> 6;
        res->samplingFreqIndex = ((unsigned int)in[2] & 0x3c) >> 2;
        res->privateBit = ((unsigned int)in[2] & 0x02) >> 1;
        res->channelCfg = ((((unsigned int)in[2] & 0x01) << 2) | (((unsigned int)in[3] & 0xc0) >> 6));
        res->originalCopy = ((unsigned int)in[3] & 0x20) >> 5;
        res->home = ((unsigned int)in[3] & 0x10) >> 4;
        res->copyrightIdentificationBit = ((unsigned int)in[3] & 0x08) >> 3;
        res->copyrightIdentificationStart = (unsigned int)in[3] & 0x04 >> 2;
        res->aacFrameLength = (((((unsigned int)in[3]) & 0x03) << 11) |
            (((unsigned int)in[4] & 0xFF) << 3) |
            ((unsigned int)in[5] & 0xE0) >> 5);
        res->adtsBufferFullness = (((unsigned int)in[5] & 0x1f) << 6 |
            ((unsigned int)in[6] & 0xfc) >> 2);
        res->numberOfRawDataBlockInFrame = ((unsigned int)in[6] & 0x03);

        return 0;
    }
    else
    {
        printf("failed to parse adts header\n");
        return -1;
    }
}

static int rtpSendAACFrame(int clientSockfd,
    struct RtpPacket* rtpPacket, uint8_t* frame, uint32_t frameSize) { 
    int ret;

    rtpPacket->payload[0] = 0x00;  // 固定
    rtpPacket->payload[1] = 0x10;
    rtpPacket->payload[2] = (frameSize & 0x1FE0) >> 5; //高8位
    rtpPacket->payload[3] = (frameSize & 0x1F) << 3; //低5位

    memcpy(rtpPacket->payload + 4, frame, frameSize);


    ret = rtpSendPacketOverTcp(clientSockfd, rtpPacket, frameSize + 4,0x02); // 在第2通道上传输

    if (ret < 0)
    {
        printf("failed to send rtp packet\n");
        return -1;
    }

    rtpPacket->rtpHeader.seq++;

    /*
     * 如果采样频率是44100
     * 一般AAC每个1024个采样为一帧
     * 所以一秒就有 44100 / 1024 = 43帧
     * 时间增量就是 44100 / 43 = 1025
     * 一帧的时间为 1 / 43 = 23ms
     */
    rtpPacket->rtpHeader.timestamp += 1025;

    return 0;
}


static int rtpSendH264Frame(int clientSockfd,
    struct RtpPacket* rtpPacket, char* frame, uint32_t frameSize)
{

    uint8_t naluType; // nalu第一个字节
    int sendByte = 0;
    int ret;

    naluType = frame[0];
    
    printf("%s frameSize=%d \n", __FUNCTION__, frameSize);

    if (frameSize <= RTP_MAX_PKT_SIZE) // nalu长度小于最大包场：单一NALU单元模式
    {

         //*   0 1 2 3 4 5 6 7 8 9
         //*  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         //*  |F|NRI|  Type   | a single NAL unit ... |
         //*  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

        memcpy(rtpPacket->payload, frame, frameSize);
        ret = rtpSendPacketOverTcp(clientSockfd, rtpPacket, frameSize,0x00);
        if(ret < 0)
            return -1;

        rtpPacket->rtpHeader.seq++;
        sendByte += ret;
        if ((naluType & 0x1F) == 7 || (naluType & 0x1F) == 8) // 如果是SPS、PPS就不需要加时间戳
        {

        }

    }
    else // nalu长度小于最大包：分片模式
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
            rtpPacket->payload[0] = (naluType & 0x60) | 28;
            rtpPacket->payload[1] = naluType & 0x1F;

            if (i == 0) //第一包数据
                rtpPacket->payload[1] |= 0x80; // start
            else if (remainPktSize == 0 && i == pktNum - 1) //最后一包数据
                rtpPacket->payload[1] |= 0x40; // end

            memcpy(rtpPacket->payload+2, frame+pos, RTP_MAX_PKT_SIZE);
            ret = rtpSendPacketOverTcp(clientSockfd, rtpPacket, RTP_MAX_PKT_SIZE+2,0x00);  // 在第0通道发送
            if(ret < 0)
                return -1;

            rtpPacket->rtpHeader.seq++;
            sendByte += ret;
            pos += RTP_MAX_PKT_SIZE;
        }

        // 发送剩余的数据
        if (remainPktSize > 0)
        {
            rtpPacket->payload[0] = (naluType & 0x60) | 28;
            rtpPacket->payload[1] = naluType & 0x1F;
            rtpPacket->payload[1] |= 0x40; //end

            memcpy(rtpPacket->payload+2, frame+pos, remainPktSize+2);
            ret = rtpSendPacketOverTcp(clientSockfd, rtpPacket, remainPktSize+2, 0x00);
            if(ret < 0)
                return -1;

            rtpPacket->rtpHeader.seq++;
            sendByte += ret;
        }
    }


    return sendByte;

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
        "m=video 0 RTP/AVP/TCP 96\r\n"
        "a=rtpmap:96 H264/90000\r\n"
        "a=control:track0\r\n"
        "m=audio 1 RTP/AVP/TCP 97\r\n"
        "a=rtpmap:97 mpeg4-generic/44100/2\r\n"
        "a=fmtp:97 profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3;config=1210;\r\n"
        "a=control:track1\r\n",

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

static int handleCmd_SETUP(char* result, int cseq)
{
    if (cseq == 3) {
        sprintf(result, "RTSP/1.0 200 OK\r\n"
            "CSeq: %d\r\n"
            "Transport: RTP/AVP/TCP;unicast;interleaved=0-1\r\n"  // 指定视频在0-1通道传输
            "Session: 66334873\r\n"
            "\r\n",
            cseq);
    }
    else if (cseq == 4) {
        sprintf(result, "RTSP/1.0 200 OK\r\n"
            "CSeq: %d\r\n"
            "Transport: RTP/AVP/TCP;unicast;interleaved=2-3\r\n"  // 指定音频在2-3通道传输
            "Session: 66334873\r\n"
            "\r\n",
            cseq);
    }


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

    char* rBuf = (char*)malloc(BUF_MAX_SIZE);
    char* sBuf = (char*)malloc(BUF_MAX_SIZE);

    while (true) {
        int recvLen;

        recvLen = recv(clientSockfd, rBuf, BUF_MAX_SIZE, 0);
        if (recvLen <= 0) {
            break;
        }

        rBuf[recvLen] = '\0';
        printf("接收请求 rBuf = %s \n", rBuf);

        const char* sep = "\n";

        char* line = strtok(rBuf, sep);
        while (line) {
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

                if (sscanf(line, "Transport: RTP/AVP/TCP;unicast;interleaved=0-1\r\n") != 0) {
                    // error
                    printf("parse Transport error \n");
                }
            }
            line = strtok(NULL, sep);
        }

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
            if (handleCmd_SETUP(sBuf, CSeq))
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
            printf("未定义的method = %s \n", method);
            break;
        }
        printf("响应 sBuf = %s \n", sBuf);

        send(clientSockfd, sBuf, strlen(sBuf), 0);


        //开始播放，发送RTP包
        if (!strcmp(method, "PLAY")) {

            std::thread t1([&]() {
                
                int frameSize, startCode;
                char* frame = (char*)malloc(500000);
                struct RtpPacket* rtpPacket = (struct RtpPacket*)malloc(500000);
                FILE* fp = fopen(H264_FILE_NAME, "rb");
                if (!fp) {
                    printf("读取 %s 失败\n", H264_FILE_NAME);
                    return;
                }
                rtpHeaderInit(rtpPacket, 0, 0, 0, RTP_VERSION, RTP_PAYLOAD_TYPE_H264, 0,
                    0, 0, 0x88923423);

                printf("start play\n");

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
                    rtpSendH264Frame(clientSockfd, rtpPacket, frame + startCode, frameSize);

                    rtpPacket->rtpHeader.timestamp += 90000 / 25;
    
                    //Sleep(40);//->30,20,
                    // Sleep(20);
                    usleep(40000);//1000/25 * 1000
                }
                free(frame);
                free(rtpPacket);
                
            });
            std::thread t2([&]() {
                struct AdtsHeader adtsHeader;
                struct RtpPacket* rtpPacket;
                uint8_t* frame;
                int ret;

                FILE* fp = fopen(AAC_FILE_NAME, "rb");
                if (!fp) {
                    printf("读取 %s 失败\n", AAC_FILE_NAME);
                    return;
                }

                frame = (uint8_t*)malloc(5000);
                rtpPacket = (struct RtpPacket*)malloc(5000);

                rtpHeaderInit(rtpPacket, 0, 0, 0, RTP_VERSION, RTP_PAYLOAD_TYPE_AAC, 1, 0, 0, 0x32411);

                while (true)
                {
                    ret = fread(frame, 1, 7, fp);
                    if (ret <= 0)
                    {
                        printf("fread err\n");
                        break;
                    }
                    printf("fread ret=%d \n", ret);

                    if (parseAdtsHeader(frame, &adtsHeader) < 0)
                    {
                        printf("parseAdtsHeader err\n");
                        break;
                    }
                    ret = fread(frame, 1, adtsHeader.aacFrameLength - 7, fp);
                    if (ret <= 0)
                    {
                        printf("fread err\n");
                        break;
                    }

                    rtpSendAACFrame(clientSockfd,
                        rtpPacket, frame, adtsHeader.aacFrameLength - 7);

           
                    // Sleep(23);
                    usleep(23223);//1000/43.06 * 1000
                }

                free(frame);
                free(rtpPacket);
            });

            t1.join();
            t2.join();

            break;
        }

        memset(method,0,sizeof(method)/sizeof(char));
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

    printf("%s rtsp://127.0.0.1:%d\n",__FILE__, SERVER_PORT);

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
