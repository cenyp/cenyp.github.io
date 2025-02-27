/*
 * @lc app=leetcode.cn id=2 lang=javascript
 *
 * [2] 两数相加
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  let dummyHead = new ListNode(0);
  let current = dummyHead;
  let carry = 0;

  while (l1 !== null || l2 !== null || carry > 0) {
    let sum = carry;
    if (l1 !== null) {
      sum += l1.val;
      l1 = l1.next;
    }
    if (l2 !== null) {
      sum += l2.val;
      l2 = l2.next;
    }

    carry = Math.floor(sum / 10); // 计算升位，用于下一级相加
    current.next = new ListNode(sum % 10); // 计算当前位
    current = current.next; // 链表指针后移
  }

  return dummyHead.next;
};
// 利用bigint处理大数相加
// var addTwoNumbers = function (l1, l2) {
//   let num1 = "";
//   let num2 = "";

//   while (l1) {
//     num1 = l1.val + num1;
//     l1 = l1.next;
//   }

//   while (l2) {
//     num2 = l2.val + num2;
//     l2 = l2.next;
//   }

//   const sum = BigInt(num1) + BigInt(num2);
//   const result = sum
//     .toString()
//     .split("")
//     .reverse()
//     .map((digit) => new ListNode(Number(digit)));

//   for (let i = 0; i < result.length - 1; i++) {
//     result[i].next = result[i + 1];
//   }

//   return result[0];
// };

// @lc code=end

/**
给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。

请你将两个数相加，并以相同形式返回一个表示和的链表。

你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

 

示例 1：
输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807

示例 2：
输入：l1 = [0], l2 = [0]
输出：[0]

示例 3：
输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
输出：[8,9,9,9,0,0,0,1]
 */
