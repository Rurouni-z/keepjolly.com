---
title: TCP_IP网络编程
date: 2023-08-13 22:41:54 +0800
lastmod: 
summary: 
url: 
slug: TCP_IP_network_programming
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
## 理解网络编程和套接字
server：
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main(){
    int sockfd;
    int clnt_sock;

    struct sockaddr_in serv_addr;
    struct sockaddr_in clnt_addr;
	// 创建套接字
    sockfd = socket(PF_INET, SOCK_STREAM, 0);
    if (sockfd == -1) exit(0);
    // 端口复用，防止address in use
    int one = 1;
    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &one, sizeof(one));
    // bind地址
    memset(&serv_addr, 0, sizeof(sockaddr_in)); 
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    serv_addr.sin_port = htons(8888);  
    if (bind(sockfd, ( struct sockaddr*)&serv_addr, sizeof(serv_addr))< 0) exit(0);
    // 开始监听客户端连入
    if (listen(sockfd, 1) < 0) exit(0);
	// 可以与客户端通信
    socklen_t clnt_addr_size;
    clnt_addr_size = sizeof(clnt_addr); 
    // 不能使用(socklen_t*)clnt_addr_size使用(socklen_t*)&clnt_addr_size
    clnt_sock = accept(sockfd, (struct sockaddr*)&clnt_addr, &clnt_addr_size); 
    if (clnt_sock < 0) exit(0);
    // 发送数据
    char message[] = "Hello!"; 
    write(clnt_sock, message, sizeof(message));

    close(clnt_sock);
    close(sockfd);

    return 0;
}

```
client：
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main(int argc, char* argv[]){
    int sock;
    struct sockaddr_in serv_addr;
    char message[30];
    int str_len;
	// 创建套接字
    sock = socket(PF_INET, SOCK_STREAM, 0);
    // connect连接
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(8888);
    serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
    connect(sock, ( sockaddr*)&serv_addr, sizeof(serv_addr));
	// 读取server数据
    str_len = read(sock, message, sizeof(message) - 1);

    printf("Message : %s\n", message);
    close(sock);
    return 0;
}
```
### 地址族与数据序列
只需通过IP地址的第一个字节即可判断网络地址占用的总字节数，因为我们根据IP地址的边界区分网络地址，如下所示：

- A 类地址的首字节范围为：0~127
- B 类地址的首字节范围为：128~191
- C 类地址的首字节范围为：192~223

还有如下这种表示方式：

- A 类地址的首位以 0 开始
- B 类地址的前2位以 10 开始
- C 类地址的前3位以 110 开始
1. 端口号由 16 位构成，可分配的端口号范围除 0-1023，这些是知名端口，一般分配给特定的应用程序，所以应当分配给此范围之外的值。HTTP 的端口号是 80 ，FTP 的端口号是20和21
   1. 虽然端口号不能重复，但是 TCP 套接字和 UDP 套接字不会共用端接口号，所以允许重复。
```cpp
/* Structure describing an Internet socket address.  */
struct sockaddr_in
  {
    __SOCKADDR_COMMON (sin_);
    in_port_t sin_port;			/* Port number.  uint16_t  16bits*/
    struct in_addr sin_addr;		/* Internet address.  uint32_t*/

    /* Pad to size of `struct sockaddr'.  8 = 16-2-2-4， 用于强制转换成sockaddr*/ 
    unsigned char sin_zero[sizeof (struct sockaddr) - // 16byte
			   __SOCKADDR_COMMON_SIZE -  // 2byte
			   sizeof (in_port_t) -  // 2
			   sizeof (struct in_addr)]; // 4
  };
```
| sa_family_t | 地址族（address family） | sys/socket.h |
| --- | --- | --- |
| socklen_t | 长度（length of struct） | sys/socket.h |
| in_addr_t | IP地址，声明为 uint_32_t | netinet/in.h |
| in_port_t | 端口号，声明为 uint_16_t | netinet/in.h |
| int 8_t 这种类型都是在该头文件 | signed 8-bit int | sys/types.h |

- 大端序（Big Endian）：高位字节存放到低位地址，网络字节序
- 小端序（Little Endian）：高位字节存放到高位地址

- h to n s 的 h 代表主机（host）字节序。通常小端序
- htons 的 n 代表网络（network）字节序。
- s 代表两个字节的 short =uint16=2字节，因此以 s 为后缀的函数用于端口转换
- l 代表四个字节的 long 类型，所以以 l 为后缀的函数用于 IP 地址转换（long在64位系统下仍是4字节，因为是uint32）

```cpp
in_addr_t inet_addr(const char *string);   // 点/数字符串形式的IP地址转换成整数型的IP地址
//成功时返回 32 位大端序整数型值，失败时返回 INADDR_NONE，以便存入是sockaddr_in中
int inet_aton(const char *string, struct in_addr *addr);  // more use
/*
成功时返回 1 ，失败时返回 0
string: 含有需要转换的IP地址信息的字符串地址值
addr: 保存转换结果的 in_addr 结构体变量的地址值
*/
char *inet_ntoa(struct in_addr adr);  // 网络字节序整数型IP地址转换成字符串形式
//成功时返回保存转换结果的字符串地址值，失败时返回 NULL 空指针
```
### 问题

1. 端口不一致会导致乱码
   1. htonl(8888) != htons(8888)，[htons](https://www.cnblogs.com/sddai/p/5790479.html)
2. [Linux 文件 1.4—文件描述符0 1 2（文件操作简述）](https://blog.csdn.net/qq_45831156/article/details/107469716)
   1. 因此文件open之后的文件描述符从3开始

[底层文件I/O和ANSI标准I/O的区别](https://blog.csdn.net/owen7500/article/details/53263981) 通过文件I/O读写文件时，每次操作都会执行相关系统调用。这样处理的好处是直接读写实际文件，坏处是频繁的系统调用会增加系统开销，标准I/O可以看成是在文件I/O的基础上封装了缓冲机制。先读写缓冲区，必要时再访问实际文件，从而减少了系统调用的次数。
## 基于TCP的客户端/服务端
### TCP/IP 协议栈
TCP/IP 协议栈共分为 4 层，可以理解为数据收发分成了 4 个层次化过程，通过层次化的方式来解决问题

1.  链路层

链路层是**物理链接领域标准化**的结果，也是最基本的领域，专门定义LAN、WAN、MAN等网络标准。若两台主机通过网络进行数据交换，则需要物理连接，链路层就负责这些标准。

2.  IP 层

准备好物理连接后就要传输数据。为了在复杂网络中传输数据，首先要**考虑路径的选择**。向目标传输数据需要经过哪条路径？解决此问题的就是IP层，该层使用的协议就是IP。<br />IP 是**面向消息的、不可靠**的协议。每次传输数据时会帮我们选择路径，但并不一致。如果传输过程中发生错误，则选择其他路径，但是如果发生数据丢失或错误，则无法解决。换言之，IP协议无法应对数据错误。

3.  TCP/UDP 层

IP 层解决数据传输中的路径选择问题，只需照此路径传输数据即可。TCP 和 UDP 层以 IP 层提供的路径信息为基础完成**实际的数据传输**，故该层又称为传输层 。 TCP 可以保证数据的可靠传输，但是它发送数据时以 IP 层为基础（这也是协议栈层次化的原因）。<br />IP 层只关注**一个数据包（数据传输基本单位）的传输过程**。因此，即使传输多个数据包，每个数据包也是由 IP 层实际传输的，也就是说传输顺序及传输本身是不可靠的。若只利用IP层传输数据，是不可靠的，需要利用TCP来解决数据丢失，顺序不一致等问题。

4. 应用层

上述内容是套接字通信过程中自动处理的。选择数据传输路径、数据确认过程都被**隐藏到套接字内部**。向程序员提供的工具就是套接字，只需要利用套接字编出程序即可。编写软件的过程中，需要根据程序的特点来**决定服务器和客户端之间的数据传输规则**，这便是应用层协议。
### TCP流程
#### 服务端
#include <sys/socket.h>

1. socket(AF_INET, SOCKEt_STREAM, 0) 创建套接字
2. bind(sockfd, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) 分配套接字地址
3. listen(sockfd, 请求数backlog) 等待连接请求状态，此时客户端才能发送connet请求
4. accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen) 允许连接，产生用于数据IO的套接字，需要close()
5. read() / write() 数据交换
6. close() 断开连接

1. 服务端实现过程中首先要创建套接字，此时的套接字并非是真正的服务端套接字
2. 为了完成套接字地址的分配，初始化结构体变量并调用 bind 函数。
3. 调用 listen 函数进入等待连接请求状态。连接请求状态队列的长度设置为5.此时的套接字才是服务端套接字。
4. 调用 accept 函数从队头取 1 个连接请求与客户端建立连接，并返回创建的套接字文件描述符。另外，调用 accept 函数时若等待队列为空，则 **accept 函数不会返回**，直到队列中出现新的客户端连接。
5. 调用 write 函数向客户端传送数据，调用 close 关闭连接
#### 客户端

1. 创建准备连接服务器的套接字，此时创建的是 TCP 套接字
2. 结构体变量 serv_addr 中初始化IP和端口信息。初始化值为**目标服务器端套接字**的IP和端口信息。
3. 调用 connect 函数向服务端发起连接请求，自动分配客户端IP地址和端口
4. 完成连接后，接收服务端传输的数据
5. 接收数据后调用 close 函数关闭套接字，结束与服务器端的连接。(对套接字调用close函数，对应于向建立连接的对应套接字发送EOF。即，如果客户端的套接字调用了close函数，服务端**read时候会返回0**。)
- 客户端只能等到服务端调用 listen 函数后才能调用 connect 函数
- 服务器端可能会在客户端调用 connect 之前调用 accept 函数，这时服务器端进入**阻塞（blocking）状态**，直到客户端调用 connect 函数后接收到连接请求。
#### echo server/client
使用for循环处理多个连接，会出现服务端发送多个数据给一个客户端，并且可能数据太多，需要分开发送，但客户端只调用一次read。上述原因为TCP 不存在数据边界。
### 问题
分层的好处：①隔层之间是独立的②灵活性好③结构上可以分隔开④易于实现和维护⑤能促进标准化工作。
## 基于 TCP 的服务端/客户端（2）
### echo client的完美实现
#### 已知接收数据的大小
echo client如果可以知道接收数据的大小，则可以利用for循环来接收，但是一般情况下不确定。
```cpp
str_len = write(sock, message, strlen(message));
recv_len = 0;
while (recv_len < str_len)
{
    recv_cnt = read(sock, &message[recv_len], BUF_SIZE - 1);
    if (recv_cnt == -1)
        error_handling("read() error");
    recv_len += recv_cnt;
}
```
#### 问题不在于回声客户端：定义应用层协议
在收发过程中定好规则（协议）以表示数据边界，或者提前告知需要发送的数据的大小。服务端/客户端实现过程中逐步定义的规则集合就是应用层协议。
### TCP 原理
#### TCP 套接字中的 I/O 缓冲
实际上，write 函数调用后并非立即传输数据， read 函数调用后也并非马上接收数据。<br />![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100.png?imageMogr2/format/webp%7C)<br />I/O 缓冲特性可以整理如下：

- I/O 缓冲在每个 TCP 套接字中单独存在
- I/O 缓冲在创建套接字时自动生成
- 即使关闭套接字也会继续传递输出缓冲中遗留的数据
- 关闭套接字将丢失输入缓冲中的数据
#### TCP 内部工作原理 
TCP 套接字从创建到消失所经过的过程分为如下三步：

- 与对方套接字建立连接
- 与对方套接字进行数据交换
- 断开与对方套接字的连接
##### 1 与对方套接字的连接

-  **Three-way handshaking**
- ![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-1.png?imageMogr2/format/webp%7C)
   - 第一次客户端发送SYN，表示发送SEQ为1000的数据包
   - 第二次服务端发送SYN+ACK，表示接收后发送ACK（1000+1）的数据包，并发送SEQ为2000的数据包
   - 第三次客户端发送SYN+ACK，表示接收到服务端的数据包，并发送下一个数据包
#####   2与对方主机的数据交换

- ![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-2.png?imageMogr2/format/webp%7C)
   - 首先主机A发送100字节的数据包，SEQ为1200，主机B确认收到发送ACK（SEQ+传递字节数+1）=1301给主机B，防止丢失数据
   - 第二次发送时主机A失败，主机B未发送ACK，主机A启动计时器等待ACK应答，超时则重传数据。
##### 3与对方主机的数据交换
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-3.png?imageMogr2/format/webp%7C)<br />图中数据包内的 FIN 表示断开连接。也就是说，双方各发送 1 次 FIN 消息后断开连接。图中，主机 A 传递了两次 ACK 5001，也许这里会有困惑。其实，第二次 FIN 数据包中的 ACK 5001 只是因为发送了 ACK 消息后未接收到的数据重传的。
## 基于UDP的服务端/客户端
### UDP原理
寄信前应先在信封上填好寄信人ip和收信人的地址port，之后贴上邮票放进邮筒write即可。当然，信件的特点使我们无法确认信件是否被收到。邮寄过程中也可能发生信件丢失的情况。也就是说，信件是一种不可靠的传输方式，UDP 也是一种不可靠的数据传输方式。
### UDP工作原理
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-4.png?imageMogr2/format/webp%7C)<br />IP 的作用就是让离开主机 B 的 UDP 数据包准确传递到主机 A 。但是把 UDP 数据包最终交给主机 A 的某一 UDP 套接字的过程是由 UDP 完成的。UDP 的最重要的作用就是根据端口号将传到主机的数据包交付给最终的 UDP 套接字。<br />TCP 比 UDP 慢的原因主要有以下两点：

- 收发数据前后进行的连接设置及清除过程。
- 收发过程中为保证可靠性而添加的流控制。

如果收发的数据量小但是需要频繁连接时，UDP 比 TCP 更高效。

- TCP需要listen、accept，而UDP只需要只有创建套接字和数据交换过程。
- TCP只能一一对应服务端客户端，UDP可以一对多传输
### 代码实现
```cpp
#include <sys/socket.h>
ssize_t sendto(int sock, void *buff, size_t nbytes, int flags,
               struct sockaddr *to, socklen_t addrlen);
/*
成功时返回发送的字节数，失败时返回 -1
sock: 用于传输数据的 UDP 套接字
buff: 保存待传输数据的缓冲地址值
nbytes: 待传输的数据长度，以字节为单位
flags: 可选项参数，若没有则传递 0
to: 存有目标地址的 sockaddr 结构体变量的地址值
addrlen: 传递给参数 to 的地址值结构体变量长度
调用 sendto 函数时自动给client分配IP和端口号
*/
ssize_t recvfrom(int sock, void *buff, size_t nbytes, int flags,
                 struct sockaddr *from, socklen_t *addrlen);
/*
成功时返回接收的字节数，失败时返回 -1
sock: 用于传输数据的 UDP 套接字
buff: 保存待传输数据的缓冲地址值
nbytes: 待传输的数据长度，以字节为单位
flags: 可选项参数，若没有则传递 0
from: 存有**发送端**地址信息的 sockaddr 结构体变量的地址值
addrlen: 保存参数 from 的结构体变量长度的变量地址值。
*/
```
### UDP 的数据传输特性和调用 connect 函数

- 输入函数的调用次数和输出函数的调用次数应该**完全一致**
- 每次调用 sendto 函数时每次都变更目标地址，因此可以重复利用同一 UDP 套接字向不同目标传递数据。这种未注册目标地址信息的套接字称为未连接套接字，反之，注册了目标地址的套接字称为连接 connected 套接字。
   - sendto流程
   - 第 1 阶段：向 UDP 套接字注册目标 IP 和端口号
   - 第 2 阶段：传输数据
   - 第 3 阶段：删除 UDP 套接字中注册的目标地址信息。
> python -c "import socket;print([(s.connect(('8.8.8.8', 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1])"

终端输入上述命令获取本地ip
## 优雅的断开套接字的连接
### 基于 TCP 的半关闭
TCP 的断开过程可能发生预想不到的情况，需要掌握半关闭（half-close）。Linux 和 Windows 的 closesocket 函数意味着完全断开连接。完全断开不仅指无法传输数据，而且也不能接收数据。<br />一旦两台主机之间建立了套接字连接，每个主机就会拥有单独的输入流和输出流。
#### 针对优雅断开的 shutdown 函数
```cpp
#include <sys/socket.h>
int shutdown(int sock, int howto);
/*
成功时返回 0 ，失败时返回 -1
sock: 需要断开套接字文件描述符
howto: 传递断开方式信息
	SHUT_RD : 断开输入流 0
    SHUT_WR : 断开输出流 1
    SHUT_RDWR : 同时断开 I/O 流 2
*/
```
[Linux-socket的close和shutdown区别及应用场景](https://www.cnblogs.com/JohnABC/p/7238241.html)（也有后续章节的多进程传输中使用shutdown的原因，会不管计数，直接关闭输入输出流）

#### 为何要半关闭
为了关闭服务器后，仍可以接收客户端的数据。调用 shutdown 函数，只关闭服务器的输出流。这样既可以发送 EOF ，同时又保留了输入流。
#### 一个优雅的流程
当服务端发送完数据后，shutdown关闭发送流，当接收到客户端的回复信息，则close套接字，同时客户端发送完消息后关闭套接字。<br />![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-5.png?imageMogr2/format/webp%7C)
## 域名及网络地址
### 域名系统
DNS 是对IP地址和域名进行相互转换的系统，其核心是 DNS 服务器<br />域名是IP地址的别名，可以通过DNS服务器查询到对应IP地址<br />![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-6.png?imageMogr2/format/webp%7C)<br />当在电脑浏览器上输入一个域名，会通过一系列的DNS服务器的映射找到最终的目标服务器。
### IP地址和域名之间的转换
#### 通过域名获得ip
```cpp
#include <netdb.h>
struct hostent *gethostbyname(const char *hostname);
/*
成功时返回 hostent 结构体地址，失败时返回 NULL 指针
*/

struct hostent
{
    char *h_name;       /* Official name of host.  官方域名*/
    char **h_aliases;   /* Alias list.  域名别称*/
    int h_addrtype;     /* Host address type.  IP地址*/
    int h_length;       /* Length of address.  IP地址长度*/
    char **h_addr_list; /* List of addresses from name server. 域名对应IP地址 */
};
```
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-7.png?imageMogr2/format/webp%7C)<br />linux下可以使用dig @8.8.8.8 +trace baidu.com命令追踪DNS查询路径
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <netdb.h>
void error_handling(char *message);

int main(int argc, char *argv[])
{
    int i;
    struct hostent *host;
    if (argc != 2)
    {
        printf("Usage : %s <addr>\n", argv[0]);
        exit(1);
    }
    // 把参数传递给函数，返回结构体
    host = gethostbyname(argv[1]);
    // IP to host
    // struct sockaddr_in addr;
    // memset(&addr, 0, sizeof(addr));
    // addr.sin_addr.s_addr = inet_addr(argv[1]);
    // host = gethostbyaddr((char *)&addr.sin_addr, 4, AF_INET);
    if (!host)
        printf("gethost... error");
    // 输出官方域名
    printf("Official name: %s \n", host->h_name);
    // Aliases 貌似是解析的 cname 域名？
    for (i = 0; host->h_aliases[i]; i++)
        printf("Aliases %d: %s \n", i + 1, host->h_aliases[i]);
    //看看是不是ipv4
    printf("Address type: %s \n",
           (host->h_addrtype == AF_INET) ? "AF_INET" : "AF_INET6");
    // 输出ip地址信息
    for (i = 0; host->h_addr_list[i]; i++)
        // 对in_addr*指针取值用*
        printf("IP addr %d: %s \n", i + 1,
               inet_ntoa(*(struct in_addr *)host->h_addr_list[i]));
    return 0;
}
```
#### 利用IP地址获取域名
```cpp
#include <netdb.h>
struct hostent *gethostbyaddr(const char *addr, socklen_t len, int family);
/*
成功时返回 hostent 结构体变量地址值，失败时返回 NULL 指针
addr: 含有IP地址信息的 in_addr 结构体指针。为了同时传递 IPV4 地址之外的全部信息，该变量的类型声明为 char 指针
len: 向第一个参数传递的地址信息的字节数，IPV4时为 4 ，IPV6 时为16.
family: 传递地址族信息，ipv4 是 AF_INET ，IPV6是 AF_INET6
*/
```
[在浏览器地址栏输入一个URL后回车，背后会进行哪些技术步骤？](https://www.zhihu.com/question/34873227/answer/518086565)
## 套接字的多种可选项
### 套接字可选项和 I/O 缓冲大小
我们之前写得程序都是创建好套接字之后直接使用的，此时通过默认的套接字特性进行数据通信，这里列出了一些套接字可选项。

| 协议层 | 选项名 | getsockopt | setsockopt |
| --- | --- | --- | --- |
| SOL_SOCKET | SO_SNDBUF | O | O |
| SOL_SOCKET | SO_RCVBUF | O | O |
| SOL_SOCKET | SO_REUSEADDR | O | O |
| SOL_SOCKET | SO_KEEPALIVE | O | O |
| SOL_SOCKET | SO_BROADCAST | O | O |
| SOL_SOCKET | SO_DONTROUTE | O | O |
| SOL_SOCKET | SO_OOBINLINE | O | O |
| SOL_SOCKET | SO_ERROR | O | X |
| SOL_SOCKET | SO_TYPE | O | X |
| IPPROTO_IP | IP_TOS | O | O |
| IPPROTO_IP | IP_TTL | O | O |
| IPPROTO_IP | IP_MULTICAST_TTL | O | O |
| IPPROTO_IP | IP_MULTICAST_LOOP | O | O |
| IPPROTO_IP | IP_MULTICAST_IF | O | O |
| IPPROTO_TCP | TCP_KEEPALIVE | O | O |
| IPPROTO_TCP | TCP_NODELAY | O | O |
| IPPROTO_TCP | TCP_MAXSEG | O | O |

从表中可以看出，套接字可选项是分层的。

- IPPROTO_IP 可选项是IP协议相关事项
- IPPROTO_TCP 层可选项是 TCP 协议的相关事项
- SOL_SOCKET 层是套接字的通用可选项。
- 用于验证套接类型的 SO_TYPE 是只读可选项，因为**套接字类型只能在创建(调用socket()方法时)时决定，以后不能再更改**。
#### getsockopt & setsockopt
```cpp
#include <sys/socket.h>
// 读取套接字可选项
int getsockopt(int sock, int level, int optname, void *optval, socklen_t *optlen);
/*
成功时返回 0 ，失败时返回 -1
sock: 用于查看选项套接字文件描述符
level: 要查看的可选项协议层
optname: 要查看的可选项名
optval: 保存查看结果的缓冲地址值
optlen: 向第四个参数传递的缓冲大小。调用函数后，该变量中保存通过第四个参数返回的可选项信息的字节数。
*/
#include <sys/socket.h>
// 更改可选项
int setsockopt(int sock, int level, int optname, const void *optval, socklen_t optlen);
/*
成功时返回 0 ，失败时返回 -1
sock: 用于更改选项套接字文件描述符
level: 要更改的可选项协议层
optname: 要更改的可选项名
optval: 保存更改结果的缓冲地址值
optlen: 向第四个参数传递的缓冲大小。调用函数后，该变量中保存通过第四个参数返回的可选项信息的字节数。
*/

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>

int main(int argc, char *argv[])
{
    int tcp_sock, udp_sock;
    int sock_type;
    socklen_t optlen;
    int state;

    optlen = sizeof(sock_type);
    tcp_sock = socket(PF_INET, SOCK_STREAM, 0);
    udp_sock = socket(PF_INET, SOCK_DGRAM, 0);
    printf("SOCK_STREAM: %d\n", SOCK_STREAM);
    printf("SOCK_DGRAM: %d\n", SOCK_DGRAM);

    state = getsockopt(tcp_sock, SOL_SOCKET, SO_TYPE, (void *)&sock_type, &optlen);
    printf("Socket type one: %d \n", sock_type);

    state = getsockopt(udp_sock, SOL_SOCKET, SO_TYPE, (void *)&sock_type, &optlen);
    printf("Socket type two: %d \n", sock_type);
    return 0;
}
```
#### SO_SNDBUF & SO_RCVBUF
设置缓冲区不会按照代码所要求的缓冲区大小，所以实现要小心。
```cpp
/* Set socket FD's option OPTNAME at protocol level LEVEL
   to *OPTVAL (which is OPTLEN bytes long).
   Returns 0 on success, -1 for errors.  */
extern int setsockopt (int __fd, int __level, int __optname,
		       const void *__optval, socklen_t __optlen) __THROW;

/* Put the current value for socket FD's option OPTNAME at protocol level LEVEL
   into OPTVAL (which is *OPTLEN bytes long), and set *OPTLEN to the value's
   actual length.  Returns 0 on success, -1 for errors.  */
extern int getsockopt (int __fd, int __level, int __optname,
		       void *__restrict __optval,
		       socklen_t *__restrict __optlen) __THROW;
```
### SO_REUSEADDR（important）
#### Time-wait 状态
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-8.png?imageMogr2/format/webp%7C)<br />假设图中主机 A 是服务器，因为是主机 A 向 B 发送 FIN 消息，即服务器使用 CTRL+C强制终止 。但是问题是，套接字经过四次握手后并没有立即消除，而是要经过一段时间的 Time-wait 状态。当然，只有**先断开连接**的（**先发送 FIN 消息**的）主机才经过 Time-wait 状态。因此，若服务器端先断开连接，则无法立即重新运行。套接字处在 Time-wait 过程时，相应端口是正在使用的状态。因此，就像之前验证过的，bind 函数调用过程中会发生错误。<br />实际上，不论是服务端还是客户端，都要经过一段时间的 Time-wait 过程。先断开连接的套接字必然会经过 Time-wait 过程，但是由于**客户端套接字的端口是任意指定**的，所以无需过多关注 Time-wait 状态。<br />那到底为什么会有 Time-wait 状态呢，在图中假设，主机 A 向主机 B 传输 ACK 消息（SEQ 5001 , ACK 7502 ）后立刻消除套接字。但是最后这条 ACK 消息在传递过程中丢失，没有传递主机 B ，这时主机 B 就会试图重传。但是此时主机 A 已经是完全终止状态，因此主机 B 永远无法收到从主机 A 最后传来的 ACK 消息。防止数据丢失后，无法再次通信，所以要设计 Time-wait 状态。
#### 地址再分配
```cpp
socklen_t optlen = sizeof(option);
int option = 1;
setsockopt(serv_sock, SOL_SOCKET, SO_REUSEADDR, (void *)&option, optlen);
```
### TCP_NODELAY
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-9.png?imageMogr2/format/webp%7C)<br />TCP 套接字默认使用 Nagle 算法交换数据，因此最大限度的进行缓冲，直到收到 ACK 。左图也就是说一共传递 4 个数据包以传输一个字符串。从右图可以看出，发送数据包一共使用了 10 个数据包。由此可知，不使用 Nagle 算法将对网络流量产生负面影响。即使只传输一个字节的数据，其头信息都可能是几十个字节。因此，为了提高网络传输效率，必须使用 Nagle 算法。<br />Nagle 算法并不是什么情况下都适用，**网络流量未受太大影响时**，不使用 Nagle 算法要比使用它时传输速度快。最典型的就是「**传输大文数据**」。将文件数据传入输出缓冲不会花太多时间，因此，不使用 Nagle 算法，也会在装满输出缓冲时传输数据包。这不仅不会增加数据包的数量，反而在无需等待 ACK 的前提下连续传输，因此可以大大提高传输速度。<br />所以，未准确判断数据性质时不应禁用 Nagle 算法。
#### 禁用 Nagle 算法
禁用 Nagle 算法应该使用：
```cpp
#include <netinet/tcp.h>
#include <netinet/in.h>
int opt_val = 1; 
setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (void *)&opt_val, sizeof(opt_val));
```
通过 TCP_NODELAY 的值来查看Nagle 算法的设置状态。
```cpp
opt_len = sizeof(opt_val); 
getsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (void *)&opt_val, &opt_len);
```
如果正在使用Nagle 算法，那么 opt_val 值为 0（默认启用），如果禁用则为 1.<br />关于这个算法，可以参考这个回答：[TCP连接中启用和禁用TCP_NODELAY有什么影响？](https://www.zhihu.com/question/42308970/answer/246334766)
## 多进程服务器端
通过改进服务端，使其同时向所有发起请求的客户端提供服务，以提高平均满意度。而且，网络程序中数据通信时间比 CPU 运算时间占比更大，因此，向多个客户端提供服务是一种有效的利用 CPU 的方式。

- 多进程服务器：通过创建多个进程提供服务
- 多路复用服务器：通过捆绑并统一管理 I/O 对象提供服务
- 多线程服务器：通过生成与客户端等量的线程提供服务
### 进程概念及应用
#### 理解进程
进程的定义如下：
> 占用内存空间的正在运行的程序

所有的进程都会被操作系统分配一个 ID。此 ID 被称为「进程ID」，其值为大于 2 的整数。1 要分配给操作系统启动后的（用于协助操作系统）首个进程。<br />linux运行 ps au 命令，可以查看当前运行的所有进程的详细信息。
#### 调用 fork 函数创建进程
创建进程的方式很多，此处只介绍用于创建多进程服务端的 fork 函数。
```cpp
#include <unistd.h>
pid_t fork(void);
```
fork 函数将创建调用的进程副本，复制正在运行的、调用 fork 函数的进程。另外，两个进程都执行 fork 函数调用后的所有语句。但因为是通过同一个进程、复制相同的内存空间，之后的程序流要根据 fork 函数的返回值用if/else加以区分。即利用 fork 函数的如下特点区分程序执行流程。

- 父进程：fork 函数返回子进程 ID
- 子进程：fork 函数返回 0
```cpp
#include <stdio.h>
#include <unistd.h>
int gval = 10;
int main(int argc, char *argv[])
{
    pid_t pid;
    int lval = 20;
    gval++, lval += 5;
    // 先前gval=11, lval = 25
    pid = fork();
    if (pid == 0)  // 子进程操作val
        gval += 2, lval += 2;
    else  // 父进程操作
        gval -= 2, lval -= 2;
    if (pid == 0)
        printf("Child Proc: [%d,%d] \n", gval, lval);  // [13, 27]
    else
        printf("Parent Proc: [%d,%d] \n", gval, lval);  // [9, 23]
    return 0;
}
```
### 僵尸进程
> 僵尸进程是当子进程比父进程先结束，而父进程又没有回收子进程，释放子进程占用的资源，此时子进程将成为一个僵尸进程。如果父进程先退出 ，子进程被init接管，子进程退出后init会回收其占用的相关资源

使用ps au 查看僵尸进程时，其stat为Z，以下是常用stat，可组合使用
> D      //无法中断的休眠状态（通常 IO 的进程）； <br />R      //正在运行可中在队列中可过行的； <br />S      //处于休眠状态； <br />T      //停止或被追踪； <br />W      //进入内存交换 （从内核2.6开始无效）； <br />X      //死掉的进程 （基本很少见）； <br />Z      //僵尸进程； <br /><      //优先级高的进程 <br />N      //优先级较低的进程 <br />L      //有些页被锁进内存； <br />s      //进程的领导者（在它之下有子进程）； <br />l      //多线程，克隆线程（使用 CLONE_THREAD, 类似 NPTL pthreads）； <br />+      //位于后台的进程组；（正在使用的进程？）

#### 产生僵尸进程的原因
向 exit 函数传递的参数值(e.g. 0)和 main 函数的 return 语句返回的值(e.g. 0)都会传递给操作系统。而操作系统不会销毁子进程，**直到把这些值传递给产生该子进程的父进程**。处在这种状态下的进程就是僵尸进程。也就是说将子进程变成僵尸进程的正是操作系统。既然如此，僵尸进程何时被销毁呢？父进程主动发起请求（wait函数调用）的时候。
```cpp
#include <stdio.h>
#include <unistd.h>
int main(int argc, char *argv[])
{
    pid_t pid = fork();
    if (pid == 0)
    {
        puts("Hi, I am a child Process");
    }
    else
    {
        printf("Child Process ID: %d \n", pid);
        sleep(30);  // 使子进程变僵尸，30s后再终止子进程
    }
    if (pid == 0)
        puts("End child proess");
    else
        puts("End parent process");
    return 0;
}
```
> 利用 ./zombie &可以使程序在后台运行，不用打开新的命令行窗口。输入ps au查看Z

#### 销毁僵尸进程 1：利用 wait 函数
为了销毁子进程，父进程应该主动请求获取子进程的返回值。下面是发起请求的具体方法，有两种。
```cpp
#include <sys/wait.h>
pid_t wait(int *statloc);
/*
成功时返回终止的子进程 ID ,失败时返回 -1
*/
```
调用此函数时如果已有子进程终止，那么子进程终止时传递的返回值（exit 函数的参数返回值，main 函数的 return 返回值）将保存到该函数的参数所指的内存空间。但函数参数指向的内存空间中还包含其他信息，因此需要用下列宏进行分离：

- WIFEXITED 子进程正常终止时返回「真」
- WEXITSTATUS 返回子进程时的返回值

也就是说，向 wait 函数传递变量 status 的地址时，调用 wait 函数后应编写如下代码：<br />WIFIEXITED：((status) & 0x7f) == 0<br />WEXITSTATUS：(((status) & 0xff00) >> 8)
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main(int argc, char *argv[])
{
    int status;
    pid_t pid = fork(); //这里的子进程将在第13行通过 return 语句终止

    if (pid == 0)
    {
        return 3;
    }
    else
    {
        printf("Child PID: %d \n", pid);
        pid = fork(); //这里的子进程将在 21 行通过 exit() 函数终止
        if (pid == 0)
        {
            exit(7);
        }
        else
        {
            printf("Child PID: %d \n", pid);
            wait(&status);         //之间终止的子进程相关信息将被保存到 status 中，同时相关子进程被完全销毁
            if (WIFEXITED(status)) //通过 WIFEXITED 来验证子进程是否正常终止。如果正常终止，则调用 WEXITSTATUS 宏输出子进程返回值
                printf("Child send one: %d \n", WEXITSTATUS(status));

            wait(&status); //因为之前创建了两个进程，所以再次调用 wait 函数和宏
            if (WIFEXITED(status))
                printf("Child send two: %d \n", WEXITSTATUS(status));
            sleep(30);
        }
    }
    return 0;
}
```
这就是通过 wait 函数消灭僵尸进程的方法，调用 wait 函数时，如果没有已经终止的子进程，那么程序将**阻塞（Blocking）直到有子进程终止**，因此要谨慎调用该函数。
#### 销毁僵尸进程 2：使用 waitpid 函数
wait 函数会引起程序阻塞，还可以考虑调用 waitpid 函数。这是防止僵尸进程的第二种方法，也是防止阻塞的方法。
```cpp
#include <sys/wait.h>
pid_t waitpid(pid_t pid, int *statloc, int options);
/*
成功时返回终止的子进程ID 或 0 ，失败时返回 -1
pid: 等待终止的目标子进程的ID,若传 -1，则与 wait 函数相同，可以等待任意子进程终止
statloc: 与 wait 函数的 statloc 参数具有相同含义
options: 传递头文件 sys/wait.h 声明的常量 WNOHANG ,即使没有终止的子进程也不会进入阻塞状态，而是返回 0 退出函数。
*/

#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
int main(int argc, char *argv[]) {
    int status;
    pid_t pid = fork();
    if (pid == 0) {
        sleep(3); //用 sleep 推迟子进程的执行
        return 24;
    }
    else
    {
        //调用waitpid 传递参数 WNOHANG ，这样没有终止的子进程返回0
        while (!waitpid(-1, &status, WNOHANG)) {
            sleep(1);
            puts("sleep 3 sec.");
        }
        if (WIFEXITED(status))
            printf("Child send %d \n", WEXITSTATUS(status));
    }
    return 0;
}
```
### 信号处理
我们已经知道了进程的创建及销毁的办法，但是还有一个问题没有解决。
> 子进程究竟何时终止？调用 waitpid 函数后要无休止的等待吗？

子进程终止的识别主题是操作系统，因此，若操作系统能把子进程结束的信息告诉正忙于工作的父进程，将有助于构建更高效的程序<br />为了实现上述的功能，引入信号处理机制（Signal Handing）。此处「信号」是在特定事件发生时由操作系统向进程发送的消息。另外，为了响应该消息，执行与消息相关的自定义操作的过程被称为「处理」或「信号处理」（QT信号槽？）。
#### 信号与 signal 函数
下面进程和操作系统的对话可以帮助理解信号处理。
> 进程：操作系统，如果我之前创建的子进程终止，就帮我调用 zombie_handler 函数。
> 操作系统：好的，如果你的子进程终止，我就帮你调用 zombie_handler 函数，你先把函数要执行的语句写好。

1. 上述的对话，相当于「注册信号」的过程。

即进程发现自己的子进程结束时，请求操作系统调用特定的函数。该请求可以通过如下函数调用完成：
```cpp
#include <signal.h>
void (*signal(int signo, void (*func)(int)))(int);
/*
为了在产生信号时调用，返回之前注册的函数指针
函数名: signal
参数：int signo,void(*func)(int)
返回类型：参数类型为int型，返回 void 型函数指针
*/
```
调用上述函数时，第一个参数为特殊情况，第二个参数为特殊情况下将要**调用的函数的地址值**（指针）。发生第一个参数代表的情况时，调用第二个参数所指的函数。下面给出可以在 signal 函数中注册的部分特殊情况。

- SIGALRM：已到通过调用 alarm 函数注册时间
- SIGINT：输入 ctrl+c
- SIGCHLD：子进程终止

调用的函数的参数应为 int ，返回值类型应为 void 。只有这样才能成为 signal 函数的第二个参数。

2. 接下来编写 signal 函数的调用语句，分别完成如下两个请求：
   1. 已到通过 alarm 函数注册时间，请调用 timeout 函数
   2. 输入 ctrl+c 时调用 keycontrol 函数

代表这 2 种情况的常数分别为 SIGALRM 和 SIGINT ，因此按如下方式调用 signal 函数。
> signal(SIGALRM , timeout); 
> signal(SIGINT , keycontrol);

3. 注册好信号之后，发射注册信号时（注册的情况发生时），操作系统将调用该信号对应的函数。
```cpp
#include <unistd.h>
unsigned int alarm(unsigned int seconds);
// 返回0或以秒为单位的距 SIGALRM 信号发生所剩时间
// 如果调用该函数的同时向它传递一个正整型参数，相应时间后（以秒为单位）将产生 SIGALRM 信号。
// 若向该函数传递为 0 ，则之前对 SIGALRM 信号的预约将取消。
// 如果通过该函数预约信号后未指定该信号对应的处理函数，
// 则（通过调用 signal 函数）终止进程，不做任何处理。

#include <stdio.h>
#include <unistd.h>
#include <signal.h>
void timeout(int sig) { //信号处理器
    if (sig == SIGALRM)
        puts("Time out!");
    alarm(2); //为了每隔 2 秒重复产生 SIGALRM 信号，在信号处理器中调用 alarm 函数
}
void keycontrol(int sig) { //信号处理器

    if (sig == SIGINT)
        puts("CTRL+C pressed");
}
int main(int argc, char *argv[]) {
    int i;
    signal(SIGALRM, timeout); //注册信号及相应处理函数，注释该行2s后输出alarm clock，终止进程
    signal(SIGINT, keycontrol);
    alarm(2); //预约 2 秒候发射 SIGALRM 信号
    for (i = 0; i < 3; i++)  {
        puts("wait...");
        sleep(100);  // sleep 100s
    }
    return 0;
}
```
产生信号时，为了调用信号处理器，将唤醒由于调用 sleep 函数而进入阻塞状态的进程。<br />本来系统要睡眠100秒，但是到了 alarm(2) 规定的两秒之后，就会唤醒睡眠的进程，**进程被唤醒了就不会再进入睡眠状态了**，所以就不用等待100秒。如果把 timeout() 函数中的 alarm(2) 注释掉，就会先输出wait...，然后再输出Time out! (这时已经跳过了第一次的 sleep(100) 秒),然后就真的会睡眠100秒，因为没有再发出 alarm(2) 的信号。
#### 利用 sigaction 函数进行信号处理
> signal 函数在 Unix 系列的不同操作系统可能存在区别，但 sigaction 函数完全相同

实际上现在很少用 signal 函数编写程序，它只是为了保持对旧程序的兼容，下面介绍 sigaction 函数，只讲解可以替换 signal 函数的功能。
```cpp
#include <signal.h>
int sigaction(int signo, const struct sigaction *act, struct sigaction *oldact);
/*
成功时返回 0 ，失败时返回 -1
act: 对于第一个参数的信号处理函数（信号处理器）信息。
oldact: 通过此参数获取之前注册的信号处理函数指针，若不需要则传递 0
*/

// struct sigaction  // sigaction结构体
// {
//     void (*sa_handler)(int);  // 保存信号处理的函数指针值（地址值）
//     sigset_t sa_mask;  // 防止僵尸进程置0
//     int sa_flags;  // 可看源码的所有flag
// };

#include <stdio.h>
#include <unistd.h>
#include <signal.h>
void timeout(int sig) {
    if (sig == SIGALRM)
        puts("Time out!");
    alarm(2);
}
int main(int argc, char *argv[]) {
    int i;
    struct sigaction act;
    act.sa_handler = timeout;    // 保存函数指针
    sigemptyset(&act.sa_mask);   // sig empty set将 sa_mask 成员的所有位初始化成0
    act.sa_flags = 0;            //sa_flags 同样初始化成 0
    sigaction(SIGALRM, &act, 0); // 注册 SIGALRM 信号的处理器。
    
    alarm(2); //2 秒后发生 SIGALRM 信号
    for (int i = 0; i < 3; i++) {
        puts("wait...");
        sleep(100);
    }
    return 0;
}
```
#### 利用信号处理技术消灭僵尸进程
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>
void read_childproc(int sig) {  // 销毁子进程
    int status;
    pid_t id = waitpid(-1, &status, WNOHANG);
    if (WIFEXITED(status))
    {
        printf("Removed proc id: %d \n", id);             //子进程的 pid
        printf("Child send: %d \n", WEXITSTATUS(status)); //子进程的返回值
    }
}
int main(int argc, char *argv[]) {
    pid_t pid;
    struct sigaction act;
    act.sa_handler = read_childproc;
    sigemptyset(&act.sa_mask);
    act.sa_flags = 0;
    sigaction(SIGCHLD, &act, 0);

    pid = fork();
    if (pid == 0) {
        puts("Hi I'm child process 1");
        sleep(10);
        return 12;
    }
    else {
        printf("Child 1 proc id: %d\n", pid);
        pid = fork();
        if (pid == 0) {
            puts("Hi! I'm child process 2");
            sleep(10);
            exit(24);
        }
        else {
            int i;
            printf("Child 2 proc id: %d \n", pid);
            for (i = 0; i < 5; i++) {
                puts("wait");
                sleep(5);
            }
        }
    }
    return 0;
}
```
程序是先创建了两个子进程，并且父进程比子进程执行快。
> 1. wait
> 2. 5s -> wait
> 3. 5s -> wait
> 4. 两个子进程终止，唤醒父进程 -> wait -> wait （唤醒后不休眠，所以直接跳过两次for循环，进入最后一次休眠）
> 5. 5s -> 程序中止

### 基于多任务的并发服务器
#### 基于进程的并发服务器模型
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-10.png?imageMogr2/format/webp%7C)<br />从图中可以看出，每当有客户端请求时（连接请求），回声服务器都创建子进程以提供服务。如果请求的客户端有 5 个，则将创建 5 个子进程来提供服务，为了完成这些任务，需要经过如下过程：

- 第一阶段：回声服务器端（父进程）通过调用 accept 函数受理连接请求
- 第二阶段：此时获取的套接字文件描述符创建并传递给子进程
- 第三阶段：进程利用传递来的文件描述符提供服务

[完整代码](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch10/echo_mpserv.c)，可使用对应的[echo_client](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch04/echo_client.c)
```cpp
while (1) {
    adr_sz = sizeof(clnt_adr);
    clnt_sock = accept(serv_sock, (struct sockaddr *)&clnt_adr, &adr_sz);
    if (clnt_sock == -1)
        continue;
    else
        puts("new client connected...");
    pid = fork(); //此时，父子进程分别带有一个套接字
    if (pid == -1) {  // 分配失败
        close(clnt_sock);
        continue;
    }
    if (pid == 0) { //子进程运行区域, 此部分向客户端提供回声服务
        close(serv_sock); //关闭服务器套接字，因为从父进程传递到了子进程
        while ((str_len = read(clnt_sock, buf, BUFSIZ)) != 0)
            write(clnt_sock, buf, str_len);
        close(clnt_sock);
        puts("client disconnected...");
        return 0;
    }
    else
        close(clnt_sock); //通过 accept 函数创建的套接字文件描述符已经复制给子进程，因此服务器端要销毁自己的
}
```
#### 通过 fork 函数复制文件描述符
示例中给出了通过 fork 函数复制文件描述符的过程。父进程将 2 个套接字（一个是服务端套接字另一个是客户端套接字）文件描述符复制给了子进程。<br />调用 fork 函数时赋值**父进程的所有资源**，但是套接字不是归进程所有的，而是**归操作系统所有**，只是进程拥有代表相应套接字的文件描述符。<br />![image](https://camo.githubusercontent.com/e8059964da650325509a86c00916dc588b147221b21e0355ca13e6ee8126f667/68747470733a2f2f73322e617831782e636f6d2f323031392f30312f32312f6b5037526a782e706e67#from=url&id=SMxPg&originHeight=363&originWidth=513&originalType=binary&ratio=1.2&rotation=0&showTitle=false&status=done&style=none&title=)<br />如图所示，1 个套接字存在 2 个文件描述符时，只有 2 个文件描述符都终止（销毁）后，才能销毁套接字。如果维持图中的状态，即使**子进程销毁了与客户端连接的套接字文件描述符，也无法销毁套接字**（服务器套接字同样如此）。因此调用 fork 函数后，要将**无关紧要的套接字文件描述符关掉**，如图所示：<br />![](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-11.png?imageMogr2/format/webp%7C)
### 分割 TCP 的 I/O 程序
我们已经实现的回声**客户端**的数据回声方式如下：
> 向服务器传输数据，并等待服务器端回复。无条件等待，直到接收完服务器端的回声数据后，才能传输下一批数据。

传输数据后要等待服务器端返回的数据，因为程序代码中重复调用了 read 和 write 函数。只能这么写的原因之一是，程序在 1 个进程中运行，现在可以创建多个进程，因此可以分割数据收发过程。分割后过程如下图所示：<br />![image](https://camo.githubusercontent.com/60042284b80365905816ec0f9ca8bcf8695895916bad37b1d6d30a716e85ba0f/68747470733a2f2f73322e617831782e636f6d2f323031392f30312f32312f6b5062686b442e706e67#from=url&id=Qy4jl&originHeight=295&originWidth=459&originalType=binary&ratio=1.2&rotation=0&showTitle=false&status=done&style=none&title=)<br />从图中可以看出，客户端的父进程负责接收数据，额外创建的子进程负责发送数据，分割后，父子进程分别负责输入输出，这样，无论客户端是否从服务器端接收完数据都可以进程传输。<br />分割 I/O 程序的另外一个好处是，可以提高频繁交换数据的程序性能，如下图所示：<br />![](https://pic.keepjolly.com/halo/blog/2023/06/20230607220100-12.png?imageMogr2/format/webp%7C)<br />根据上图显示可以看出，在网络不好的情况下，明显提升速度。

- [回声客户端的 I/O 分割的代码实现](https://github.com/riba2534/TCP-IP-NetworkNote/blob/master/ch10/echo_mpclient.c)
