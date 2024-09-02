# DocumentFragment
它被作为一个轻量版的 Document 使用，就像标准的 document 一样，存储由节点（nodes）组成的文档结构。与 document 相比，最大的区别是它不是真实 DOM 树的一部分，它的变化不会触发 DOM 树的重新渲染，且不会对性能产生影响。

https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment

# 跨标签页/窗口通讯
window.open 也能跨窗口传递参数、声明 window[xxx] = xxx 或者是 url 上处理

# 执行环境
JavaScript中主要存在三种执行环境：
1. 全局执行环境
2. 函数执行环境
3. eval执行环境（可以看看下面不可控的例子）

# eval函数
计算 JavaScript 字符串，并把它作为脚本代码来执行。
```js
    eval('1+1') // 2
```
这个eval非常危险，常用于攻击、侵入网站；可以通过设置一下头部来限制；意思是限制各种 src 资源的加载必须通过 https
```html
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*; img-src https://*; child-src 'none';">
```

不建议使用，会导致代码不可控
```js
var geval=eval;                //使用别名调用evla将是全局eval
var x="global",y="global";    //两个全局变量
function f(){                //函数内执行的是局部eval
    var x="local";            //定义局部变量
    eval("x += ' chenged';");//直接使用eval改变的局部变量的值
    return x;                //返回更改后的局部变量
}
function g(){                //这个函数内执行了全局eval
    var y="local";
    geval("y += ' changed';"); //直接调用改变了全局变量的值
    return y;
}
console.log(f(),x);            //改变了布局变了，输出 “local changed global”
console.log(g(),y);            //改变了全局变量，输出  “local global changed”
```

# 事件循环进阶
```js 
async function async1() {
  await async2();
  console.log("async1");
}
async function async2() {
  console.log("async2");
  Promise.resolve().then(() => { // 增加 return 在最前面 async1 会晚执行两个 then
    console.log("async2-return");
    // console.log("async1"); 相当于在这里
  });
}
async1();
new Promise((resolve) => {
  console.log("promise");
  resolve();
})
  .then(() => {
    console.log("promise-1");
  })
  .then(() => {
    console.log("promise-2");
  })
  .then(() => {
    console.log("promise-3");
  })
  .then(() => {
    console.log("promise-4");
  })
  .then(() => {
    console.log("promise-5");
  });
```
执行结果为：
async2
promise      
async2-return
async1
promise-1
promise-2
promise-3
promise-4
promise-5
