/*
 * @lc app=leetcode.cn id=5 lang=javascript
 *
 * [5] 最长回文子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  if (s.length < 2) return s; // 边界条件

  let start = 0; // 回文起始位置
  let maxLen = 1; // 最长回文长度

  // 中心扩展函数
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        // 如果找到更长的回文
        start = left; // 更新起始位置
        maxLen = right - left + 1; // 更新最大长度
      }
      left--; // 向左扩展
      right++; // 向右扩展
    }
  }

  // 遍历每个字符作为中心
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i); // 单字符中心
    expandAroundCenter(i, i + 1); // 双字符中心
  }

  // substring 提取字符串中两个指定的索引号之间的字符。
  return s.substring(start, start + maxLen); // 返回最长回文子串
};

// @lc code=end

/*
给你一个字符串 s，找到 s 中最长的 回文 子串。

示例 1：
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案

示例 2：
输入：s = "cbbd"
输出："bb"

*/
