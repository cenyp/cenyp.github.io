# DocumentFragment
它被作为一个轻量版的 Document 使用，就像标准的 document 一样，存储由节点（nodes）组成的文档结构。与 document 相比，最大的区别是它不是真实 DOM 树的一部分，它的变化不会触发 DOM 树的重新渲染，且不会对性能产生影响。

https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment

# IntersectionObserver
创建一个新的 IntersectionObserver 对象，当其监听到目标元素的可见部分（的比例）超过了一个或多个阈值（threshold）时，会执行指定的回调函数。

https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver

# 跨标签页/窗口通讯
1. 缓存：localstorage等等
2. serviceWorkers 利用 Service Workers，各个标签页可以通过 clients.matchAll() 方法找到所有其他客户端（如打开的标签页），然后使用 postMessage 发送消息
3. BroadcastChannel 是一种在相同源的不同浏览器上下文之间实现简单高效通信的方法。之前很火的【跨窗口量子纠缠粒子效果】就是这个原理
4. SharedWorker 提供了一种更传统的跨文档通信机制，在不同文档间共享状态和数据。你需要创建一个 SharedWorker 对象，并在所有的文档里监听来自该 worker 的消息。
5. window.postMessage 是Web API中的一个方法，它允许来自不同源的文档安全地相互通信，通过调用 postMessage() 方法并指定目标窗口的origin，可以将消息发送到其他标签页，并通过监听message事件来接收消息。

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

# js 类型判断
```ts
export const isArray = Array.isArray
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === '[object Date]'
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
```
