/*
 * @lc app=leetcode.cn id=7 lang=javascript
 *
 * [7] 整数反转
 */

// @lc code=start
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
  const num = parseInt(
    `${x < 0 ? "-" : ""}${Math.abs(x).toString().split("").reverse().join("")}}`
  );
  // 处理范围 [−231,  231 − 1]
  if (num > 2 ** 31 - 1 || num < (-2) ** 31) {
    return 0;
  }
  return num;
};
// @lc code=end

/**
给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。

如果反转后整数超过 32 位的有符号整数的范围 [−2^31,  2^31 − 1] ，就返回 0。

假设环境不允许存储 64 位整数（有符号或无符号）。
 

示例 1：
输入：x = 123
输出：321

示例 2：
输入：x = -123
输出：-321

示例 3：
输入：x = 120
输出：21

示例 4：
输入：x = 0
输出：0

 */
