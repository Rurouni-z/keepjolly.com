---
title: (leetcode) 一周六题.md
date: 2022-04-30 14:50:31.527
updated: 2022-04-30 14:51:04.706
url: /archives/leetcode-one-week-six-ans
categories: 
- algorithm
tags: 
- LeetCode
---

至此一个月全部打卡，之后按专题来进行提高
## 随机数索引
[随机数索引](https://leetcode-cn.com/problems/random-pick-index/)
```python
# 暴力
class Solution:

    def __init__(self, nums: List[int]):
        self.nums = nums

    def pick(self, target: int) -> int:
        dic = {}
        # 新建字典 key:int value:list
        for i, num in enumerate(self.nums):
            if num in dic:
                dic[num].append(i)
                continue
            dic[num] = [i]
        return random.choice(dic[target])
# 水塘抽样
# https://zhuanlan.zhihu.com/p/29178293
class Solution:

    def __init__(self, nums: List[int]):
        self.nums = nums

    def pick(self, target: int) -> int:
        cnt, ans = 0, 0
        for i, num in enumerate(self.nums):
            if num == target:
                cnt += 1
                if random.randrange(cnt) == 0:
                    ans = i
        return ans
# 随机抽k个
# 仅供参考
def ReservoirSampling(nums, target, k):
    res = [0]*k
    idx = 0
    for i, num in enumerate(nums):
        if target == num:
            res[idx] = i
            idx += 1
        if idx == k:
            break
    cnt = k
    for i in range(res[idx-1], len(nums)):
        if nums[i] == target:
            cnt += 1
            ran = random.randrange(cnt)
            if ran < k:
                res[ran] = i
    return res
```
## 三维形体投影面积
[三维形体投影面积](https://leetcode-cn.com/problems/projection-area-of-3d-shapes/)
```python
# 简单题
def projectionArea(self, grid: List[List[int]]) -> int:
    x, y, z = 0, 0, grid[0]
    for row in grid:
        y += max(row)
        for i, item in enumerate(row):
            if item != 0:
                x += 1
            if z[i] < item:
                z[i] = item
    return x + y + sum(z)
# 一行
# zip(*grid) 按列输出
# *返回tuple **返回字典
# https://baijiahao.baidu.com/s?id=1719090099795374109
def projectionArea(self, grid: List[List[int]]) -> int:
    return sum(sum(v > 0 for v in g) + max(g) for g in grid) + sum(max(g) for g in zip(*grid))
```
## 太平洋大西洋水流问题
[太平洋大西洋水流问题](https://leetcode-cn.com/problems/pacific-atlantic-water-flow/)
```python
class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        m, n = len(heights), len(heights[0])

        def search(starts):
            visited = set()

            def dfs(x, y):
                if (x, y) in visited:
                    return
                visited.add((x, y))
                for nx, ny in ((x, y - 1), (x, y + 1), (x - 1, y), (x + 1, y)):
                    if 0 <= nx < m and 0 <= ny < n and heights[nx][ny] >= heights[x][y]:
                        dfs(nx, ny)
            for x, y in starts:
                dfs(x, y)
            return visited
        # 从上左遍历
        pacific = [(0, i) for i in range(n)] + [(j, 0) for j in range(m)]
        # 从下右遍历
        atlantic = [(m-1, i) for i in range(n)] + [(j, n-1) for j in range(m-1)]
        return list(map(list, search(pacific) & search(atlantic)))
```
## 按奇偶排序数组
[按奇偶排序数组](https://leetcode-cn.com/problems/sort-array-by-parity/)
```python
# 双指针
def sortArrayByParity(nums: List[int]) -> List[int]:
    i, j = 0, len(nums)-1
    while i < j:
        if nums[i] % 2:
            t = nums[i]
            while nums[j] % 2 and i < j:
               j -= 1
            nums[i] = nums[j]
            nums[j] = t
        i += 1
    return nums
# 一行
def sortArrayByParity(nums: List[int]) -> List[int]:
    return sorted(nums, keys=lambda x: x%2!=0)
```
## 建立四叉树
[建立四叉树](https://leetcode-cn.com/problems/construct-quad-tree/)
```python
def construct(self, grid: List[List[int]]) -> 'Node':
    def dfs(r0: int, r1: int, c0: int,c1: int) -> 'Node':
        for i in range(r0, r1):
            for j in range(c0, c1):
                if grid[i][j] != grid[r0][c0]:
                    return Node(True, 
                    False, 
                    dfs(r0, r0+r1>>1, c0, c0+c1>>1),
                    dfs(r0, r0+r1>>1, c0+c1>>1, c1),
                    dfs(r0+r1>>1, r1, c0, c0+c1>>1),
                    dfs(r0+r1>>1, r1, c0+c1>>1, c1))
        return Node(grid[r0][c0], True)
    return dfs(0, len(grid), 0, len(grid[0]))
```
## 最小差值 I
[最小差值 I](https://leetcode-cn.com/problems/smallest-range-i/)
```python
def smallestRangeI(self, nums: List[int], k: int) -> int:
    return max(0, max(nums)-min(nums)-2*k)
```
