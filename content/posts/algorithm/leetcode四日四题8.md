---
title: (leetcode) 四日四题
date: 2022-04-13 13:04:48.387
updated: 2022-04-13 13:04:48.387
url: /archives/leetcode-si-ri-si-ti
categories: 
- algorithm
tags: 
---

## [到达终点](https://leetcode-cn.com/problems/reaching-points/)
```python
# 摘自评论
# https://leetcode-cn.com/problems/reaching-points/comments/85185
def reachingPoints(self, sx, sy, tx, ty):
    while tx > 0 and ty > 0:
        if tx == sx and ty == sy:
            return True
        if tx > ty:
            # tx - sx是目标与起始值在x的差距，我们需要一次减去n * ty达到快速逼近sx的目的
            # 差距除于ty可以得到差距里包含多少个ty即n*ty
            # 我太笨了
            tx -= ty * max((tx-sx)/ty, 1)
        else:
            ty -= tx * max((ty-sy)/tx, 1)
    return False
```
## [唯一摩尔斯密码词](https://leetcode-cn.com/problems/unique-morse-code-words/)
```python
def uniqueMorseRepresentations(self, words):
    Mose =[".-","-...","-.-.","-..",".","..-.","--.","....","..",
              ".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...",
              "-","..-","...-",".--","-..-","-.--","--.."]

    translate = []
    for word in words:
        strs = ''
        for c in word:
            idx = ord(c) - ord('a')
            strs += Mose[idx]
        translate.append(strs)
    count = Counter(translate)
    return len(count)
# 利用set元素不重复
class Solution(object):
    def uniqueMorseRepresentations(self, words):
        mos =[".-","-...","-.-.","-..",".","..-.","--.","....","..",
              ".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...",
              "-","..-","...-",".--","-..-","-.--","--.."]
        ans = set()
        for w in words:
              t = "".join([mos[ord(letter)-ord('a')] for letter in w])
              ans.add(t)
        return len(ans)
```
## [统计各位数字都不同的数字个数](https://leetcode-cn.com/problems/count-numbers-with-unique-digits/)
[Link](https://leetcode-cn.com/problems/count-numbers-with-unique-digits/solution/tong-ji-ge-wei-shu-zi-du-bu-tong-de-shu-iqbfn/1498651)
```
n=0，数字有{0} 1个。
n=1，数字有{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}  10个。
n=2，数字包括两部分之和，一部分为n=1的所有10个答案，另一部分为长度为2的新增数字。长度为2的新增数字可以在n=1的所有9个数字基础上进行拼接（0不能算）。例如：
从n=1的数字列表{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}中随便取出一个除0以外的数字（因为0不能作为起始数字！），我们取2好了。通过在2的尾巴处拼接一位数字可以得到新的合法数字有：
{20，21，23，24，25，26，27，28，29}，
可以看到，除了不能在尾巴处拼接一个2，0-9种一共有9个数字可以拿来拼接在尾巴处。新增答案为9个。同理，对于n=1数字列表{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}中的其他任意非0数也可以进行拼接操作，一共可以新增9*9个答案。
最终，n=2的合法数字，n=1时的答案 + 长度为2的数字个数（9*9个）= 10 + 81 = 91。
n=3时同理，只不过此时可以用拼接的数字减少为了8个，即前两位已经确定不一样，则第三位只能从10个数字选剩下8个
此时答案为10 + 9 * 9 + 9 * 9 * 8 = 739。
n=4时同理，只不过此时可以用拼接的数字减少为了7个，此时答案为10 + 9 * 9 + 9 * 9 * 8 + 9 * 9 * 8 * 7 = 5275。
通过归纳不难得到，假设 dp[i] 即 n = i时的答案，则动态转移方程为：
dp[i] = dp[i-1] + (dp[i-1] - dp[i-2])*(10-(i-1))
转移的初始条件为
dp[0] = 1
dp[1] = 10
```
```python
# 符合解释版
class Solution {
    public int countNumbersWithUniqueDigits(int n) {
        if (n == 0) return 1;
        int[] dp = new int[n+1];
        dp[0] = 1;
        dp[1] = 10;
        for (int i = 2; i <= n; i++){
            # dp[i-1] - dp[i-2]只留下9*9*...这一部分
            # 10-(i-1) 判断10个数中剩下几位可以不重复
            dp[i] = dp[i-1] + (dp[i-1] - dp[i-2])*(10-(i-1));
        }
        return dp[n];
    }
}
# 官方题解
class Solution:
    def countNumbersWithUniqueDigits(self, n: int) -> int:
        if n == 0:
            return 1
        if n == 1:
            return 10
        res, cur = 10, 9
        # 当n=2时，只需要9*9，循环一次
        # 当n=3时，只需要9*9+9*9*8，循环两次即n-1
        for i in range(n - 1):
            cur *= 9 - i
            res += cur
        return res
# 进阶做法
# https://leetcode-cn.com/problems/count-numbers-with-unique-digits/solution/by-ac_oier-6tfl/
```
## [写字符串需要的行数](https://leetcode-cn.com/problems/number-of-lines-to-write-string/)
```python
# 简单题重拳出击
def numberOfLines(self, widths, s):
    cnt = 0
    rows = 0
    for i in range(len(s)):
        cnt += widths[ord(s[i])-ord('a')]
        # 因为遇到这个案例
        # [3, 4, 10, 4, 8, 7, 3, 3, 4, 9, 8, 2, 9, 6, 2, 8, 4, 9, 9, 10, 2, 4, 9, 10, 8, 2]
        # "mqblbtpvicqhbrejb"
        # 实际上加不加无所谓
        if cnt == 100 and i == len(s)-1: break
        if cnt > 100:
            rows += 1
            cnt = widths[ord(s[i])-ord('a')]
    return [rows+1, cnt]
# 正解
def numberOfLines(widths, s):
    cnt = 0
    rows = 0
    for i in range(len(s)):
        cnt += widths[ord(s[i])-ord('a')]
        if cnt > 100:
            rows += 1
            # 大于100说明这个字符已经超出，需要放到下一行
            cnt = widths[ord(s[i])-ord('a')]
    return [rows+1, cnt]
```
