---
title: (leetcode) 一周七题
date: 2022-04-24 14:27:55.812
updated: 2022-04-24 14:28:45.165
url: /archives/leetcode-week-1
categories: 
- other
tags: 
- Python
- LeetCode
---

## 最常见的单词
[最常见的单词](https://leetcode-cn.com/problems/most-common-word/)
```python
# 自己写的水代码
def mostCommonWord(paragraph, banned):
    s, ss = '', []
    # 将字符串转成小写字母
    paragraph = paragraph.lower()
    for i in range(len(banned)):
        banned[i] = banned[i].lower()
    # 判断是否是最后一个字符，最后一个字符没有空格或其他符号
    flag = 1
    for i in paragraph:
        if 'a' <= i <= 'z':
            flag = 1
            s += i
            continue
        flag = 0
        # 将bob,中','造成的''删除
        if s:
            ss.append(s)
        s = ''
    # 最后一个字符串加入数组
    if flag:
        ss.append(s)
    c = Counter(ss)
    for i in range(len(banned) + 1):
        # 获取最大值
        ans = max(c.keys(), key=c.get)
        if ans in banned:
            del c[ans]
        else:
            return ans
# 官解
def mostCommonWord(paragraph, banned):
    ban = set(banned)
    freq = Counter()
    word, n = "", len(paragraph)
    # 获取字符串模板，'Bob like Joe'=>[Bob, like, Joe]
    # n+1 排除了单词结尾的情况
    for i in range(n + 1):
        # i<n 使得paragraph[i]不会越界
        if i < n and paragraph[i].isalpha():
            word += paragraph[i].lower()
        elif word:
            if word not in ban:
                freq[word] += 1
            word = ""
    maxFreq = max(freq.values())
    return next(word for word, f in freq.items() if f == maxFreq)
# 一行
# https://leetcode-cn.com/problems/most-common-word/solution/by-jam007-3la9/
def mostCommonWord(self, paragraph: str, banned: List[str]) -> str:
        return Counter(w for w in re.findall(r'\w+', paragraph.lower()) if w not in set(banned)).most_common(1)[0][0]
```
## 字典序排数
[字典序排数](https://leetcode-cn.com/problems/lexicographical-numbers/)
```python
# 官解
def lexicalOrder(n: int) -> List[int]:
    ans = [0] * n
    num = 1
    for i in range(n):
        ans[i] = num
        if num * 10 <= n:  # 保存1 100 1000
            num *= 10
        else:
            # num % 10 = 9是判断尾数是否到头，因为再加1则变为10，到头则使num变为9
            # num + 1 > n：+1是为了后面的num+=1，并且判断num是不是超过了n，超过则使num//10
            while num % 10 == 9 or num + 1 > n:
                num //= 10  # 使num复原
            num += 1
    return ans
# dfs
# https://leetcode-cn.com/problems/lexicographical-numbers/solution/by-ac_oier-ktn7/
def lexicalOrder(n: int) -> List[int]:
    ans = []
    def dfs(num, limit):
        if num > limit: return
        ans.append(num)
        for i in range(10):
            dfs(num * 10 + i, limit)

    for i in range(1, 10):
        dfs(i, n)
    return ans
# 库函数
def lexicalOrder(self, n: int) -> List[int]:
    return sorted(range(1,n+1),key=str)
```
## 字符的最短距离
[字符的最短距离](https://leetcode-cn.com/problems/shortest-distance-to-a-character/)
```python
# 官解的-n、2*n 秒啊
def shortestToChar(s: str, c: str) -> List[int]:
    ans = [0] * len(s)
    idx = -1
    for i in range(len(s)):
        if s[i] == c:
            idx = i
        if idx >= 0:
            ans[i] = abs(i-idx)
    print(ans)
    idx = -1
    for i in range(len(s)-1,-1, -1):
        if s[i] == c:
            idx = i
        if ans[i] == 0:
            ans[i] = abs(i-idx)
        if idx >= 0:
            ans[i] = min(ans[i], abs(i-idx))
    return ans
# 官解
def shortestToChar(s: str, c: str) -> List[int]:
    n = len(s)
    ans = [0] * n
    # 使i-idx 变为最大
    idx = -n
    for i in range(n):
        if s[i] == c:
            idx = i
        ans[i] = i - idx
    print(ans)
    # 同理
    idx = 2 * n
    for i in range(n - 1, -1, -1):
        if s[i] == c:
            idx = i
        ans[i] = min(ans[i], idx - i)
    return ans
# bfs
# https://leetcode-cn.com/problems/shortest-distance-to-a-character/solution/-by-yu-niang-niang-4qgd/
def shortestToChar(s: str, c: str) -> List[int]:
    q = queue.Queue()
    n = len(s)
    ans = [-1] * n
    for i, ch in enumerate(s):
        if ch == c:
            ans[i] = 0
            q.put(i)
    while not q.empty():
        idx = q.get()
        # idx != 0 使其不越界
        if idx != 0 and ans[idx-1] == -1:
            q.put(idx-1)
            ans[idx-1] = ans[idx] - ans[idx-1]
        # idx+1 < n 使其不越界
        if idx+1 < n and ans[idx+1] == -1:
            q.put(idx+1)
            ans[idx+1] = ans[idx] - ans[idx+1]
    return ans
```
## 文件的最长绝对路径
[文件的最长绝对路径](https://leetcode-cn.com/problems/longest-absolute-file-path/)
```python
''' 解题思路 本题为求解文件夹路径的最大值，其中会添加 /
1. 用 depth_length_map 保留每层路径的长度， input.split('\n') 切分为每行分析每行长度与文件
2. line.count('\t') 的个数来判断是第几层
3. line.count('.') 的个数判断是否有文件，有文件获取当前最长路径值
4. 每层都要添加depth个 / ， 长度需要修改
'''
# 很妙的解法
# https://leetcode-cn.com/problems/longest-absolute-file-path/solution/wen-jian-de-zui-chang-jue-dui-lu-jing-by-fi0r/1516846
def lengthLongestPath(input: str) -> int:
    res = 0
    # -1层为了根目录
    depth_length = {-1: 0}
    s = input.split('\n')
    for word in s:
        depth = word.count('\t')
        # 覆盖之前的文件长度，计算完.ext前面的长度后就无用了。
        # +上一层的文件夹长度+当前长度-字符'\t'
        depth_length[depth] = depth_length[depth - 1] + len(word) - depth
        # 当遇到.ext文件计算长度
        if word.count('.'):
            # +depth是为了每层都要添加depth个 /
            res = max(res, depth_length[depth] + depth)
    return res
# 可以输出字符串
def lengthLongestPath(input: str) -> int:
    ans, i, n = '', 0, len(input)
    map = {}
    while i < n:
        # 每次重置文件夹深度
        level = 0
        # 计算深度
        while i < n and input[i] == '\t':
            level += 1
            i += 1
        # 计算当前字符（不包括'\n''\t'）
        j = i
        isDir = True
        while j < n and input[j] != '\n':
            if input[j] == '.':
                isDir = False
            j += 1
        # 截取当前字符串
        cur = input[i:j]
        # 获取以前的路径
        prev = map.get(level - 1)
        # 拼接路径
        path = cur if prev is None else prev + '/' + cur
        if isDir:
            map[level] = path
        # elif 防止非文件、文件夹
        elif ans == '' or len(path) > len(ans):
            ans = path
        i = j + 1
    return 0 if len(ans) == 0 else len(ans)
```
## 山羊拉丁文
[山羊拉丁文](https://leetcode-cn.com/problems/goat-latin/)
```python
# 太离谱了，除了变量命名不一样，他的运行比我快
# 复制成他的，速度快了，莫非是代码格式化的问题
# 36ms
def toGoatLatin(self, sentence: str) -> str:
        l = ['a','e','i','o','u','A','E','I','O','U']
        words = sentence.split(' ')
        for i, word in enumerate(words):
            if word[0] in l:
                words[i] = word + 'ma' + 'a'*(i+1)
            else:
                words[i] = word[1:] + word[0] + 'ma' + 'a' * (i+1)
        return ' '.join(words)
# 20ms
def toGoatLatin(self, sentence: str) -> str:
        l=['a','e','i','o','u','A','E','I','O','U']
        words=sentence.split(' ')
        for i,word in enumerate(words):
            if word[0] in l:
                words[i]=word+'ma'+'a'*(i+1)
            else:
                words[i]=word[1:]+word[0]+'ma'+'a'*(i+1)
        return ' '.join(words)
```
## 旋转函数
[旋转函数](https://leetcode-cn.com/problems/rotate-function/)
```python
# 想不出来
# 来自宫水三叶
def maxRotateFunction(nums):
    num, n = 0, len(nums)
    s = [0] * (2 * n + 2)
    for i in range(1, 2 * n + 1):
        s[i] = s[i - 1] + nums[(i - 1) % n]
    ans = 0
    for i in range(1, n):
        ans += nums[i] * i
    cur = ans
    for i in range(n + 1, 2 * n):
        cur += nums[(i - 1) % n] * (n - 1)
        cur -= s[i-1] - s[i-n]
        if cur > ans:
            ans = cur
    return ans
# 官解
# F(0)与F(1)相差一个numSum, 并且(n-1)*nums[n-1]变为0 所以-n*nums[n-1]
def maxRotateFunction(nums):
    numSum = sum(nums)
    n = len(nums)
    f = 0
    for i in range(n):
        f += nums[i]*i
    res = f
    for i in range(n):
        # 每一次求新f，其旧f最后一个必为0
        f = f + numSum - n*nums[n-i-1]
        res = max(f, res)
    return res
# 一行
# 摘自提交记录
def maxRotateFunction(self, nums: List[int]) -> int:
    n, s = len(nums), sum(nums)
    return max(accumulate(reversed(nums), lambda a,b: a+s-n*b, initial=sum(i * nums[i] for i in range(n))))
# 双百？
# https://leetcode-cn.com/problems/rotate-function/solution/by-jam007-wyqt/
def maxRotateFunction(self, nums: List[int]) -> int:
    res = cur = sum(idx * num for idx,num in enumerate(nums))
    total = sum(nums)
    n = len(nums)
    while nums:
        cur += total - nums.pop() * n
        res = cur if cur > res else res
    return res


```
## 安装栅栏
[安装栅栏](https://leetcode-cn.com/problems/erect-the-fence/)
困难题 pass
## 二进制间距
[二进制间距](https://leetcode-cn.com/problems/binary-gap/)
```python
# 好耶 ac
def binaryGap(self, n: int) -> int:
    s = bin(n)
    s = s[2:]
    right = left = s.find('1')
    ans = 0
    while left < len(s):
        if s[left] == '1':
            if ans < left - right:
                ans = left - right
            right = left
        left += 1
    return ans
# 官解
def binaryGap(self, n: int) -> int:
    last, ans, i = -1, 0, 0
    while n:
        if n & 1:
            if last != -1:
                ans = max(ans, i - last)
            last = i
        n >>= 1
        i += 1
    return ans
```
