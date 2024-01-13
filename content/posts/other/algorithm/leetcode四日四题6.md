---
title: (leetcode) 四日四题
date: 2022-04-16 16:41:20.711
updated: 2022-04-16 16:41:20.711
url: /archives/leetcode-four-day-four-ans
categories: 
- other
tags: 
- Python
- LeetCode
---

## O(1) 时间插入、删除和获取随机元素
[O(1) 时间插入、删除和获取随机元素](https://leetcode-cn.com/problems/insert-delete-getrandom-o1/)
```python
# 暴力
class RandomizedSet(object):
    def __init__(self):
        self.list = []

    def insert(self, val):
        if val not in self.list:
            self.list.append(val)
            return True
        return False

    def remove(self, val):
        if val not in self.list:
            return False
        self.list.remove(val)
        return True

    def getRandom(self):
        return choice(self.list)
# list + 哈希表
# 执行用时：620 ms
# 内存消耗：49.4 MB
class RandomizedSet:
    def __init__(self):
        self.nums = []
        self.indices = {}

    def insert(self, val: int) -> bool:
        if val in self.nums:
            return False
        # len(nums) 下标从0开始
        self.indices[val] = len(self.nums)
        self.nums.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.nums:
            return False
        # 将val放在list末尾后，防止移动
        idx = self.indices[val]
        self.nums[idx] = self.nums[-1]
        # 先修改indices再删除nums的元素，防止index out of range
        self.indices[self.nums[idx]] = idx
        self.nums.pop()
        return True

    def getRandom(self) -> int:
        return choice(self.nums)
# 使用set 效率与上面差不多
# 执行用时: 532 ms
# 内存消耗: 49.5 MB
class RandomizedSet:
    def __init__(self):
        self.nums = set()

    def insert(self, val: int) -> bool:
        if val in self.nums:
            return False
        self.nums.add(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.nums:
            return False
        self.nums.remove(val)
        return True

    def getRandom(self) -> int:
        return choice(list(self.nums))
```
## 最富有客户的资产总量
[最富有客户的资产总量](https://leetcode-cn.com/problems/richest-customer-wealth/)
```python
# 代码长
def maximumWealth(self, accounts: List[List[int]]) -> int:
    m = 0
    for i in accounts:
        s = sum(i)
        if s > m:
            m = s
    return m
# 代码短
def maximumWealth(self, accounts: List[List[int]]) -> int:
    # max()返回最大行
    return sum(max(accounts, key=sum))
    # map()返回每行求和值
    return max(map(sum, accounts))
```
## 迷你语法分析器
[迷你语法分析器](https://leetcode-cn.com/problems/mini-parser/)
看接口原型：[Link](https://leetcode-cn.com/problems/mini-parser/solution/by-ac_oier-zuy6/1507877)
```python
# 一行解决 双百效率摘自评论区
def deserialize(s: str) -> NestedInteger:
    return json.loads(s)
# 不想写了 取自题解
class Solution:
    def deserialize(self, s: str) -> NestedInteger:
        # 纯数字
        if s[0] != '[':
            return NestedInteger(int(s))
        stack, curVal, sign = [], 0, False
        for i, c in enumerate(s):
            match c:
                case '[':
                    # 递归嵌套
                    stack.append(NestedInteger())
                case '-':
                    # 数字符号
                    sign = True
                case ',':
                    # 只有上一个字符是数字才加入了新的数字，否则可能是 "],"
                    if s[i - 1].isdigit():
                        stack[-1].add(NestedInteger(-curVal if sign else curVal))
                    curVal, sign = 0, False
                case ']':
                    # 只有上一个字符是数字才加入了新的数字，否则可能是 "[]"
                    if s[i - 1].isdigit():
                        stack[-1].add(NestedInteger(-curVal if sign else curVal))
                    # 弹出栈，并将当前的对象加入嵌套的列表中
                    if len(stack) > 1:
                        cur = stack.pop()
                        stack[-1].add(cur)
                    curVal, sign = 0, False
                case _:
                    # 数字计算
                    curVal = curVal * 10 + int(c)
        return stack.pop()
```
## 最大回文数乘积
[最大回文数乘积](https://leetcode-cn.com/problems/largest-palindrome-product/)
学习回文数构造
```python
# 官解
def largestPalindrome(n: int) -> int:
    if n == 1:
        return 9  # 9无法回文，但是个位数最大
    upper = pow(10, n) - 1
    for left in range(upper, upper // 10, -1):  # upper//10
        p, x = left, left
        while x:  # 判断回文数
            # 当p=98
            # 98*10+98%10 = 980+8
            # 988*10+9%10 =  9880+9
            # 9889
            p = p * 10 + x % 10  # 拼接回文数
            x //= 10
        x = upper
        # 使x满足要求 99*99=9801<9999
        # 并且x从最大值开始，则x*x也为当前最大值，不满足条件时，比x小的值也无法等于p
        while x * x >= p:
            if p % x == 0:
                return p % 1337
            x -= 1
# 判断回文数，未优化
def isPalindrome(x, n):  # n指定位数
    # https://blog.csdn.net/u012509485/article/details/79586770
    if x > 0:  # 不知道位数，判断x的位数
        n = int(math.log10(x)+1)
    elif x == 0:
        return True
    else:
        n = int(math.log10(-x)+1)
    x = str(x)
    left = len(x) - 1
    right = 0
    while n:
        if x[left] != x[right]:
            return False
        left -= 1
        right += 1
        n -= 1
    return True
```
