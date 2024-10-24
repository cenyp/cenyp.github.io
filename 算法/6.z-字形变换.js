/*
 * @lc app=leetcode.cn id=6 lang=javascript
 *
 * [6] Z 字形变换
 */

// @lc code=start
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
  if (numRows === 1) return s;

  let arr = new Array(numRows).fill(""); // 以行声明数组
  let i = 0;
  let direction = -1; // 控制方向，-1向下，1向上

  /*
    P   A   H   N
    A P L S I I G
    Y   I   R
  */
  for (let char of s) {
    arr[i] += char; // 将字符添加到对应行
    if (i === 0 || i === numRows - 1) {
      direction = -direction; // 切换方向，在P、Y、A、I处切换
    }
    i += direction; // 更新行数
  }

  return arr.join(""); // 使用 join 函数合并
};

// @lc code=end

/*
将一个给定字符串 s 根据给定的行数 numRows ，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 "PAYPALISHIRING" 行数为 3 时，排列如下：

P   A   H   N
A P L S I I G
Y   I   R
之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："PAHNAPLSIIGYIR"。

请你实现这个将字符串进行指定行数变换的函数：

string convert(string s, int numRows);
 

示例 1：
输入：s = "PAYPALISHIRING", numRows = 3
输出："PAHNAPLSIIGYIR"

示例 2：
输入：s = "PAYPALISHIRING", numRows = 4
输出："PINALSIGYAHRPI"
解释：
P     I    N
A   L S  I G
Y A   H R
P     I

示例 3：
输入：s = "A", numRows = 1
输出："A"
*/
