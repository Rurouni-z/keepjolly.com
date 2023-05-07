---
title: Linux 两台设备用网线通信
date: 2022-12-15 19:50:58.186
updated: 2022-12-15 19:51:28.162
url: /archives/linux-two-device-directly-communicate
categories: 
- 应用
tags: 
- Linux
---

## 问题来源
项目需求用Ubuntu和Debian互相通信，传输数据
参考链接：[Ubuntu通过修改配置文件进行网络配置](https://blog.51cto.com/u_15315240/3202599)、[linux 双机直连设置](https://blog.51cto.com/yhd2011/732156)
## 物理连接
首先当然是用网线将两台设备连接起来，用的是本地接口
## 修改Ubuntu的ip地址

1. 此处先在终端（Ubuntu快捷键ctrl+alt+t）**ifconfig**查看当前ip地址
![2022-12-01 10-05-31 的屏幕截图.png](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2022/12/20221215194637.png?imageMogr2/format/webp|?watermark/3/type/3/text/a2VlcGpvbGx5)
- 此处如果没有配置enp4s0的话 就不会出现inet 192.168.0.1这些东西，如果配置过，则会显示，那么只需要配置另一台Linux设备处在统一网段下即可。
- 此外有些设备可能不叫enp4s0,只要看到e开头的就是本地网络，即插网线的地方，或者Google冒号前的意思。
2. 然后终端输入**sudo vim /etc/network/interfaces**

摁i进入insert模式，新加内容：
```
auto enp4s0
iface enp4s0 inet static
address 192.168.0.1
netmask  255.255.255.0
gateway  192.168.0.1
```
其中enp4s0 换成你的设备名字，如eth0；其他部分懂网络的任意设置，跟我一样小白的直接复制粘贴
![1.jpg](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2022/12/20221215194637-1.jpg?imageMogr2/format/webp|?watermark/3/type/3/text/a2VlcGpvbGx5)
摁esc退出编辑模式，输入:wq 进行写入退出
## 修改Debian的ip地址
[debian 10 静态ip配置](https://blog.csdn.net/weixin_45784720/article/details/109441084)
注意其中的addr需要设置为192.168.0.2
```
auto eth0
iface eth0 inet static
address 192.168.0.2
netmask 255.255.255.0
gateway 192.168.0.1  # 这个好像没什么关系 网关我也忘了什么意思了
```
![1.jpg](https://halo-1310118673.cos.ap-singapore.myqcloud.com/halo/blog/2022/12/20221215194637-2.jpg?imageMogr2/format/webp|?watermark/3/type/3/text/a2VlcGpvbGx5)

