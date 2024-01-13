---
title: (leetcode) 四日四题
date: 2022-04-12 10:45:54.126
updated: 2022-04-12 10:45:54.126
url: /archives/leetcode-four-day-four-answer-1
categories: 
- other
tags: 
- Python
- LeetCode
---

## 二进制表示中质数个计算置位
[二进制表示中质数个计算置位](https://leetcode-cn.com/problems/prime-number-of-set-bits-in-binary-representation/)
[Link](https://leetcode-cn.com/problems/prime-number-of-set-bits-in-binary-representation/solution/
[Link](https://leetcode-cn.com/problems/prime-number-of-set-bits-in-binary-representation/solution/er-jin-zhi-biao-shi-zhong-zhi-shu-ge-ji-jy35g/1486534)
1，计算整数x的二进制表示有多少个1： x&=x-1可以消除x最低位的1，while循环计数，直到x=0即可。
2，只保留整数x最低位的1： x&-x ，暨鼎鼎大名的lowbit
&gt;&gt;1 相当于除2，<<1相当与乘2，因为一位相当于2^1
```python
# 暴力，但忘记素数怎么求
def check(x):
    cnt = 0
    while x != 0:
        x -= x & -x  # x & -x
        cnt += 1
    return isPrime(cnt)

def isPrime(x):
    if x < 2:
        return False
    for i in range(2, int(x**0.5)+1):  # 优化循环次数
        if x % i == 0:
            return False
    return True

def countPrimeSetBits(left, right):
    ans = 0
    for i in range(left, right + 1):
        if check(i):
            ans += 1
    return ans
# python库
def countPrimeSetBits(left, right):
    prime = (2, 3, 5, 7, 11, 13, 17, 19)  # 因为right最大不超过20位
    return sum(bin(i).count('1') in prime for i in range(left, right + 1))
# 10100010100010101100存储上述素数
# 当x中1的个数与该数求&不为0，则说明1的个数在上述素数组合内
# python3
def countPrimeSetBits(left, right):
    return sum(((1 << x.bit_count()) & 665772) != 0 for x in range(left, right + 1))

```
## 旋转字符串
[旋转字符串](https://leetcode-cn.com/problems/rotate-string/)
```python
class Solution(object):
    def rotateString(self, s, goal):
        for i in range(0, len(s)):
            newS = s[1] + s[2:len(s)] + s[0]
            if newS == goal:
                return True
            s = newS
        return False
# 首尾相连包括所有可能
class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        return len(s) == len(goal) and goal in s + s
```
## N叉树的层序遍历
[N 叉树的层序遍历](https://leetcode-cn.com/problems/n-ary-tree-level-order-traversal/)
模板题
```python
def levelOrder(self, root: 'Node') -> List[List[int]]:
    if not root:
        return []

    ans = list()
    q = deque([root])

    while q:
        cnt = len(q)
        level = list()
        for _ in range(cnt):
            cur = q.popleft()
            level.append(cur.val)
            for child in cur.children:
                q.append(child)
        ans.append(level)
    return ans
    
```
## 最小高度树
[最小高度树](https://leetcode-cn.com/problems/minimum-height-trees/)
难 暂放
