/*
 * @lc app=leetcode.cn id=3 lang=javascript
 *
 * [3] 无重复字符的最长子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  let max = 0;
  let arr = [];
  for (let i = 0; i < s.length; i++) {
    if (arr.indexOf(s[i]) === -1) {
      arr.push(s[i]); // 没有重复就添加
    } else {
      max = Math.max(max, arr.length); // 有重复就计算最大值
      arr = arr.slice(arr.indexOf(s[i]) + 1); // 截取重复字符后面的字符 如：abcabcbb 截取到第二个a，剩下bc
      arr.push(s[i]); // 添加重复的字符，bca
    }
  }
  return Math.max(max, arr.length);
};
// @lc code=end
/**
给定一个字符串 s ，请你找出其中不含有重复字符的 最长 子串 的长度。

示例 1:
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3

示例 2:
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1

示例 3:
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
 */
