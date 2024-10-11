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

# 异步并发控制
```js
/**
 * 执行顺序：
 * 1. 用 map 方法遍历数组，将每个 Promise 用 enqueue 包装一下，压入 executing 数组
 * 2. enqueue 方法，将 Promise 包装一下，执行完删除数组的自身
 * 2. 当 executing 数组长度超过 limit 时，用 Promise.race 方法，将 清理掉一个 Promise，然后重新执行 enqueue 方法，压入新的 Promise。注意 executing.length >= limit 判断不一定会触发，只要 Promise 执行够快
 * 3. 返回 Promise.all 方法，等待所有 Promise 执行完毕
 */
/**
 * 
 * @param { Promise数组} promiseFactories 
 * @param { 并发数量 } limit 
 * @returns 
 */
function limitedConcurrency(promiseFactories, limit) {
    // 异步队列数组
    const executing = [];

    
    const enqueue = async (promiseFactory) => {
        // 套一层，执行完删除数组的自身
        const promise = promiseFactory().then(result => {
            executing.splice(executing.indexOf(promise), 1);
            return result;
        });
        // 加入数组
        executing.push(promise);
        return promise;
    };

    const promises = promiseFactories.map(factory => {
        // 数组满了，利用Promise.race()方法，控制并发数量
        if (executing.length >= limit) {
            return Promise.race(executing).then(() => enqueue(factory));
        }
        return enqueue(factory);
    });

    return Promise.all(promises);
}
```

# object 与 Map
一般说 object 是无序的，Map 是有序的；但是浏览器一般会做优化，如下
```js
let obj = {}
obj.b = 2
obj.a = 1
console.log(Object.keys(obj)) // (2) ['b', 'a']
```

# 轮播动画/循环动画
如轮播图，可以抽象成三个图片做循环动画，如：初始为 [1,2,3]
1. 方案一：动画实现。如向右滚动，1=>2，2=>3，3=>1，改变 css 定位，利用 transition 属性/vue transition 组件，分别执行对应的过渡动画，做 translateX 偏移。*不适合拖拽移动，要自动播放*
2. 方案二：图片重置。扩充原数组（为了增加流畅性）为 [3,1,2,3,1]，在滚动到 第一个 3 /最后一个 1 时，重置数组。如 currentIndex 为 第一个 ，则重置 currentIndex 指向到最后一个 3，可以让用户感觉是循环滚动。*适合拖拽移动，要有停顿时间来重置 current *

场景：30 个数据循环播放，只显示 10 个数据。对于单个数据来说，是从下到上的循环移动（位置 11 到 0 的移动），设置 12 个 DOM，用定时器让她们实现向上移动效果，当到达 0 位置时，重置到 11 位置，实现循环效果。

# var 作用域
var 的作用域是函数作用域或全局作用域（扩展：js 作用域：全局/局部【函数/块（let/const）】/模块【es6模块/commonjs】）

如果不同文件同时用 var 声明同一变量，在使用时会冲突，避免方法如下：
1. 使用 ES6 模块（import/export）或 CommonJS 模块（require/module.exports）来避免使用全局变量。这样每个模块都有自己的作用域
2.使用 IIFE (立即调用函数表达式)
```js
(function() {
    var privateVar = 'I am private';
})();
```

# 组件和模块
模块 (Module)
- 模块是将代码组织成独立单位的方式。每个模块可以导出特定的变量、函数或类，并在其他模块中导入使用。
- 特点：
  + 作用域：模块具有自己的作用域，避免了全局命名冲突。
  + 导入导出：通过 export 和 import 语法来共享功能。
  + 重用性：模块使得代码更易于重用和维护。

组件 (Component)
- 组件通常用于构建用户界面的独立单元，尤其是在现代框架（如 React、Vue、Angular）中。组件可以包含模板、样式和逻辑。
- 特点：
  + 单一性：组件通常包含自己的状态和行为，使得 UI 的每个部分都可以独立管理。各个组件相对独立
  + 复用性：组件可以在不同的地方被复用，增强了代码的可维护性
  + 可扩展性：如 vue 的插槽，或者是通过参数传递
  + 可读性/可维护性：做好文档/注释工作，避免不可读/复杂代码

# 监听 localStorage 数据变化
```js
// 这种方法只适用于跨页签的 LocalStorage 修改，在同一页签下无法触发该事件
window.addEventListener("storage", (event) => {      
  ...
});
```
解决方案：
1. 轮询存储数据
2. 封装方法，建立发布订阅模式监听数据

# 错误捕捉
```js
// 监听同步代码。无法处理异步代码
try {
    
} catch (error) {
    
}

new Promise((res, rej) => {})
    .then(
        () => {
            // 处理上一个成功的回调
        },
        () => {
            // 处理上一个失败的回调
        }
    )
    .catch(() => {
        // 处理所有失败的回调
    })
```

# onfocus 事件
当标签页面切换/浏览器隐藏显示，会触发 focus 事件

# Reflect 和 object
1. 现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只部署在 Reflect 对象上。
2. 在使用部分方法是，不会报错，会返回 false 
```js
const obj = {};

// 定义一个不可写且不可配置的属性
Object.defineProperty(obj, "name", {
  value: "Alice",
  writable: false, // 不可写
  configurable: false, // 不可配置
});

// 读取属性值
console.log(obj.name); // "Alice"

obj.name = "Bob"; // 尝试修改属性值（不会抛出错误，但值不会改变）
console.log(obj.name); // 仍然是 "Alice"

// Reflect.defineProperty() 方法不会报错
console.log(Reflect.defineProperty(obj, "name", { value: "Charlie" })); // false

// 尝试修改属性描述符
try {
  Object.defineProperty(obj, "name", { value: "Charlie" });
} catch (error) {
  console.error(error); // TypeError: Cannot redefine property: name
}
```

为什么Vue3要在Proxy中使用Reflect
1. 保持正确的 this 绑定
```js

```

2.
```js
const handler = {
  set(target, property, value, receiver) {
    console.log(`Setting ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  },
};

const array = new Proxy([], handler);
array.push(1); // 会同时触发对 '0' 和 'length' 的设置
// Setting 0 = 1
// Setting length = 1
```



