---
title: Java 学习 半成品
date: 2023-03-11 20:23:47.173
updated: 2023-03-11 20:23:47.173
url: /archives/java-study
toc: false
rightToc: true
categories: 
- other
tags: 
- Java
---

半路转C++了，所以没学完Java，相对来说，韩顺平这个Java视频讲的很详细，如果时间充裕可以看看。
## 初阶知识
### 变量
#### 加法运算
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311202016.png?imageMogr2/format/webp%7C)
#### 浮点数/byte/布尔值

- 浮点数 = 符号位 +指数位 +尾数位

浮点数默认为double类型，float n1 = 1.1+anything 报错

- boolean变量只能为true/false
- 给byte赋常数时，**先**判断该值是否在byte范围(-128~127)内，所以不会出现赋值为int类型
#### 自动类型转换
进行赋值或运算时，小精度类型自动转化为大精度类型
char/(byte → short) → int → long → float → double
byte/char/short 同类型计算或它们之间计算都会自动转成int类型
强制转换
(int)(long/float值)
### 运算符
#### 算数运算符运算

- a % b = a - a / b * b 所以当b为**负数**反而为正，ab全为负数则为负
```cpp
int i = 1;
i = i++; // temp = i; i = i+1; i = temp;
System.out.println(i); // i=1
```

-  复合赋值运算符会自动类型转换(包括++，--)
   - b += 2; -> b = (type)b + 2;
#### 逻辑运算符
& 和 | 用在检查特等奖和一等奖之间取最好的那个
#### 进制
整数有四种进制：

1. 二进制：以0b或0B开头
2. 十进制
3. 八进制：以0开头
4. 十六进制：以0x或0X开头

二进制转八进制：从低位开始，二进制数**每三位(**$2^{3}=8$**)**一组，换算成对应八进制数
二进制转十六进制：从低位开始，二进制数**每四位**一组，换算成对应八进制数
反之，则将八(十六)进制数**每位**转成对应**三(四)**位二进制数即可
#### 位运算
原码，反码，补码：

- 正数三码合一
- 负数的反码 = 原码符号位不变，其他位取反
- 负数的反码 = 补码 - 1；补码 = 反码 + 1
- 0的反码、补码都是0
- 计算机以补码进行运算，Java的数都是有符号
- 运算结果用原码
- 二进制最高位为符号位：0正1负，位数取决于int大小

位运算符：

- 算数右移>>：低位溢出，符号位不变，高位补符号位 <=> b/2
- 算数左移<<：符号位不变，低位补0 <=> b*2
- 逻辑右移>>>：低位溢出，高位补0
- 低位溢出指的是删除最右边移动的数个；高位补数指的是将数个加到最左边，整体右移
- 1000 0000 0000 0110 >>>2：**00**10 0000 0000 00**01 **
```cpp
// -2原 10000000 00000000 00000000 00000010
// -2反 11111111 11111111 11111111 11111101
// -2补 11111111 11111111 11111111 11111110
// -2移 00111111 11111111 11111111 11111111
// -2反 11111111 11111111 11111111 11111011
// -2原 10000000 00000000 00000000 00000100
int a = 0b00111111111111111111111111111111;
System.out.println(a);
System.out.print(-2>>>2);
```
### 控制结构

- switch中表达式的返回值必须是：byte, short, int, char, enum, String
- break/continue 可以通过标签指明终止/跳过哪一层语句块（不建议使用）
   - ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311202016-1.png?imageMogr2/format/webp%7C)
- "lucky".equals(type) // 避免空指针
### 数组/排序/查找
#### 二维数组
```java
// 动态创建数组
public static void main(String[] args){
	int [][] arr = new int[3][];  // 确定一维数组个数
    for (int i = 0; i < arr.length; ++i){
        arr[i] = new int[i+1];  // 第i排上开辟空间
    }
}
// 双下标经典用法
int insert_num = 15;
for (int i = 0, j = 0; i<arrNew.length; ++i){
    if (insert_num < arr[j]){
        ++j;
        arrNew[i] = arr[j];
    else arrNew[i] = insert_num;
}
```
### 对象
#### 对象内存布局
加载cat类信息从第一句代码就执行
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311202016-2.png?imageMogr2/format/webp%7C)
#### Java内存的结构分析

- 栈：一般存放基本数据类型（局部变量）
- 堆：存放对象、数组
- 方法区：常量池，类加载信息

Java创建对象的流程

1. 加载Person类信息（属性和方法信息，只加载一次）
2. 在堆中分配空间，进行默认初始化
3. 把地址赋给p，p就指向对象
4. 进行属性赋值

当方法内将对象置空/创建新对象，不会改变main中的对象，参考[传参机制](https://www.bilibili.com/video/BV1fh411y7R8?p=213)
#### 递归 ☆☆☆
```java
/*
 * 终止条件：在[6][6] == 2
 * 递归方式：左下右上
 * 遇到的情况：0：未走 1 墙 2 走过 3 不通
 */
boolean findWay(int[][] map, int i, int j){
    if (map[6][6] == 2){
        return true;
    }else{
        // 当前点的情况
        if (map[i][j] == 0){
            map[i][j] = 2;
            if (findWay(map, i, j+1))
                return true;
            else if (findWay(map, i+1, j))
                return true;
            else if (findWay(map, i, j-1))
                return true;
            else if (findWay(map, i-1, j))
                return true;
            map[i][j] = 3;
            return false;
        }else{ // 1,2,3 都不能修改节点值，无法移动
            return false;
        }  
    }
}
```
#### 可变参数
语法：访问修饰符 返回类型 方法名(数据类型... 形参名)

- 可变参数本质是数组，因此实参可以为数组或0-N个值
- 可变参数和普通参数放一起，需保证可变参数在最后
- 形参列表只能有一个可变参数
#### 作用域
全局变量（属性）：作用域为整个类体，有默认值
局部变量（除属性外其他变量）：作用域为代码块，没有默认值
#### this使用

- 访问构造器语法：this(参数列表)，只能在构造器中使用，并且放在第一条语句中
## 中阶知识
### Idea快捷键

- ctrl + D 粘贴至下一行 
- ctrl + Y 删除当前行
- alt + / 补全代码
- alt + insert 生成构造器 
- ctrl + H 查看类的层级关系 Hierarchy
- ctrl + B 定位方法
- alt + enter/ .var 自动分配变量名 
## 额外知识
#### 字符串
[字符串常量池](https://blog.csdn.net/langhong8/article/details/50938041)
#### Cannot make a static reference to the non-static
[Cannot make a static reference to the non-static](https://blog.csdn.net/q610376681/article/details/49359819)
