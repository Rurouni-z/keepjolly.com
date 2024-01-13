---
title: (leetcode) 三日三题
date: 2022-03-30 14:53:45.377
updated: 2022-03-30 14:53:45.377
url: /archives/leetcodethree-day-three-code
categories: 
- other
tags: 
- Python
- LeetCode
---

## 找出缺失的观测数据
[找出缺失的观测数据](https://leetcode-cn.com/problems/find-missing-observations/)
```python
# 我的题解
def missingRolls(rolls, mean, n):
    loss_sum = mean * (n + len(rolls)) - sum(rolls)
    loss_l = []
    if not n <= loss_sum <= 6*n:
        return loss_l
    for i in range(n):  # 没找出规律，瞎猫碰上死耗子
        num = loss_sum // n
        loss_l.append(num)
        loss_sum -= num
        n -= 1
    return loss_l
# 官方题解
def missingRolls(rolls, mean, n):
    missingSum = mean * (n + len(rolls)) - sum(rolls)
    if not n <= missingSum <= n * 6:
        return []
    # divmod(x, y) return the tuple (x//y, x%y)
    quotient, remainder = divmod(missingSum, n) 
    return [quotient + 1] * remainder + [quotient] * (n - remainder)
# 作者：himymBen
def missingRolls(rolls: List[int], mean: int, n: int) -> List[int]:
        return [s // n + 1] * (s % n) + [s // n] * (n - s % n) 
                if n <= (s := mean * (len(rolls) + n) - sum(rolls)) <= 6 * n else []
```
## 交替位二进制数
[交替位二进制数](https://leetcode-cn.com/problems/binary-number-with-alternating-bits/)
原本以为超时，没想到直接ac了
```python
def hasAlternatingBits(n):
    while n:
        sam = n % 2
        n //= 2
        if sam == n %2:
            return False
    return True
# 打表
def hasAlternatingBits(n):
    return n in {
        1, 2, 5, 10, 21, 42, 85, 170, 341, 682, 1365, 2730, 5461, 10922,
        21845, 43690, 87381, 174762, 349525, 699050, 1398101, 2796202, 5592405,
        11184810, 22369621, 44739242, 89478485, 178956970, 357913941, 715827882,
        1431655765
    }
# 异或
def hasAlternatingBits(self, n: int) -> bool:
    a = n ^ (n >> 1)
    return a & (a + 1) == 0
# https://leetcode-cn.com/problems/binary-number-with-alternating-bits/comments/35738
'''
 分析：
 如果n是交替的01，对于它右移一位后得到的m，
 存在n跟m在二进制下必然是0和1对应的（对位）。异或运算必定都是1；
 举个栗子：5=101 5>>1=10,5^(5>>1)=111 (这是伪代码)
  101
   10  =111
 其他情况都不会满足这个特征。所以temp=n^(n>>1)必定满足temp=2^N-1=2^3-1=7;
 而temp+1后是N+1位二进制数2^(N+1)=8=1000。
 所以temp&(temp+1)==0；
 如果满足这个等式就是就是交替位二进制数
'''
# python内置函数 bin()
def hasAlternatingBits(n):
    return not ('11' in bin(n) or '00' in bin(n))
```
## 考试的最大困扰度
[考试的最大困扰度](https://leetcode-cn.com/problems/maximize-the-confusion-of-an-exam/)
思路：[Link](https://leetcode-cn.com/problems/maximize-the-confusion-of-an-exam/solution/-by-mochi-ds-onfv/)
滑动窗口思想：监视k窗口内的值，如果二者数量都超过k，表示无论修改哪个值都必定不满足条件，且当前连续串长度是最后一次不超过k的长度，且最大窗口是连续串的长度，当最大窗口确定下来后，因为不满足，所以根据这个最大窗口进行左移比较是否窗口内有新的值可以满足。
视频解析：[Link](https://leetcode-cn.com/problems/maximize-the-confusion-of-an-exam/solution/shua-ti-ka-pei-guan-hua-dong-chuang-kou-te8b0/)
```python
# 动态规划
def maxConsecutiveAnswers(self, answerKey, k):
    f1, f2 = [], []
    ans1, ans2, cnt1, cnt2 = 0, 0, 0, 0
    for i in range(len(answerKey)):
        if answerKey[i] == 'T':
            f1.append(i)  # 记录'T'的位置
            cnt1 += 1
        else:
            f2.append(i)  # 记录'F'的位置
            cnt2 += 1
        if cnt1 <= k:
            ans1 = i + 1  # 从左到右前i+1个值，因为修改了k个使其全部相等
        else: # cnt1+1后走这条路
            ans1 = max(ans1, i-f1[cnt1-k-1])  # cnt1-k-1使f从最左边开始
        if cnt2 <= k:
            ans2 = i + 1
        else:
            ans2 = max(ans2, i-f2[cnt2-k-1])
    return max(ans1, ans2)
# 滑动窗口优化版
def maxConsecutiveAnswers(self, answerKey, k):
    ans, cnt, left = 0, 0, 0
    for i in range(len(answerKey)):
        if answerKey[i] == 'T':
            cnt += 1
        if cnt > k and i - left - cnt + 1 > k:  # F的cnt由i-left-cnt+1可得
                                                # 右标-左标-'T'的cnt+'F'本身
            if answerKey[left] == 'T':
                cnt -= 1
            left += 1
        ans = i - left + 1
    return ans
# 记录用，函数嵌套递归
def maxConsecutiveAnswers(self, answerKey: str, k: int) -> int:
    def maxConsecutiveChar(ch: str) -> int:
        ans, left, sum = 0, 0, 0
        for right in range(len(answerKey)):
            sum += answerKey[right] != ch
            while sum > k:
                sum -= answerKey[left] != ch
                left += 1
            ans = max(ans, right - left + 1)
        return ans
    return max(maxConsecutiveChar('T'), maxConsecutiveChar('F'))

```
