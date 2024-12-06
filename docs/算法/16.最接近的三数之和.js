/*
 * @lc app=leetcode.cn id=16 lang=javascript
 *
 * [16] 最接近的三数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function (nums, target) {
  nums.sort((a, b) => a - b); // 对数组进行升序排序
  let closestSum = nums[0] + nums[1] + nums[2]; // 初始化最接近的和
  for (let i = 0; i < nums.length - 2; i++) {
    // 如果当前数字与前一个数字相同，跳过以避免重复计算
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      let sum = nums[i] + nums[left] + nums[right];

      // 更新最接近的和
      if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
        closestSum = sum;
      }

      // 移动指针向中间靠拢以逼近目标
      if (sum < target) {
        left++;
      } else if (sum > target) {
        right--;
      } else {
        return sum; // 找到精确匹配，直接返回
      }
    }
  }

  return closestSum; // 返回最接近的和
};

// @lc code=end

/**
给你一个长度为 n 的整数数组 nums 和 一个目标值 target。请你从 nums 中选出三个整数，使它们的和与 target 最接近。
返回这三个数的和。
假定每组输入只存在恰好一个解。 

示例 1：
输入：nums = [-1,2,1,-4], target = 1
输出：2
解释：与 target 最接近的和是 2 (-1 + 2 + 1 = 2)。

示例 2：
输入：nums = [0,0,0], target = 1
输出：0
解释：与 target 最接近的和是 0（0 + 0 + 0 = 0）。

 */
