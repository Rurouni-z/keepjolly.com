---
title: (leetcode) 三日三题
date: 2022-03-26 10:02:04.603
updated: 2022-04-03 19:00:49.63
url: /archives/leetcode-one-question-per-day
categories: 
- leetcode
tags: 
- Python
- 力扣
---

作为第一篇力扣每日一题，要好好坚持，广大网友给我监督！！
## [图片平滑器](https://leetcode-cn.com/problems/image-smoother/)
```python
# 速度有点拉跨
def imageSmoother(self, img):
    import numpy as np
    import copy
    # 利用pad填充原矩阵，并且防止原矩阵有0，故填充-1
    padList = np.pad(img, ((1, 1), (1, 1)), 'constant', constant_values=-1)  
    # 不用深拷贝会报错
    # https://leetcode-cn.com/problems/image-smoother/comments/1461270
    newImg = copy.deepcopy(img) 
    # 获取img的行列
    m, n = len(img), len(img[0])
    for i in range(m):
        for j in range(n):
            # 深拷贝，防止后续修改padList
            zeroList = copy.deepcopy(padList[i: i + 3, j:j + 3])
            # 计算9个元素中哪些元素是原数组，即非 -1 就是原元素
            count = 9 - np.sum(zeroList == -1)
            # 遮罩层，重新置为0方便sum求和
            # 或者得到-1的个数重新加回去，减小内存开销
            mask = (zeroList == -1)
            zeroList[mask] = 0
            # 计算值
            newImg[i][j] = np.sum(zeroList) // count
            return newImg
# 修改版
def imageSmoother(self, img):
    import numpy as np
    padList = np.pad(img, ((1, 1), (1, 1)), 'constant', constant_values=-1)
    newImg = img
    m, n = len(img), len(img[0])
    for i in range(m):
        for j in range(n):
            zeroList = padList[i: i + 3, j:j + 3]
            count = np.sum(zeroList > -1)
            mask = (zeroList > -1)
            newImg[i][j] = np.sum(zeroList[mask])//count
    return newImg
```
### 大佬题解
[Link](https://leetcode-cn.com/problems/image-smoother/solution/100-zhao-dao-shang-xia-xian-yu-zuo-you-xian-by-ooo/)
```python
m, n = len(img), len(img[0])
newImg = [[0] * n for _ in range(m)]
for idx in range(m * n):
    # 除以n非m
    cur_r = idx // n  # r行
    cur_c = idx % n  # c列
    x1, y1 = cur_r, cur_c
    x2, y2 = cur_r, cur_c
    sum1 = 0
    if cur_r - 1 >= 0:  # 上限 (-1, 0)    往上走不行
        x1 = cur_r - 1
    if cur_r + 1 < m:  # 下限 (m+1, 0)   往下走不行
        x2 = cur_r + 1
    if cur_c - 1 >= 0:  # 左限 (0, -1)    往左走不行
        y1 = cur_c - 1
    if cur_c + 1 < n:  # 右限 (0, n+1)   往右走不行
        y2 = cur_c + 1
    for i in range(x1, x2 + 1):
        for j in range(y1, y2 + 1):
            sum1 += img[i][j]
    count = (y2 - y1 + 1) * (x2 - x1 + 1)
    print(sum1)
    newImg[cur_r][cur_c] = sum1 // count
return newImg
```
### python性能好版
```python
# list版 占13.9mb
def imageSmoother(self, img):
    res = []
    l1, l2 = len(img), len(img[0])
    expand = np.pad(img, ((1, 1), (1, 1)), 'constant', constant_values=-1)
    expand = expand.tolist()
    res = [[0] * l2 for _ in range(l1)]
    for i in range(l1):
        for j in range(l2):
            nine = [expand[i][j], expand[i][j + 1], expand[i][j + 2], expand[i + 1][j], expand[i + 1][j + 1],
                    expand[i + 1][j + 2], expand[i + 2][j], expand[i + 2][j + 1], expand[i + 2][j + 2]]
            num = nine.count(-1)
            res[i][j] = (sum(nine) + num) // (9 - num)
    return res
# numpy版 占25.3mb
def imageSmoother(self, img):
    import numpy as np
    l1, l2 = len(img), len(img[0])
    expand = np.pad(img, ((1, 1), (1, 1)), 'constant', constant_values=-1)
    expand = expand.tolist()
    res = [[0] * l2 for _ in range(l1)]
    for i in range(l1):
        for j in range(l2):
            nine = [expand[i][j], expand[i][j + 1], expand[i][j + 2], expand[i + 1][j], expand[i + 1][j + 1],
                    expand[i + 1][j + 2], expand[i + 2][j], expand[i + 2][j + 1], expand[i + 2][j + 2]]
            num = nine.count(-1)
            res[i][j] = (sum(nine) + num) // (9 - num)
    return res
```

- numpy操作可能比list操作占内存大
- 注意python的浅拷贝！！
```python
img = [1,2,3] 
copyImg = img
copyImg[0] = 2 # 则img也同步修改
# 新建一个m*n列表
newImg = [[0] * n for _ in range(m)]
```
回顾一遍
```python
"""
4 6 6 4
6 9 9 6 
6 9 9 6 
4 6 6 4
考虑46的情况可知x1y1,x2y2的坐标
"""
def tryImageAgain(img):
    m = len(img)
    n = len(img[0])
    ans = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            x1, x2 = i, i
            y1, y2 = j, j
            # 计算满足条件的x1y1x2y2的值
            # 如果计算违反条件的值，需要考虑的变量多
            # 如i-1<0时，表明当前在第一行，如果是[0][0]需要修改x2y2，如果是[0][1]需要修改x1y1x2y2，
            # 如果在左上角，则x1y1不用变，考虑后两个if
            if i-1 >= 0: x1 = i-1  # 如果[i][j]在第一行之后行，则左上标为[i-1][j]
            if j-1 >= 0: y1 = j-1  # 如果[i][j]在第一列之后列，则左上标为[i][j-1] 在第二行第二列则[i-1][j-1]
            # 如果在右下角，则x2y2不用变，考虑前两个if
            if i+1 < m: x2 = i+1  # 如果[i][j]在第m行之前行，则右下标为[i+1][j]
            if j+1 < n: y2 = j+1  # 如果[i][j]在第n列之前列，则右下标为[i][j+1]
            # 妙啊
            s = 0
            for x in range(x1, x2+1):
                s += sum(img[x][y1:y2+1])
            div = (y2-y1+1)*(x2-x1+1)
            ans[i][j] = s // div
    return ans
```
## [阶乘后的零](https://leetcode-cn.com/problems/factorial-trailing-zeroes/)
本质就是求质因数，考数学题，~~太难了~~
n! = 1 * 2 * 3 * 4 * (1 * 5) * ... * (2 * 5) * ... * (3 * 5) *... * n
因为**每隔 5 个数出现一个 5，所以计算n!中出现了多少个 5，我们只需要用 n/5 就可以算出来**。即n=5，1；n=10，2.
n! = ... * (1 * 5) * ... * (1 * 5 * 5) * ... * (2 * 5 * 5) * ... * (3 * 5 * 5) * ... * n
每隔 25 个数字，出现的是两个 5，所以除了每隔 5 个数算作一个 5，每隔 25 个数，还需要多算一个 5。
也就是我们需要再加上 n / 25 个 5。
同理我们还会发现每隔 5 * 5 * 5 = 125 个数字，会出现 3 个 5，所以我们还需要再加上 n / 125 。
最后，规律就是**每隔 5 个数，出现一个 5，每隔 25 个数，出现 2 个 5，每隔 125 个数，出现 3 个 5... 以此类推。**即 n / 5 + n / 25 + n / 125 ...
又因为呈现递进关系，每次 ÷5 更新n的值，使其一直处于n/5的状态。
[例子](https://leetcode-cn.com/problems/factorial-trailing-zeroes/solution/jie-cheng-hou-de-ling-by-leetcode-soluti-1egk/1462453)：
第一次：5，10，15，…，130，至少包含1个5的数为26个
第二次：25，50，75，100，125，至少包含2个5的数有这5个
第三次：125，它至少包含3个5（其实也只包含3个5）
思路：[Link](https://leetcode-cn.com/problems/factorial-trailing-zeroes/solution/xiang-xi-tong-su-de-si-lu-fen-xi-by-windliang-3/)

```python
def trailingZeroes(n):
    count = 0
    p = 5  # 用p代替5，即可以推广到n!中p因子的个数
    while n:
        # p += n/5  # 直观解法
        # n/=5  # 使其维持n/p的格式，求n!中只含一个p的个数
                # 否则需要计算n/p+n/2*p+n/3*p...
        n //= p 
        count += n  
    return count

# 递归解法，来自力扣宫水三叶
def trailingZeroes(self, n: int) -> int:
    return n // 5 + self.trailingZeroes(n // 5) if n else 0

# 官解朴素版
# n!中质因子 5 的个数等于 [1,n] 的每个数的质因子 5 的个数之和，
# 我们可以通过遍历 [1,n] 的所有 5 的倍数求出。
def trailingZeroes(self, n: int) -> int:
    ans = 0
    for i in range(5, n + 1, 5):
        while i % 5 == 0:
            i //= 5
            ans += 1
    return ans


```
## [棒球比赛](https://leetcode-cn.com/problems/baseball-game/)
唯一注意的点就是python一些语法，如`del 列表元素`、`sum(列表)`、match case只在python3.10支持即switch case、将字符串转整形
```python
def calPoints(ops):
    i = 0
    while 1:
        if ops[i] == 'C':
            del ops[i-1:i+1]
            i -= 2
        elif ops[i] == 'D':
            ops[i] = int(ops[i-1]) * 2
        elif ops[i] == '+':
            ops[i] = int(ops[i - 1]) + int(ops[i - 2])
        else:
            ops[i] = int(ops[i])
        i += 1
        if i >= len(ops):
            break
    return sum(ops)
```
