---
title: TCP_IP网络编程2
date: 2023-08-13 22:41:59 +0800
lastmod: 
summary: 
url: 
slug: TCP_IP_network_programming2
toc: false
rightToc: true
categories: 
- learn
tags: 
- TCP
- C++
- Network
original: true
author: Rurouni
website: www.keepjolly.com
---
## 进程间通信
### 进程间通信的基本概念
#### 管道实现进程间通信
![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506.png?imageMogr2/format/webp%7C)<br />可以看出，为了完成进程间通信，需要创建管道。管道并非属于进程的资源，而是和套接字一样，属于操作系统（也就不是 fork 函数的复制对象）。所以，两个进程通过操作系统提供的内存空间进行通信。下面是创建管道的函数。
```cpp
#include <unistd.h>
int pipe(int filedes[2]);
/*
成功时返回 0 ，失败时返回 -1
filedes[0]: 通过管道接收数据时使用的文件描述符，即管道出口
filedes[1]: 通过管道传输数据时使用的文件描述符，即管道入口
*/
```
#### 单向通信
```cpp
// 调用  pipe 函数创建管道，fds 数组中保存用于 I/O 的文件描述符
pipe(fds);
pid = fork(); //子进程将同时拥有创建管道获取的2个文件描述符，复制的并非管道，而是文件描述符
if (pid == 0) {
    write(fds[1], str, sizeof(str));
}
else {
    read(fds[0], buf, BUF_SIZE);
    puts(buf);
}
```
![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-1.png?imageMogr2/format/webp%7C)
#### 双向通信
![image](https://cdn.nlark.com/yuque/0/2023/png/12600461/1686926856566-2572cdd9-7a1e-4f1b-b49f-1610e73b306f.png#averageHue=%23ebebeb&clientId=u146b6ba8-d8f8-4&from=paste&id=u7a0be122&originHeight=279&originWidth=477&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u0175482d-e892-498a-bc22-3038832ba0d&title=)<br />上述单个pipe可能会导致数据接收问题，即子进程把所有数据都读完，需要sleep函数。采用下述方法好一些，但是多加一个pipe<br />![](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-2.png?imageMogr2/format/webp%7C)
```cpp
pipe(fds1), pipe(fds2);
    pid = fork();
    if (pid == 0)
    {
        write(fds1[1], str1, sizeof(str1));
        read(fds2[0], buf, BUF_SIZE);
        printf("Child proc output: %s \n", buf);
    }
    else
    {
        read(fds1[0], buf, BUF_SIZE);
        printf("Parent proc output: %s \n", buf);
        write(fds2[1], str2, sizeof(str2));
    }
```
#### 总结
进程间通信意味着两个不同的进程间可以交换数据。从内存上来说，就是两个进程可以访问同一个内存区域，然后通过这个内存区域数据的变化来进行通信。
## I/O 复用
### 基于 I/O 复用的服务器端
多进程服务端的缺点：为了构建并发服务器，只要有客户端连接请求就会创建新进程。这的确是实际操作中采用的一种方案，但并非十全十美，因为创建进程要付出很大的代价。这需要大量的运算和内存空间，由于每个进程都具有独立的内存空间，所以相互间的数据交换也要采用相对复杂的方法（IPC 属于相对复杂的通信方法）。<br />I/O 复用技术可以解决这个问题。<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-3.png?imageMogr2/format/webp%7C)<br />无论连接多少客户端，提供服务的进程只有一个。
### 理解 select 函数并实现服务端
select 函数是最具代表性的实现复用服务器的方法。在 Windows 平台下也有同名函数，所以具有很好的移植性。<br />select 函数的调用过程如下图所示：<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-4.png?imageMogr2/format/webp%7C)
### 设置文件描述符
利用 select 函数可以**同时监视多个文件描述符**。当然，监视文件描述符可以视为监视套接字。此时首先需要将要监视的文件描述符集中在一起。集中时也要按照监视项（**接收、传输、异常**）进行区分，即按照上述 3 种监视项分成 3 类。<br />利用 fd_set 数组变量执行此操作，如图所示，该数组是存有0和1的位数组。<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-5.png?imageMogr2/format/webp%7C)<br />图中最左端表示文件描述符 0。如果该位设置为 1，则表示该文件描述符是监视对象。图中文件描述符 1 和 3是监视对象。在 fd_set 变量中注册或更改值的操作都由下列宏完成。

- FD_ZERO(fd_set *fdset)：将 fd_set 变量所指的位全部初始化成0
- FD_SET(int fd,fd_set *fdset)：在参数 fdset 指向的变量中注册文件描述符 fd 的信息
- FD_CLR(int fd,fd_set *fdset)：从参数 fdset 指向的变量中清除文件描述符 fd 的信息
- FD_ISSET(int fd,fd_set *fdset)：若参数 fdset 指向的变量中包含文件描述符 fd 的信息，则返回「真」

![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-6.png?imageMogr2/format/webp%7C)
#### 设置检查（监视）范围及超时
下面是 select 函数的定义：
```cpp
#include <sys/select.h>
#include <sys/time.h>

int select(int maxfd, fd_set *readset, fd_set *writeset,
           fd_set *exceptset, const struct timeval *timeout);
/*
成功时返回大于 0 的值，失败时返回 -1
maxfd: 监视对象文件描述符数量
readset: 将所有关注「是否存在待读取数据」的文件描述符注册到 fd_set 型变量，并传递其地址值。
writeset: 将所有关注「是否可传输无阻塞数据」的文件描述符注册到 fd_set 型变量，并传递其地址值。
exceptset: 将所有关注「是否发生异常」的文件描述符注册到 fd_set 型变量，并传递其地址值。
timeout: 调用 select 函数后，为防止陷入无限阻塞的状态，传递超时(time-out)信息
返回值: 发生错误时返回 -1,超时时返回0,。因发生关注的时间返回时，返回大于0的值，该值是发生事件的文件描述符数。
*/
```
如上所述，select 函数用来验证 3 种监视的变化情况，根据监视项声明 3 个 fd_set 型变量，分别向其注册文件描述符信息，并把变量的地址值传递到上述函数的第二到第四个参数。但在此之前（调用 select 函数之前）需要决定下面两件事：

1. 文件描述符的监视（检查）范围是？
2. 如何设定 select 函数的超时时间？

第一，文件描述符的监视范围和 select 的第一个参数有关。实际上，select 函数要求通过第一个参数传递监视对象文件描述符的数量。因此，需要得到注册在 fd_set 变量中的文件描述符数。但每次新建文件描述符时，其值就会增加 1 ，故只需**将最大的文件描述符值加 1 **再传递给 select 函数即可。加 1 是因为文件描述符的值是从 0 开始的。<br />第二，select 函数的超时时间与 select 函数的最后一个参数有关，其中 timeval 结构体定义如下：
```cpp
struct timeval
{
    long tv_sec;
    long tv_usec;
};
```
本来 select 函数只有在监视文件描述符发生变化时才返回。如果未发生变化，就会进入阻塞状态。指定超时时间就是为了防止这种情况的发生。通过上述结构体变量，将秒数填入 tv_sec 的成员，将微秒数填入 tv_usec 的成员，然后将结构体的地址值传递到 select 函数的最后一个参数。此时，即使文件描述符未发生变化，只要过了指定时间，也可以从函数中返回。不过这种情况下， select 函数返回 0 。因此，可以通过返回值了解原因。如果**不想设置超时，则传递 NULL 参数**。
```cpp
FD_ZERO(&reads);
FD_SET(serv_sock, &reads);
fd_max = serv_sock;

while (1){
    cpy_reads = reads;
    timeout.tv_sec = 3;
    timeout.tv_usec = 0;
    if ((fd_num = select(fd_max + 1, &cpy_reads, 0, 0, &timeout)) == -1) //开始监视,每次重新监听
        break;
    if (fd_num == 0) 
        continue;
    for (int i = 0; i < fd_max + 1; ++i) {
        if (FD_ISSET(i, &cpy_reads))  {
            if (i == serv_sock) {  // 等于服务器描述符
                adr_sz = sizeof(clnt_adr);
                clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);

                FD_SET(clnt_sock, &reads); // 加入客户端描述符
                if (fd_max < clnt_sock) fd_max = clnt_sock;
                printf("connect client: %d\n", clnt_sock);
            }
            else  {  // 等于客户端描述符
                str_len = read(i, buf, BUF_SIZE);
                if (str_len == 0) {
                    FD_CLR(i, &reads);
                    close(i);
                    printf("close client %d\n", i);
                }else {
                    write(i, buf, str_len);
                }
            }
        }
    }
}
```
## 多种 I/O 函数
### send & recv 函数
```cpp
#include <sys/socket.h>
ssize_t send(int sockfd, const void *buf, size_t nbytes, int flags);
/*
成功时返回发送的字节数，失败时返回 -1
sockfd: 表示与数据传输对象的连接的套接字和文件描述符
buf: 保存待传输数据的缓冲地址值
nbytes: 待传输字节数
flags: 传输数据时指定的可选项信息
*/
ssize_t recv(int sockfd, void *buf, size_t nbytes, int flags);
/*
成功时返回接收的字节数（收到 EOF 返回 0），失败时返回 -1
sockfd: 表示数据接受对象的连接的套接字文件描述符
buf: 保存接受数据的缓冲地址值
nbytes: 可接收的最大字节数
flags: 接收数据时指定的可选项参数
*/
```
send 和 recv 函数的最后一个参数是收发数据的可选项，该选项可以用位或（bit OR）运算符同时传递多个信息 (MSG_OOB | MSG_PEEK )<br />send & recv 函数的可选项意义：

| 可选项（Option） | 含义 | send | recv |
| --- | --- | --- | --- |
| MSG_OOB | 用于传输带外数据（Out-of-band data） | O | O |
| MSG_PEEK | 验证输入缓冲中是否存在接受的数据，不会清空缓冲区数据 | X | O |
| MSG_DONTROUTE | 数据传输过程中不参照本地路由（Routing）表，在本地（Local）网络中寻找目的地 | O | X |
| MSG_DONTWAIT | 调用 I/O 函数时不阻塞，用于使用非阻塞（Non-blocking）I/O | O | O |
| MSG_WAITALL | 防止函数返回，直到接收到全部请求的字节数 | X | O |

#### MSG_OOB：发送紧急消息
代码参考：<br />[https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch13/oob_recv.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch13/oob_recv.c)<br />[https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch13/oob_send.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch13/oob_send.c)<br />代码中关于:
> fcntl(recv_sock, F_SETOWN, getpid());

的意思是：
> 文件描述符 recv_sock 指向的套接字引发的 SIGURG 信号处理进程变为 getpid 函数返回值用作 ID 进程.

上述描述中的「处理 SIGURG 信号」指的是「调用 SIGURG 信号处理函数」。但是之前讲过，多个进程可以拥有 1 个套接字的文件描述符。例如，通过调用 fork 函数创建子进程并同时复制文件描述符。此时如果发生 SIGURG 信号，应该调用哪个进程的信号处理函数呢？可以肯定的是，不会调用所有进程的信号处理函数。因此，处理 SIGURG 信号时必须指定处理信号所用的进程，而 getpid 返回的是调用此函数的进程 ID 。上述调用语句指**当前为处理 SIGURG 信号的主体**。<br />输出结果，可能出乎意料：
> 通过 MSG_OOB 可选项传递数据时只返回 1 个字节，而且也不快

的确，通过 MSG_OOB 并不会加快传输速度，而通过信号处理函数 urg_handler 也只能读取一个字节。剩余数据只能通过未设置 MSG_OOB 可选项的普通输入函数读取。因为 TCP 不存在真正意义上的「外带数据」。实际上，MSG_OOB 中的 OOB 指的是 Out-of-band ，而「外带数据」的含义是：
> 通过完全不同的通信路径传输的数据

即真正意义上的 Out-of-band 需要通过单独的通信路径高速传输数据，但是 TCP 不另外提供，只利用 TCP 的紧急模式（Urgent mode）进行传输。<br />[紧急模式工作原理](https://github.com/Rurouni-z/TCP-IP-NetworkNote/tree/master/ch13#1313-%E7%B4%A7%E6%80%A5%E6%A8%A1%E5%BC%8F%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86)<br />指定 MSG_OOB 选项的数据包本身就是紧急数据包，并通过紧急指针表示紧急消息所在的位置。<br />紧急消息的意义在于督促消息处理，而非紧急传输形式受限的信息。
#### 检查输入缓冲
同时设置 MSG_PEEK 选项和 MSG_DONTWAIT 选项，以验证输入缓冲是否存在接收的数据。设置 MSG_PEEK 选项并调用 recv 函数时，即使**读取了输入缓冲的数据也不会删除**。因此，该选项通常与 MSG_DONTWAIT （会删除数据）合作，用于以非阻塞方式验证待读数据存在与否。
### readv & writev 函数
readv & writev 函数的功能可概括如下：
> 对数据进行整合传输及发送的函数

也就是说，通过 writev 函数可以将分散保存在多个缓冲中的数据一并发送，通过 readv 函数可以由多个缓冲分别接收。因此，使用这 2 个函数可以减少 I/O 函数的调用次数。
#### writev 函数
```cpp
#include <sys/uio.h>
ssize_t writev(int filedes, const struct iovec *iov, int iovcnt);
/*
成功时返回发送的字节数，失败时返回 -1
filedes: 表示数据传输对象的套接字文件描述符。但该函数并不仅限于套接字，因此，可以像 read 一样向向其传递文件或标准输出描述符.
iov: iovec 结构体数组的地址值，结构体 iovec 中包含待发送数据的位置和大小信息
iovcnt: 向第二个参数传递数组长度
*/
struct iovec
{
    void *iov_base; //缓冲地址
    size_t iov_len; //缓冲大小
};
```
![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-7.png?imageMogr2/format/webp%7C)<br />writev 的第一个参数，是文件描述符，因此‘1’代表向控制台输出数据，ptr 是存有待发送数据信息的 iovec 数组指针。第三个参数为 2，因此，从 ptr 指向的地址开始，共浏览 2 个 iovec 结构体变量，发送这些指针指向的缓冲数据。
```cpp
#include <stdio.h>
#include <sys/uio.h>
int main(int argc, char *argv[])
{
    struct iovec vec[2];
    char buf1[] = "ABCDEFG";
    char buf2[] = "1234567";
    int str_len;

    vec[0].iov_base = buf1;
    vec[0].iov_len = 3;
    vec[1].iov_base = buf2;
    vec[1].iov_len = 4;

    str_len = writev(1, vec, 2);
    puts("");
    printf("Write bytes: %d \n", str_len);
    return 0;
}
```
#### readv 函数
```cpp
#include <sys/uio.h>
ssize_t readv(int filedes, const struct iovc *iov, int iovcnt);
/*
成功时返回接收的字节数，失败时返回 -1
filedes: 表示数据传输对象的套接字文件描述符。但该函数并不仅限于套接字，因此，可以像 write 一样向向其传递文件或标准输出描述符.
iov: iovec 结构体数组的地址值，结构体 iovec 中包含待数据保存的位置和大小信息
iovcnt: 第二个参数中数组的长度
*/
#include <stdio.h>
#include <sys/uio.h>
#define BUF_SIZE 100

int main(int argc, char *argv[])
{
    struct iovec vec[2];
    char buf1[BUF_SIZE] = {
        0,
    };
    char buf2[BUF_SIZE] = {
        0,
    };
    int str_len;

    vec[0].iov_base = buf1;
    vec[0].iov_len = 5; // 先收取5个
    vec[1].iov_base = buf2;
    vec[1].iov_len = BUF_SIZE;  // 再接收剩下100个
	// 0 控制台输入
    str_len = readv(0, vec, 2);
    printf("Read bytes: %d \n", str_len);
    printf("First message: %s \n", buf1);
    printf("Second message: %s \n", buf2);
    return 0;
}

```
#### 合理使用 readv & writev 函数
实际上，能使用该函数的所有情况都适用。例如，需要传输的数据分别位于不同缓冲（数组）时，需要多次调用 write 函数。此时可通过 1 次 writev 函数调用替代操作，当然会提高效率。同样，需要将输入缓冲中的数据读入不同位置时，可以不必多次调用 read 函数，而是利用 1 次 readv 函数就能大大提高效率。<br />其意义在于**减少数据包个数**。假设为了提高效率在服务器端明确禁用了 Nagle 算法。其实 writev 函数在不采用 Nagle 算法时更有价值，如图：<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-8.png?imageMogr2/format/webp%7C)
## 多播与广播
### 多播
多播（Multicast）方式的数据传输是**基于 UDP **完成的。因此 ，与 UDP 服务器端/客户端的实现方式非常接近。区别在于，UDP 数据传输以单一目标进行，而多播数据同时传递到加入（注册）特定组的大量主机。换言之，采用多播方式时，可以**同时向多个主机传递数据**。
#### 多播的数据传输方式以及流量方面的优点
多播的数据传输特点可整理如下：

- 多播**服务器端**针对特定多播组，只**发送 1 次**数据。
- 即使只发送 1 次数据，但该组内的所有客户端**都会接收数据**
- 多播组数可以在 IP 地址范围内任意增加

多播组是 D 类IP地址（224.0.0.0~239.255.255.255），「加入多播组」可以理解为通过程序完成如下声明：
> 在 D 类IP地址中，我希望接收发往目标 239.234.218.234 的多播数据

多播是基于 UDP 完成的，也就是说，多播数据包的格式与 UDP 数据包相同。只是与一般的 UDP 数据包不同。向网络传递 1 个多播数据包时，路由器将复制该数据包并传递到多个主机。像这样，多播需要借助路由器完成。如图所示：<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-9.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-9.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />若通过 TCP 或 UDP 向 1000 个主机发送文件，则共需要传递 1000 次。但是此时如果用多播网络传输文件，则只需要发送一次。这时由 1000 台主机构成的网络中的路由器负责复制文件并传递到主机。就因为这种特性，多播主要用于「**多媒体数据实时传输**」。<br />另外，理论上可以完成多播通信，但是不少路由器并不支持多播，或即便支持也因网络拥堵问题故意阻断多播。因此，为了在不支持多播的路由器中完成多播通信，也会**使用隧道（Tunneling）技术**。
#### 路由（Routing）和 TTL（Time to Live,生存时间），以及加入组的办法
为了传递多播数据包，必须设置 TTL 。TTL 是 Time to Live的简写，是决定「数据包传递距离」的主要因素。TTL 用整数表示，并且**每经过一个路由器就减一**。TTL 变为 0 时，该数据包就无法再被传递，只能销毁。因此，TTL 的值设置过大将影响网络流量。当然，设置过小，也无法传递到目标。<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-10.png?imageMogr2/format/webp%7C)<br />TTL 是可以通过第九章的套接字可选项完成的。与设置 TTL 相关的协议层为 IPPROTO_IP ，选项名为 IP_MULTICAST_TTL。用如下代码把 TTL 设置为 64: 
```cpp
int send_sock;
int time_live = 64;
...
send_sock=socket(PF_INET,SOCK_DGRAM,0);
setsockopt(send_sock,IPPROTO_IP,IP_MULTICAST_TTL,(void*)&time_live,sizeof(time_live);
...
```
加入多播组也通过设置套接字可选项来完成。加入多播组相关的协议层也为 IPPROTO_IP，选项名为 IP_ADD_MEMBERSHIP 。可通过如下代码加入多播组：
```cpp
int recv_sock;
struct ip_mreq join_adr;
...
recv_sock=socket(PF_INET,SOCK_DGRAM,0);
...
join_adr.imr_multiaddr.s_addr="多播组地址信息";
join_adr.imr_interface.s_addr="加入多播组的主机地址信息";
setsockopt(recv_sock,IPPROTO_IP,IP_ADD_MEMBERSHIP,(void*)&join_adr,sizeof(join_adr);
...
"""
struct ip_mreq
{
    struct in_addr imr_multiaddr;  // 多播组的IP地址
    struct in_addr imr_interface;  // 待加入的IP地址
};
"""
```
#### 实现多播 Sender 和 Receiver

- [news_sender.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch14/news_sender.c)
- [news_receiver.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch14/news_receiver.c)
- 代码中recviver不会停止，阻塞等待sender消息
- 延迟运行 receiver 将无法接受之前发送的信息。
### 广播
多播即使在跨越不同网络的情况下，只要加入多播组就能接受数据。相反，广播只能向同一网络中的主机传输数据。多播传输数据的范围有区别。
#### 广播的理解和实现方式
广播是向同一网络中的所有主机传输数据的方法。与多播相同，广播也是通过 UDP 来完成的。根据传输数据时使用的IP地址形式，广播分为以下两种：

- 直接广播（Directed Broadcast）
- 本地广播（Local Broadcast）

二者在实现上的差别主要在于IP地址。直接广播的IP地址中除了网络地址外，**其余主机地址全部设置成 1**。例如，希望向网络地址 192.12.34 中的所有主机传输数据时，可以向 192.12.34.255 传输。换言之，可以采取直接广播的方式**向特定区域内所有主机传输数据**。<br />反之，本地广播中使用的IP地址限定为 255.255.255.255 。例如，192.32.24 **网络中的主机**向 255.255.255.255 传输数据时，数据将传输到 192.32.24 **网络中所有主机**。<br />**数据通信中使用的IP地址是与 UDP 示例的唯一区别。默认生成的套接字会阻止广播，因此，只需通过如下代码更改默认设置。**
```cpp
int send_sock;
int bcast;
send_sock=socket(PF_INET,SOCK_DGRAM,0);
setsockopt(send_sock,SOL_SOCKET,SO_BROADCAST,(void*)&bcast,sizeof(bcast));
```
下面是广播数据的 Sender 和 Receiver的代码：

- [news_sender_brd.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch14/news_sender_brd.c)
- [news_receiver_brd.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch14/news_receiver_brd.c)
## 套接字和标准I/O
### 标准 I/O 的优缺点

- 优点
   - 标准 I/O 函数具有良好的移植性
   - 标准 I/O 函数可以利用缓冲提高性能
- 缺点
   - 不容易进行双向通信
   - 有时可能频繁调用 fflush 函数
   - 需要以 FILE 结构体指针的形式返回文件描述符。

创建套接字时，操作系统会准备 I/O 缓冲。此缓冲在执行 TCP 协议时发挥着非常重要的作用。此时若使用标准 I/O 函数，将得到**额外的缓冲支持**。如下图：<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-11.png?imageMogr2/format/webp%7C)<br />假设使用 fputs 函数进行传输字符串 「Hello」时，首先将数据传递到标准 I/O 缓冲，然后将数据移动到套接字输出缓冲，最后fflush将字符串发送到对方主机。
### 使用标准 I/O 函数
#### 利用 fdopen 函数转换为 FILE 结构体指针
```cpp
#include <stdio.h>
FILE *fdopen(int fildes, const char *mode);
/*
将文件描述符转换为标准IO
成功时返回转换的 FILE 结构体指针，失败时返回 NULL
fildes ： 需要转换的文件描述符
mode ： 将要创建的 FILE 结构体指针的模式信息
*/

```
#### 利用 fileno 函数转换为文件描述符
```cpp
#include <stdio.h>
int fileno(FILE *stream);
/*
成功时返回文件描述符，失败时返回 -1
*/
```
### 基于套接字的标准 I/O 函数使用
把第四章的回声客户端和回声服务端的内容改为基于标准 I/O 函数的数据交换形式。<br />代码如下：

- [echo_client.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch15/echo_client.c)
- [echo_stdserv.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch15/echo_stdserv.c)
## I/O 流分离的其他内容
之前两种分离方法：

- 第一种是「TCP I/O 过程」分离。通过**调用 fork 函数**复制出一个文件描述符，以区分输入和输出中使用的文件描述符。虽然文件描述符本身不会根据输入和输出进行区分，但我们分开了 2 个文件描述符的用途，因此，这也属于「流」的分离。
- 第二种分离是通过 2 次**调用fdopen 函数**，创建读模式 FILE 指针（FILE 结构体指针）和写模式 FILE 指针。换言之，我们分离了输入工具和输出工具，因此也可视为「流」的分离。下面是分离的理由。
#### 分离「流」的好处
首先是fork的分离目的：

- 通过分开输入过程（代码）和输出过程降低实现难度
- 与输入无关的输出操作可以提高速度

下面是fdopen分离的目的：

- 为了将 FILE 指针按读模式和写模式加以区分
- 可以通过区分读写模式降低实现难度
- 通过区分 I/O 缓冲提高缓冲性能
#### 「流」分离带来的 EOF 问题
close()一个fdopen会关闭整个套接字<br />![image](https://cdn.nlark.com/yuque/0/2023/png/12600461/1689249181825-0c3d1dcb-c148-4a37-895c-3847e35814bf.png#averageHue=%23d5d5d5&clientId=ud362a5e0-75d0-4&from=paste&height=165&id=u340713e9&originHeight=198&originWidth=470&originalType=binary&ratio=1.2&rotation=0&showTitle=false&size=70970&status=done&style=none&taskId=udc8d66f8-5e2c-407e-a380-e88a9cae3d2&title=&width=391.6666666666667)<br />![图片.png](https://cdn.nlark.com/yuque/0/2023/png/12600461/1689249194614-bbc5b267-3632-412f-8403-8be5fd246c3d.png#averageHue=%23d6d6d6&clientId=ud362a5e0-75d0-4&from=paste&height=174&id=ubec88290&originHeight=209&originWidth=463&originalType=binary&ratio=1.2&rotation=0&showTitle=false&size=80887&status=done&style=none&taskId=u58c328a6-bafc-40a1-b08b-011ea96fef9&title=&width=385.83333333333337)<br />只需要创建 FILE 指针前**先复制文件描述符**即可。复制后另外创建一个文件描述符，然后利用各自的文件描述符生成读模式的 FILE 指针和写模式的 FILE 指针。<br />![图片.png](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-12.png?imageMogr2/format/webp%7C)<br />这就为半关闭创造好了环境，因为套接字和文件描述符具有如下关系：
> 销毁所有文件描述符候才能销毁套接字

也就是说，针对写模式 FILE 指针调用 fclose 函数时，只能销毁与该 FILE 指针相关的文件描述符，无法销毁套接字。<br />那么调用 fclose 函数候还剩下 1 个文件描述符，因此没有销毁套接字。那此时的状态是否为半关闭状态？不是！只是准备好了进入半关闭状态，而不是已经进入了半关闭状态。仔细观察，还剩下一个文件描述符。而该文件描述符可以同时进行 I/O 。因此，不但没有发送 EOF ，而且仍然可以利用文件描述符进行输出。
##### 流的分离

1. 复制文件描述符，使用dup/dup2函数

与调用 fork 函数不同，调用 fork 函数将复制整个进程，此处讨论的是同一进程内完成对完成描述符的复制。如图：<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-13.png?imageMogr2/format/webp%7C)
```cpp
#include <unistd.h>
int dup(int fildes);
int dup2(int fildes, int fildes2);
/*
成功时返回复制的文件描述符，失败时返回 -1
fildes : 需要复制的文件描述符
fildes2 : 明确指定的文件描述符的整数值。
dup2 函数明确指定复制的文件描述符的整数值。
向其传递大于 0 且小于进程能生成的最大文件描述符值时，
该值将成为复制出的文件描述符值。
0 stdin；1 stdout；2 error
*/
```

2. 使用shutdown，半关闭描述符
   1. shutdown(fileno(writefp), SHUT_WR); 
   2. close(writefp)
   3. [It's important to note ](https://beej.us/guide/bgnet/html/#close-and-shutdownget-outta-my-face)that shutdown() doesn't actually close the file descriptor—it just **changes its usability**. To free a socket descriptor, you need to use close().
## 优于 select 的 epoll
### epoll 理解及应用
select 复用方法由来已久，因此，利用该技术后，无论如何优化程序性能也**无法同时介入上百个客户端**。
#### 基于 select 的 I/O 复用技术速度慢的原因
第 12 章实现了基于 select 的 I/O 复用技术服务端，其中有不合理的设计如下：

- 调用 select 函数后常见的针对所有文件描述符的循环语句
- 每次调用 select 函数时都需要向该函数传递监视对象信息

上述两点可以从 [echo_selectserv.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch12/echo_selectserv.c) 得到确认，调用 select 函数后，并不是把发生变化的文件描述符单独集中在一起，而是通过**作为监视对象的 fd_set 变量的变化，找出发生变化的文件描述符**（54,56行），因此无法避免针对所有监视对象的循环语句。而且，作为监视对象的 fd_set 会发生变化，所以调用 select 函数前应该复制并保存原有信息，并在每次调用 select 函数时**传递新的监视对象信息**。<br />select 性能上最大的弱点是：**每次传递监视对象信息**，准确的说，select 是监视套接字变化的函数。而套接字是操作系统管理的，所以 select 函数要借助操作系统才能完成功能。select 函数的这一缺点可以通过如下方式弥补：
> 仅向操作系统传递一次监视对象，监视范围或内容发生变化时只通知发生变化的事项

这样就无需每次调用 select 函数时都向操作系统传递监视对象信息，但是前提操作系统支持这种处理方式。Linux 的支持方式是 epoll ，Windows 的支持方式是 IOCP。
#### select 优点
select 的兼容性比较高，这样就可以支持很多的操作系统，不受平台的限制，满足以下两个条件使可以使用 select 函数：

- 服务器接入者少
- 程序应该具有兼容性
#### 实现 epoll 时必要的函数和结构体
能够克服 select 函数缺点的 epoll 函数具有以下优点，这些优点正好与之前的 select 函数缺点相反。

- 无需编写以监视状态变化为目的的针对所有文件描述符的循环语句
- 调用对应于 select 函数的 epoll_wait 函数时无需每次传递监视对象信息。

下面是 epoll 函数的功能：

- epoll_create：创建保存 epoll 文件描述符的空间
- epoll_ctl：向空间注册并注销文件描述符
- epoll_wait：与 select 函数类似，等待文件描述符发生变化

select 函数中为了保存监视对象的文件描述符，直接声明了 fd_set 变量，但epoll方式让操作系统负责保存监视对象文件描述符，因此需要向操作系统请求创建保存文件描述符的空间，此时用的函数就是 epoll_create 。<br />此外，为了**添加和删除监视对象文件描述符**，select 方式中需要 FD_SET、FD_CLR 函数。但在 epoll 方式中，**通过 epoll_ctl 函数请求操作系统完成**。最后，select 方式下调用 select 函数等待文件描述符的变化，而 epoll_wait 调用 epoll_wait 函数。还有，select 方式中通过 fd_set 变量查看监视对象的状态变化，而 epoll 方式通过如下结构体 epoll_event 将发生变化的文件描述符单独集中在一起。
```cpp
struct epoll_event
{
    __uint32_t events;
    epoll_data_t data;
};
typedef union epoll_data {
    void *ptr;
    int fd;
    __uint32_t u32;
    __uint64_t u64;
} epoll_data_t;
```
声明足够大的 epoll_event 结构体数组后，传递给 epoll_wait 函数时，发生变化的文件描述符信息将被填入数组。因此，无需像 select 函数那样针对所有文件描述符进行循环。
#### epoll_create
epoll 是从 Linux 的 2.5.44 版内核开始引入的。通过以下命令可以查看 Linux 内核版本（老式机子需要检查）：
> cat /proc/sys/kernel/osrelease

epoll_create 原型
```cpp
#include <sys/epoll.h>
int epoll_create(int size);
/*
成功时返回 epoll 的文件描述符，失败时返回 -1
size：epoll 实例的大小
*/
```
调用 epoll_create 函数时创建的文件描述符保存空间称为「**epoll 例程**」，但有些情况下名称不同，需要稍加注意。通过参数 size 传递的值决定 epoll 例程的大小，但该值只是向操作系统提出的建议。换言之，size 并不用来决定 epoll 的大小，而仅供操作系统参考（Linux3.6.8后**完全忽略size建议**）。<br />epoll_create 函数创建的资源与套接字相同，也由操作系统管理。因此，该函数和创建套接字的情况相同，也会返回文件描述符，也就是说返回的文件描述符主要用于区分 epoll 例程。需要终止时，与其他文件描述符相同，也**要调用 close 函数。**
#### epoll_ctl
生成例程后，应在其内部注册监视对象文件描述符，此时使用 epoll_ctl 函数。
```cpp
#include <sys/epoll.h>
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
/*
成功时返回 0 ，失败时返回 -1
epfd：用于注册监视对象的 epoll 例程的文件描述符
op：用于指定监视对象的添加、删除或更改等操作
fd：需要注册的监视对象文件描述符
event：监视对象的事件类型

op:
EPOLL_CTL_ADD：将文件描述符注册到 epoll 例程
EPOLL_CTL_DEL：从 epoll 例程中删除文件描述符
EPOLL_CTL_MOD：更改注册的文件描述符的关注事件发生情况
*/
```
与其他 epoll 函数相比，该函数看起来有些复杂，但通过调用语句就很容易理解，假设按照如下形式调用 epoll_ctl 函数：
> epoll_ctl(A,EPOLL_CTL_ADD,B,C);
> epoll 例程 A 中**注册**文件描述符 B ，主要目的是为了监视参数 C 中的事件

> epoll_ctl(A,EPOLL_CTL_DEL,B,NULL);
> 从 epoll 例程 A 中删除文件描述符 B

epoll_event 结构体用于和保存事件的文件描述符结合。但也可以在 epoll_ctl中注册文件描述符时，用于注册关注的事件。该函数中 epoll_event 结构体的定义并不显眼，因此通过调用语句说明该结构体在 epoll_ctl 函数中的应用。
```cpp
struct epoll_event event;
...
event.events=EPOLLIN;//发生需要读取数据的情况时
event.data.fd=sockfd;
epoll_ctl(epfd,EPOLL_CTL_ADD,sockfd,&event);
...
```
上述代码将 sockfd 注册到 epoll 例程 epfd 中，并在需要读取数据的情况下产生相应事件。接下来给出 epoll_event 的成员 events 中可以保存的常量及所指的事件类型。

- EPOLLIN：需要读取数据的情况
- EPOLLOUT：输出缓冲为空，可以立即发送数据的情况
- EPOLLPRI：收到 OOB 数据的情况
- EPOLLRDHUP：断开连接或半关闭的情况，这在边缘触发方式下非常有用
- EPOLLERR：发生错误的情况
- EPOLLET：以边缘触发的方式得到事件通知
- EPOLLONESHOT：发生一次事件后，相应文件描述符不再收到事件通知。因此需要向 epoll_ctl 函数的第二个参数传递 EPOLL_CTL_MOD ，再次设置事件。

可通过位或运算 | 同时传递多个上述参数。
#### epoll_wait
```cpp
#include <sys/epoll.h>
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
/*
成功时返回发生事件的文件描述符个数，失败时返回 -1
epfd : 表示事件发生监视范围的 epoll 例程的文件描述符
events : 保存发生事件的文件描述符集合的结构体地址值
maxevents : 第二个参数中可以保存的最大事件数
timeout : 以 1/1000 秒为单位的等待时间，传递 -1 时，一直等待直到发生事件
*/
```
该函数调用方式如下。需要注意的是，第二个参数所指缓冲需要动态分配。
```cpp
int event_cnt;
struct epoll_event *ep_events;
...
ep_events=malloc(sizeof(struct epoll_event)*EPOLL_SIZE);//EPOLL_SIZE是宏常量
...
event_cnt=epoll_wait(epfd,ep_events,EPOLL_SIZE,-1);
...
```
调用函数后，返回发生事件的文件描述符个数，同时在第二个参数指向的缓冲中保存发生事件的文件描述符集合。因此，无需像 select 一样插入针对所有文件描述符的循环。
#### 基于 epoll 的回声服务器端
```cpp
#define EPOLL_SIZE 100
struct epoll_event *ep_events; // 用指针可以存储多个event
struct epoll_event event;   // 单个event用于指明事件信息
int epfd = epoll_create(EPOLL_SIZE); //可以忽略这个参数，填入的参数为操作系统参考
ep_events = malloc(sizeof(struct epoll_event) * EPOLL_SIZE);

event.events = EPOLLIN; //需要读取数据的情况
event.data.fd = serv_sock;
epoll_ctl(epfd, EPOLL_CTL_ADD, serv_sock, &event); //例程epfd 中添加文件描述符 serv_sock，目的是监听 enevt 中的事件

while (1)
{
    event_cnt = epoll_wait(epfd, ep_events, EPOLL_SIZE, -1); //获取改变了的文件描述符，返回数量
    if (event_cnt == -1)
    {
        puts("epoll_wait() error");
        break;
    }

    for (i = 0; i < event_cnt; i++)  // 循环次数变少，只有发生变化的文件描述符
    {
        if (ep_events[i].data.fd == serv_sock) //客户端请求连接时
        {
            adr_sz = sizeof(clnt_adr);
            //  (struct sockaddr *)&clnt_sock  可以连接上第一次但是下一次就重复循环
            clnt_sock = accept(serv_sock, (struct sockaddr *)&clnt_adr, &adr_sz);
            event.events = EPOLLIN;
            event.data.fd = clnt_sock; //把客户端套接字添加进去
            epoll_ctl(epfd, EPOLL_CTL_ADD, clnt_sock, &event);
            printf("connected client : %d \n", clnt_sock);
        }
        else //是客户端套接字时
        {
            str_len = read(ep_events[i].data.fd, buf, BUF_SIZE);
            if (str_len == 0)
            {
                epoll_ctl(epfd, EPOLL_CTL_DEL, ep_events[i].data.fd, NULL); //从epoll中删除套接字
                close(ep_events[i].data.fd);
                printf("closed client : %d \n", ep_events[i].data.fd);
            }
            else
            {
                write(ep_events[i].data.fd, buf, str_len);
            }
        }
    }
}
close(serv_sock);
close(epfd);
```
总结一下 epoll 的流程：

1. epoll_create 创建一个保存 epoll 文件描述符的空间，可以没有参数
2. 动态分配内存，给将要监视的 epoll_wait
3. 利用 epoll_ctl 控制 添加 删除，监听事件
4. 利用 epoll_wait 来获取改变的文件描述符,来执行程序

select 和 epoll 的区别：

- 每次调用 select 函数都会向操作系统传递监视对象信息，浪费大量时间
- epoll 仅向操作系统传递一次监视对象，监视范围或内容发生变化时只通知发生变化的事项
### 条件触发和边缘触发
**条件触发的特性**(epoll默认)：
> 条件触发方式中，只要输入缓冲一有数据就会一直通知该事件

**边缘触发特性**：
> 边缘触发中输入缓冲收到数据时仅注册（通知） 1 次该事件。即使输入缓冲中还留有数据，也不会再进行注册。

没看懂[代码](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch17/echo_EDGEserv.c)，有时候重复连接或者没接收完客户端数据就立马停止服务端
#### 边缘触发的服务器端必知的两点

- 通过 errno 变量验证错误原因
- 为了完成非阻塞（Non-blocking）I/O ，更改了套接字特性。

Linux 套接字相关函数一般通过 -1 通知发生了错误。虽然知道发生了错误，但仅凭这些内容无法得知产生错误的原因。因此，为了在发生错误的时候提供额外的信息，Linux 声明了如下全局变量：
> int errno;

为了访问该变量，需要引入 error.h 头文件。另外，每种函数发生错误时，保存在 errno 变量中的值都不同。
> read 函数发现输入缓冲中没有数据可读时返回 -1，同时在 errno 中保存 EAGAIN 常量

#### 改变文件属性
下面是 Linux 中提供的改变和更改文件属性的办法：
```cpp
#include <fcntl.h>
int fcntl(int fields, int cmd, ...);
/*
成功时返回 cmd 参数相关值，失败时返回 -1
filedes : 属性更改目标的文件描述符
cmd : 表示函数调用目的
*/
```
从上述声明可以看出 fcntl 有可变参数的形式。如果向第二个参数传递 F_GETFL ，可以获得第一个参数所指的文件描述符属性（int 型）。反之，如果传递 F_SETFL ，可以更改文件描述符属性。若希望将套接字改为非阻塞模式，需要如下 2 条语句。
```cpp
int flag = fcntl(fd,F_GETFL,0); 
fcntl(fd, F_SETFL, flag | O_NONBLOCK);
```
通过第一条语句，获取之前设置的属性信息，通过第二条语句在此基础上添加非阻塞 O_NONBLOCK 标志。调用 read/write 函数时，无论是否存在数据，都会形成非阻塞文件描述符（套接字）。fcntl 函数的适用范围很广。
#### 实现边缘触发回声服务器端
通过 errno 确认错误的原因是：边缘触发方式中，接收数据仅注册一次该事件。<br />因为这种特点，一旦发生输入相关事件时，就应该读取输入缓冲中的全部数据。因此需要验证输入缓冲是否为空。
> read 函数返回 -1，变量 errno 中的值变成 EAGAIN 时，说明没有数据可读。

既然如此，为什么要将套接字变成非阻塞模式？边缘触发条件下，以阻塞方式工作的 read & write 函数有可能引起服务端的长时间停顿。因此，边缘触发方式中一定要采用非阻塞 read & write 函数。<br />还是看不懂，以后再考虑边缘触发。
#### 条件触发和边缘触发孰优孰劣
边缘触发方式可以做到这点：
> 可以分离接收数据和处理数据的时间点！

下面是边缘触发的图<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-14.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-14.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />运行流程如下：

- 服务器端分别从 A B C 接收数据
- 服务器端按照 A B C 的顺序重新组合接收到的数据
- 组合的数据将发送给任意主机。

为了完成这个过程，如果可以按照如下流程运行，服务端的实现并不难：

- 客户端按照 A B C 的顺序连接服务器，并且按照次序向服务器发送数据
- 需要接收数据的客户端应在客户端 A B C 之前连接到服务器端并等待

但是实际情况中可能是下面这样：

- 客户端 C 和 B 正在向服务器发送数据，但是 A 并没有连接到服务器
- 客户端 A B C 乱序发送数据
- 服务端已经接收到数据，但是要接收数据的目标客户端并没有连接到服务器端。

因此，使用边缘触发，即使输入缓冲收到数据，服务器端也能决定读取和处理这些数据的时间点，这样就给服务器端的实现带来很大灵活性。
## 多线程服务器端的实现
### 理解线程的概念
多进程的缺点可概括为：

- 创建进程的过程会带来一定的开销
- 为了完成进程间数据交换，需要特殊的 IPC 技术。
- **每秒少则 10 次，多则千次的「上下文切换」是创建进程的最大开销**

线程比进程具有如下优点：

- 线程的创建和上下文切换比进程的创建和上下文切换**更快（不是消除）**
- 线程间交换数据无需特殊技术（进程pipe）
#### 线程和进程的差异
线程是为了解决：为了得到多条代码执行流而复制整个内存区域的负担太重。<br />每个进程的内存空间都由保存全局变量的「数据区」、向 malloc 等函数动态分配提供空间的堆（Heap）、函数运行时使用的栈（Stack）构成。每个进程都有独立的这种空间，多个进程的内存结构如图所示：<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-15.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-15.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />但如果以获得多个代码执行流为目的，则不应该像上图那样完全分离内存结构，而只需分离栈区域。通过这种方式可以获得如下优势：

- 上下文切换时不需要切换数据区和堆
- 可以利用数据区和堆交换数据

实际上这就是线程。线程为了保持多条代码执行流而隔开了栈区域，因此具有如下图所示的内存结构：<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-16.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-16.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />如图所示，多个线程共享数据区和堆。为了保持这种结构，线程将在进程内创建并运行。也就是说，进程和线程可以定义为如下形式：

- 进程：在操作系统构成单独执行流的单位
- 线程：在进程构成单独执行流的单位

如果说进程在操作系统内部生成多个执行流，那么线程就在同一进程内部创建多条执行流。因此，操作系统、进程、线程之间的关系可以表示为下图：<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-17.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-17.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)
### 线程创建及运行
#### posix的由来
可移植操作系统接口（英语：Portable Operating System Interface，缩写为POSIX）是IEEE为要在各种UNIX操作系统上运行软件，而定义API的一系列互相关联的标准的总称，其正式称呼为IEEE Std 1003，而国际标准名称为ISO/IEC 9945。此标准源于一个大约开始于1985年的项目。POSIX这个名称是由理查德·斯托曼（RMS）应IEEE的要求而提议的一个易于记忆的名称。它基本上是Portable Operating System Interface（可移植操作系统接口）的缩写，而X则表明其对Unix API的传承。<br />Linux基本上逐步实现了POSIX兼容，但并没有参加正式的POSIX认证。<br />微软的Windows NT声称部分实现了POSIX标准。<br />当前的POSIX主要分为四个部分：Base Definitions、System Interfaces、Shell and Utilities和Rationale。
#### 线程的创建和执行流程
线程具有单独的执行流，因此需要单独定义线程的 main 函数，还需要请求操作系统在单独的执行流中执行该函数，完成函数功能的函数如下：
```cpp
#include <pthread.h>

int pthread_create(pthread_t *restrict thread,
                   const pthread_attr_t *restrict attr,
                   void *(*start_routine)(void *),
                   void *restrict arg);
/*
成功时返回 0 ，失败时返回 -1
thread : 保存新创建线程 ID 的变量地址值。线程与进程相同，也需要用于区分不同线程的 ID
attr : 用于传递线程属性的参数，传递 NULL 时，创建默认属性的线程
start_routine : 相当于线程 main 函数的、在单独执行流中执行的函数地址值（函数指针）
arg : 通过第三个参数传递的调用函数时包含传递参数信息的变量地址值
*/
```

- [thread1.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch18/thread1.c)
- ![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-18.png?imageMogr2/format/webp%7C)
- 如果主进没有等待十秒，而是直接结束，这样也会强制结束线程，不论线程有没有运行完毕。

调用该函数的进程（或线程）将进入等待状态，直到第一个参数为 ID 的线程终止为止。而且可以得到线程的** main 函数的返回值**。
```cpp
#include <pthread.h>
int pthread_join(pthread_t thread, void **status);
/*
成功时返回 0 ，失败时返回 -1
thread : 该参数值 ID 的线程终止后才会从该函数返回
status : 保存线程的 main 函数返回值的指针的变量地址值
*/
```

- [thread2.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch18/thread2.c)
- ![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-19.png?imageMogr2/format/webp%7C)
#### 可在临界区内调用的函数
在同步的程序设计中，临界区块（Critical section）指的是一个访问共享资源（例如：共享设备或是共享存储器）的程序片段，而这些共享资源有**无法同时被多个线程访问**的特性。<br />根据临界区是否引起问题，函数可以分为以下 2 类：

- 线程安全函数（Thread-safe function）
- 非线程安全函数（Thread-unsafe function）

线程安全函数被多个线程同时调用也不会发生问题。反之，非线程安全函数被同时调用时会引发问题。但这并非有关于临界区的讨论，线程安全的函数中同样可能存在临界区。只是在线程安全的函数中，同时被多个线程调用时可通过一些措施避免问题。<br />线程安全函数结尾通常是 _r 。但是使用线程安全函数会给程序员带来额外的负担，可以通过以下方法自动更改为线程安全函数调用。
> 声明头文件前定义 [_REENTRANT](https://stackoverflow.com/questions/2601753/what-is-the-reentrant-flag) 宏。

也无需特意更改源代码，可以在编译的时候指定编译参数来定义宏。<br />gcc -D_REENTRANT mythread.c -o mthread -lpthread
#### 工作（Worker）线程模型
计算从 1 到 10 的和，但并不是通过 main 函数进行运算，而是创建两个线程，其中一个线程计算 1 到 5 的和，另一个线程计算 6 到 10 的和，main 函数**只负责输出运算结果**。这种方式的线程模型称为「工作线程」。显示该程序的执行流程图：<br />![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-20.png?imageMogr2/format/webp%7C)
### 线程存在的问题和临界区
这种方式存在一个问题：
> 2 个线程正在同时访问全局变量 num

任何内存空间，只要被同时访问，都有可能发生问题。<br />因此，线程访问变量 num 时应该阻止其他线程访问，直到线程 1 运算完成。这就是同步（Synchronization）
#### 临界区位置
函数内同时运行多个线程操作**同一变量**时引发问题的多条语句构成的代码块
### 线程同步
线程同步用于解决线程访问顺序引发的问题。需要同步的情况可以从如下两方面考虑。

- **同时访问**同一内存空间时发生的情况
- 需要指定访问同一内存空间的**线程顺序**的情况
#### 互斥量
互斥锁（英语：英语：Mutual exclusion，缩写 Mutex）是一种用于多线程编程中，防止两条线程同时对同一公共资源（比如全局变量）进行读写的机制。<br />下面是互斥量的**创建及销毁**函数
```cpp
#include <pthread.h>
int pthread_mutex_init(pthread_mutex_t *mutex,
                       const pthread_mutexattr_t *attr);
int pthread_mutex_destroy(pthread_mutex_t *mutex);
/*
成功时返回 0，失败时返回其他值
mutex : 创建互斥量时传递保存互斥量的变量地址值，销毁时传递需要销毁的互斥量地址
attr : 传递即将创建的互斥量属性，没有特别需要指定的属性时传递 NULL
*/
```
从上述函数声明中可以看出，为了创建相当于锁系统的互斥量，需要声明如下 pthread_mutex_t 型变量：
> pthread_mutex_t mutex

该变量的地址值传递给 pthread_mutex_init 函数，用来保存操作系统创建的互斥量（锁系统）。调用 pthread_mutex_destroy 函数时同样需要该信息。如果不需要配置特殊的互斥量属性，则向第二个参数传递 NULL 时，也可以利用 PTHREAD_MUTEX_INITIALIZER 进行宏初始化：
> pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

推荐尽可能的使用 pthread_mutex_init 函数进行初始化，因为通过宏进行初始化时很难发现发生的错误。<br />下面是利用互斥量**锁住或释放**临界区时使用的函数。
```cpp
#include <pthread.h>
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
/*
成功时返回 0 ，失败时返回其他值
*/
```
使用方法：
```cpp
pthread_mutex_lock(&mutex);
//临界区开始
//...
//临界区结束
pthread_mutex_unlock(&mutex);  # 不解锁会出现 死锁 情况
```
使用mutex注意
> 最大限度减少互斥量 lock unlock 函数的**调用**次数，尽量不要在for中加锁

#### 信号量
信号量（英语：Semaphore）又称为信号标，是一个同步对象，用于保持在0至指定最大值之间的一个计数值。当线程完成一次对该semaphore对象的**等待（wait）时，该计数值减一**；当线程完成一次对semaphore对象的**释放（release）时，计数值加一**。当计数值为0，则线程等待该semaphore对象不再能成功，直至该semaphore对象变成signaled状态。semaphore对象的计数值大于0，为signaled状态；计数值等于0，为nonsignaled状态.<br />semaphore对象适用于控制一个仅支持有限个用户的共享资源，是一种不需要使用忙碌等待（busy waiting）的方法。<br />下面是信号量的创建及销毁方法：
```cpp
#include <semaphore.h>
int sem_init(sem_t *sem, int pshared, unsigned int value);
int sem_destroy(sem_t *sem);
/*
成功时返回 0 ，失败时返回其他值
sem : 创建信号量时保存信号量的变量地址值，销毁时传递需要销毁的信号量变量地址值
pshared : 传递其他值时，创建可由多个继承共享的信号量；传递 0 时，创建只允许 1 个进程内部使用的信号量。需要完成同一进程的线程同步，故为0
value : 指定创建信号量的初始值
*/
```
 信号量中相当于互斥量 lock unlock 的函数。
```cpp
#include <semaphore.h>
int sem_post(sem_t *sem);
int sem_wait(sem_t *sem);
/*
成功时返回 0 ，失败时返回其他值
sem : 传递保存信号量读取值的变量地址值，传递给 sem_post 的信号量增1，传递给 sem_wait 时信号量减一
*/
```
调用 sem_init 函数时，操作系统将创建信号量对象，此对象中记录这「信号量值」（Semaphore Value）整数。该值在调用 sem_post 函数时增加 1 ，调用 wait_wait 函数时减一。但信号量的值不能小于 0 ，因此，在信号量为 0 的情况下调用 sem_wait 函数时，调用的线程将进入阻塞状态（因为函数未返回）。当然，此时如果有其他线程调用 sem_post 函数，信号量的值将变为 1 ，而原本阻塞的线程可以将该信号重新减为 0 并跳出阻塞状态。<br />二进制信号量的使用：
```cpp
sem_wait(&sem);//信号量变为0...
// 临界区的开始
//...
//临界区的结束
sem_post(&sem);//信号量变为1...
```
### 线程的销毁和多线程并发服务器端的实现
#### 销毁线程的 3 种方法

- 调用 pthread_join 函数

调用该函数时，不仅会等待线程终止，还会引导线程销毁。但该函数的问题是，线程终止前，**调用该函数的线程**将进入阻塞状态。因此，通过如下函数调用引导线程销毁。

- 调用 pthread_detach 函数
```cpp
#include <pthread.h>
int pthread_detach(pthread_t th);
/*
成功时返回 0 ，失败时返回其他值
thread : 终止的同时需要销毁的线程 ID
*/
```
调用上述函数不会引起线程终止或进入阻塞状态，可以通过该函数引导销毁线程创建的内存空间。调用该函数后不能再针对相应线程调用 pthread_join 函数。
#### 多线程并发服务器端的实现
下面是多个客户端之间可以交换信息的简单聊天程序。

- [chat_server.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch18/chat_server.c)
- [chat_clnt.c](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch18/chat_clnt.c)

上面的服务端示例中，需要掌握临界区的构成，访问全局变量 clnt_cnt 和数组 clnt_socks 的代码将构成临界区，添加和删除客户端时，变量 clnt_cnt 和数组 clnt_socks 将同时发生变化。因此下列情形会导致数据不一致，从而引发错误：

- 线程 A 从数组 clnt_socks 中删除套接字信息，同时线程 B 读取 clnt_cnt 变量
- 线程 A 读取变量 clnt_cnt ，同时线程 B 将套接字信息添加到 clnt_socks 数组
## 制作 HTTP 服务器端
### HTTP 概要
本章将编写 HTTP（HyperText Transfer Protocol，超文本传输协议）服务器端，即 Web 服务器端。
#### 理解 Web 服务器端
web服务器端就是要基于 HTTP 协议，将网页对应文件传输给客户端的服务器端。
#### HTTP
无状态的 Stateless 协议<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-21.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-21.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />从上图可以看出，服务器端相应客户端请求后立即断开连接。换言之，服务器端不会维持客户端状态。即使同一客户端再次发送请求，服务器端也无法辨认出是原先那个，而会以相同方式处理新请求。因此，HTTP 又称「无状态的 Stateless 协议」
#### 请求消息（Request Message）的结构
下面是**客户端向服务端**发起请求消息的结构：<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-22.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-22.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />从图中可以看出，请求消息可以分为**请求头、消息头、消息体** 3 个部分。其中，请求行含有请求方式（请求目的）信息。典型的请求方式有 GET 和 POST ，GET 主要用于请求数据，POST 主要用于传输数据。为了降低复杂度，我们实现只能响应 GET 请求的 Web 服务器端，下面解释图中的请求行信息。其中「GET/index.html HTTP/1.1」 具有如下含义：<br />请求（GET）index.html 文件，通常以 1.1 版本的 HTTP 协议进行通信。<br />**请求行只能通过 1 行（line）发送**，因此，服务器端很容易从 HTTP 请求中提取第一行，并分别分析请求行中的信息。<br />请求行下面的**消息头中包含发送请求的浏览器信息、用户认证信息等关于 HTTP 消息的附加信息**。最后的**消息体中装有客户端向服务端传输的数据**，为了装入数据，需要以 POST 方式发送请求。但是我们的目标是实现 GET 方式的服务器端，所以可以忽略这部分内容。另外，消息体和消息头与之间以空行隔开，因此不会发生边界问题。
#### 24.1.4 响应消息（Response Message）的结构
下面是 Web **服务器端向客户端**传递的响应信息的结构。从图中可以看出，该响应消息由状态行、头信息、消息体等 3 个部分组成。状态行中有关于请求的状态信息，这是与请求消息相比最为显著地区别。<br />[![image](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-23.png?imageMogr2/format/webp%7C)](https://pic.keepjolly.com/halo/blog/2023/08/20230813224506-23.png?imageMogr2/format/webp%7C?watermark/3/type/3/text/a2VlcGpvbGx5)<br />第一个字符串**状态行中含有关于客户端请求的处理结果**。例如，客户端请求 index.html 文件时，表示 index.html 文件是否存在、服务端是否发生问题而无法响应等不同情况的信息写入状态行。图中的「HTTP/1.1 200 OK」具有如下含义：

- 200 OK : 成功处理了请求!
- 404 Not Found : 请求的文件不存在!
- 400 Bad Request : 请求方式错误，请检查！

**消息头中含有传输的数据类型和长度等信息**。图中的消息头含有如下信息：<br />服务端名为 SimpleWebServer ，传输的数据类型为 text/html。数据长度不超过 2048 个字节。<br />最后插入一个空行后，通过消息体**发送客户端请求的文件数据**。以上就是实现 Web 服务端过程中必要的 HTTP 协议。
