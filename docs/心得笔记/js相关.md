# JavaScript

## DocumentFragment

它被作为一个轻量版的 `Document` 使用，就像标准的 `document` 一样，存储由节点 `nodes` 组成的文档结构。与 `document` 相比，最大的区别是它不是真实 `DOM` 树的一部分，它的变化不会触发 `DOM` 树的重新渲染，且不会对性能产生影响。

参考链接：[MDN DocumentFragment](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment)

## IntersectionObserver

创建一个新的 `IntersectionObserver` 对象，当其监听到目标元素的可见部分（的比例）超过了一个或多个阈值 `threshold` 时，会执行指定的回调函数。

参考链接：

[阮一峰](https://ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)

[掘金 IntersectionObserver](https://juejin.cn/post/7148038337318617125)

[MDN IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver)

### 目录滚动跟随

```js
// 滚动监听
function listenScroll() {
    // 停止监听滚动事件
    if (listenScrollTimer) listenScrollTimer.disconnect()

    // 存储所有监听元素，方便在 DOM 消失时判断选中状态
    // 大数据情况下，可以用别的方式处理
    let doms = [] 

    const observer = new IntersectionObserver(
        entries => {
            if (!doms?.length) { // 初始化会先触发一次，返回全部监听元素
                doms = entries
            } else {
                // 更新监听元素
                for (const entry of entries) {
                    doms.splice(
                        doms.findIndex(item => item.target?.dataset?.parentid === entry.target?.dataset?.parentid),
                        1,
                        entry
                    )
                }
            }

            // 获取第一个可见元素
            const dom = doms.find(item => item.intersectionRatio > 0.1)
            if (dom) activeCategory.value = Number(dom.target?.dataset?.parentid?.split('-')[0])
        },
        {
            // warn 要设置 >0 不然 intersectionRatio 会存在为 0 的情况，不好处理，同时避免频繁触发
            threshold: 0.1, 
        }
    )

    // 监听 DOM，parentid 写在目录对应的整个 DOM 上
    document.querySelectorAll('div[data-parentid]')?.forEach(item => {
        observer.observe(item)
    })

    // 暴露方法，方便取消监听
    return observer
}

// 点击左边目录滚动
document.querySelector(`div[data-parentid^="${category.id}"]`)?.scrollIntoView({
    // smooth 滚动时，会存在部分 dom 显示隐藏不会触发事件，同时事件频繁触发，存在闪烁，加之无法控制滚动动画时间
    // 可以使用 js 控制滚动动画时间来限制监听事件的触发，同时可以控制滚动到指定位置
    // behavior: 'smooth',
})
```

## 跨标签页/窗口通讯

1. 缓存：`localstorage` 等等
2. `serviceWorkers` 利用 `Service Workers`，各个标签页可以通过 `clients.matchAll()` 方法找到所有其他客户端（如打开的标签页），然后使用 `postMessage` 发送消息
3. `BroadcastChannel` 是一种在相同源的不同浏览器上下文之间实现简单高效通信的方法。之前很火的【跨窗口量子纠缠粒子效果】就是这个原理
4. `SharedWorker` 提供了一种更传统的跨文档通信机制，在不同文档间共享状态和数据。你需要创建一个 `SharedWorker` 对象，并在所有的文档里监听来自该 worker 的消息。
5. `window.postMessage` 是 `Web API` 中的一个方法，它允许来自不同源的文档安全地相互通信，通过调用 `postMessage()` 方法并指定目标窗口的 `origin`，可以将消息发送到其他标签页，并通过监听 `message` 事件来接收消息。

`window.open` 也能跨窗口传递参数、声明 window[xxx] = xxx 或者是 url 上处理

## 执行环境

`JavaScript` 中主要存在三种执行环境：

1. 全局执行环境
2. 函数执行环境
3. eval执行环境（可以看看下面不可控的例子）

## eval函数

计算 `JavaScript` 字符串，并把它作为脚本代码来执行。

```js
  eval('1+1') // 2
```

这个 `eval` 非常危险，常用于攻击、侵入网站；可以通过设置一下头部来限制；意思是限制各种 `src` 资源的加载必须通过 `https`

```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*; img-src https://*; child-src 'none';">
```

不建议使用，会导致代码不可控

```js
var gEval = eval;                //使用别名调用 eval 将是全局eval
var x="global",y="global";    //两个全局变量
function f(){                //函数内执行的是局部eval
    var x="local";            //定义局部变量
    eval("x += ' changed';");//直接使用eval改变的局部变量的值
    return x;                //返回更改后的局部变量
}
function g(){                //这个函数内执行了全局eval
    var y="local";
    gEval("y += ' changed';"); //直接调用改变了全局变量的值
    return y;
}
console.log(f(),x);            //改变了布局变了，输出 “local changed global”
console.log(g(),y);            //改变了全局变量，输出  “local global changed”
```

## 事件循环进阶

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

- async2
- promise
- async2-return
- async1
- promise-1
- promise-2
- promise-3
- promise-4
- promise-5

## js 类型判断

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

## 异步并发控制

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

## object 与 Map

网上很多观点obj的插入是会自动排序的；其实这个是分情况的：

- key是数字/伪数字时，是会自动排序的
- key是字符串时，是不会自动排序的

一般说 `object` 是无序的，`Map` 是有序的；但是浏览器一般会做优化，如下

```js
let obj = {}
obj.b = 2
obj.a = 1
console.log(Object.keys(obj)) // (2) ['b', 'a']
```

## 轮播动画/循环动画

如轮播图，可以抽象成三个图片做循环动画，如：初始为 `[1,2,3]`

1. 方案一：动画实现。如向右滚动，`1=>2`，`2=>3`，`3=>1`，改变 `css` 定位，利用 `transition` 属性，或者是 `vue transition` 组件，分别执行对应的过渡动画，做 `translateX` 偏移。*不适合拖拽移动，要自动播放*
2. 方案二：图片重置。扩充原数组（为了增加流畅性）为 `[3,1,2,3,1]`，在滚动到 第一个 3 或者最后一个 1 时，重置数组。如 `currentIndex` 为 第一个 ，则重置 `currentIndex` 指向到最后一个 3，可以让用户感觉是循环滚动。*适合拖拽移动，要有停顿时间来重置 `current`*

场景：30 个数据循环播放，只显示 10 个数据。对于单个数据来说，是从下到上的循环移动（位置 11 到 0 的移动），设置 12 个 `DOM`，用定时器让她们实现向上移动效果，当到达 0 位置时，重置到 11 位置，实现循环效果。

## var 作用域

`var` 的作用域是函数作用域或全局作用域（扩展：`js` 作用域：`全局`/`局部(函数/块(let/const))`/`模块(es6模块/commonjs)`）

如果不同文件同时用 `var` 声明同一变量，在使用时会冲突，避免方法如下：

1. 使用 `ES6` 模块 `import/export` 或 `CommonJS` 模块 `require/module.exports` 来避免使用全局变量。这样每个模块都有自己的作用域
2.使用 `IIFE` (立即调用函数表达式)

```js
(function() {
    var privateVar = 'I am private';
})();
```

## 组件和模块

模块 `Module`

- 模块是将代码组织成独立单位的方式。每个模块可以导出特定的变量、函数或类，并在其他模块中导入使用。
- 特点：
  - 作用域：模块具有自己的作用域，避免了全局命名冲突。
  - 导入导出：通过 `export` 和 `import` 语法来共享功能。
  - 重用性：模块使得代码更易于重用和维护。

组件 `Component`

- 组件通常用于构建用户界面的独立单元，尤其是在现代框架（如 `React、Vue、Angular`）中。组件可以包含模板、样式和逻辑。
- 特点：
  - 单一性：组件通常包含自己的状态和行为，使得 UI 的每个部分都可以独立管理。各个组件相对独立
  - 复用性：组件可以在不同的地方被复用，增强了代码的可维护性
  - 可扩展性：如 `vue` 的插槽，或者是通过参数传递
  - 可读性/可维护性：做好文档/注释工作，避免不可读/复杂代码

## 监听 localStorage 数据变化

```js
// 这种方法只适用于跨页签的 LocalStorage 修改，在同一页签下无法触发该事件
window.addEventListener("storage", (event) => {      
  ...
});
```

解决方案：

1. 轮询存储数据
2. 封装方法，建立发布订阅模式监听数据

## 错误捕捉

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

## onfocus 事件

当标签页面切换/浏览器隐藏显示，会触发 `focus` 事件

## Reflect 和 object

1. 现阶段，某些方法同时在 `Object` 和 `Reflect` 对象上部署，未来的新方法将只部署在 `Reflect` 对象上。
2. 在使用部分方法是，不会报错，会返回 `false`

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

为什么 `Vue3` 要在 `Proxy` 中使用 `Reflect`

1. 保持正确的 `this` 绑定，不是指向 `Proxy` 而是 `target`

```js
const person = {
  name: '张三',
  get Fullname() {
    console.log(this); // { name: '李四' }
    return this.name;
  },
}
let personProxy = new Proxy(person, {
  get(target, key, receiver) {
    return Reflect.get(target, key) // 这样子打印的就是张三
    //相当于 return target[key]

    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
})

const p1 = {
  __proto__: personProxy,
  name: '李四'
}

console.log(p1.Fullname) // 李四
```

## 文件预览

`https://view.officeapps.live.com/op/view.aspx?src=`

## promise

### all vs race vs allSettled

#### promise.all

`all` 当有 `reject` 返回时，`all` 就是 `reject` 状态，返回第一个 `reject` 的值。但是数组中的异步依旧会执行，不管整体状态如何

```js
const promise1 = new Promise((resolve, reject) => {
    console.log('Promise 1');
    resolve('Promise 1 resolve')
})
const promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('Promise 2');
        reject('Promise 2 reject')
    })
})

Promise.all([promise1, promise2]).then((res) => {
    console.log('then',res)
}).catch((res) => {
    console.log('catch',res) 
})
/**
Promise 1
Promise 2
catch Promise 2 reject
 */
```

#### promise.race

与 `all` 不同的是，`race` 是看哪个 `promise` 先执行完，返回第一个执行完的 `promise` 的值，不管状态如何。而且数组中的异步依旧会执行

``` js
const promise1 = new Promise((resolve, reject) => {
    // setTimeout(() => {
        console.log('Promise 1');
        resolve('Promise 1 resolve')
    // })
})
const promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('Promise 2');
        reject('Promise 2 reject')
    })
})

Promise.race([promise1, promise2]).then((res) => {
    console.log('then',res)
}).catch((res) => {
    console.log('catch',res) 
})
/**
Promise 1
then Promise 1 resolve
Promise 2
 */
```

#### promise.allSettled

`allSettled` 是不管 `promise` 的状态如何，都会返回所有 `promise` 的结果，并且结果中包含状态和值。

``` js
const promise1 = new Promise((resolve, reject) => {
    console.log('Promise 1');
        resolve('Promise 1 resolve')
 })
const promise2 = new Promise((resolve, reject) => {
    console.log('Promise 2');
    reject('Promise 2 reject')
 })

Promise.allSettled([promise1, promise2]).then((res) => {
    console.log('then',res)
}).catch((res) => {
    console.log('catch',res) 
})
/**
Promise 1
Promise 2
then [
  { status: 'fulfilled', value: 'Promise 1 resolve' },
  { status: 'rejected', reason: 'Promise 2 reject' }
]
 */
```

#### catch、then 第二参数

`Promise.catch` 的错误捕捉是全局的，针对整个 `Promise`，在有多个 `then` 下，都能触发 `catch`

`Promise.then` 的第二个参数优先级高于 `Promise.catch`，设置了就不会触发 `Promise.catch`

```js
new Promise((res, req) => {
  setTimeout(() => req(), 100);
})
  .then(
    () => {},
    () => {
      console.log("rej"); // 设置了，catch就不会触发
      // return Promise.reject(); // 这里抛出错误时 rej2 才打印
    }
  )
  .then(
    () => {},
    () => {
      console.log("rej2");
    }
  )
  .catch(() => {
    console.log("catch"); // 如果前面两个 then 都设置了第二参数做错误捕捉，catch时不会触发的，当有一个没有设置时，catch会捕捉没有设置的那个错误
  });
```

## map 和 el-table 的二三事

```js
const arr = [{ a: 1 }, { a: 2 }]
const arr2 = arr.map(item => {
    item.b = 3
    return item
})
console.log(arr[0] === arr2[0]) // true
console.log(arr[1] === arr2[1]) // true
```

```js
const arr = [{ a: 1 }, { a: 2 }]
const arr2 = arr.map(item => ({ ...item }))
console.log(arr[0] === arr2[0])
console.log(arr[1] === arr2[1])
```

可以清楚看出，`map` 并没有改变原数组的内存地址。在 `el-table` 中是用 `row` 作为行数据标识，当行选中时，改变改行的数据内存地址，会被认为是两个数据，影响选中效果，会有异常

## 复制方法兼容mac

```ts
/**复制到剪贴板 */
export function copy(txt: string) {
  return new Promise<void>(resolve => {
    const textString = txt.toString()
    const textarea = document.createElement('textarea')
    textarea.readOnly = true // 防止ios聚焦触发键盘事件
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)

    textarea.value = textString
    // ios必须先选中文字且不支持 input.select();
    selectText(textarea, 0, textString.length)
    if (document.execCommand('copy')) {
      document.execCommand('copy')
      message.success('复制成功')
    }
    document.body.removeChild(textarea)
    resolve()

    // 选中文本
    function selectText(textbox: HTMLTextAreaElement, startIndex: number, stopIndex: number) {
      // @ts-ignore
      if (textbox.createTextRange) {
        //ie
        // @ts-ignore
        const range = textbox.createTextRange()
        range.collapse(true)
        range.moveStart('character', startIndex) //起始光标
        range.moveEnd('character', stopIndex - startIndex) //结束光标
        range.select() //不兼容苹果
      } else {
        //firefox/chrome
        textbox.setSelectionRange(startIndex, stopIndex)
        textbox.focus()
      }
    }
  })
}
```

## IndexDB 实践

```ts
import { message } from "ant-design-vue";

const path = "https://xxxxx?" + new Date().getTime();

function init() {
  // 判断是否支持 indexedDB
  if (window.indexedDB) {
    fetch(path)
      .then((response) => response.json())
      .then((data) => {
        saveData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        message.error("地区数据加载失败");
      });
  }
}

// 获取数据
async function getData(key: string, fn: Function) {
  console.log("get data");
  // 判断是否支持 indexedDB，否则增加请求数据并返回
  if (window.indexedDB) {
    readData(key, (data: any) => {
      fn(data);
    });
  } else {
    fn(await fetchData(key));
  }
}

// 数据请求
async function fetchData(key: string) {
  const data = await fetch(path)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
      message.error("地区数据加载失败");
    });
  if (window.indexedDB) {
    saveData(data);
  }
  return data[key];
}

// 数据存储
function saveData(data: any) {
  // 打开或创建数据库
  const dbRequest = indexedDB.open("basicData", 1);

  dbRequest.onerror = function (event) {
    console.error("数据库打开失败");
  };

  // 成功回调
  dbRequest.onsuccess = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;

    if (db.objectStoreNames.contains("regionData")) {
      // 该方法用于创建一个数据库事务，返回一个 IDBTransaction 对象。向数据库添加数据之前，必须先创建数据库事务。
      // 第一个参数是一个数组，里面是所涉及的对象仓库，通常是只有一个；第二个参数是一个表示操作类型的字符串。目前，操作类型只有两种：readonly（只读）和readwrite（读写）
      // IDBDatabase 对象的transaction()返回一个事务对象，该对象的objectStore()方法返回 IDBObjectStore 对象
      const objectStore = db
        .transaction(["regionData"], "readwrite")
        .objectStore("regionData");
      // 获取一个指针对象
      const cursorRequest = objectStore.openCursor();

      // 遍历游标
      cursorRequest.onsuccess = function (event) {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          // 更新
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              objectStore.put({ type: key, data: data[key] });
            }
          }
        } else {
          // 新增
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              objectStore.add({ type: key, data: data[key] });
            }
          }
        }
      };
    }
  };

  // onupgradeneeded事件在数据库第一次创建或版本号发生变化时触发。在这个事件处理程序中，可以创建对象存储和索引
  dbRequest.onupgradeneeded = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;

    // 判断是否已经存在对象存储空间，如果存在则不创建，否则创建对象存储空间
    if (!db.objectStoreNames.contains("regionData")) {
      // 创建对象存储空间，keyPath设置（主键）为type
      const objectStore = db.createObjectStore("regionData", {
        keyPath: "type",
      });
      // 创建索引
      // objectStore.createIndex('type', 'type', { unique: true })
    }
  };
}

// 读数据库数据
function readData(key: string, fn: Function) {
  const dbRequest = indexedDB.open("basicData", 1);
  dbRequest.onsuccess = async function (event) {
    const db = (event.target as IDBOpenDBRequest).result;
    if (db.objectStoreNames.contains("regionData")) {
      const objectStore = db
        .transaction(["regionData"])
        .objectStore("regionData");
      const request = objectStore.get(key);

      request.onerror = async function (event) {
        fn(await fetchData(key));
        console.log("事务失败");
      };

      request.onsuccess = async function (event) {
        if (request.result) {
          //  console.log('data: ' + request.result.data)
          fn(request.result.data);
        } else {
          fn(await fetchData(key));
          console.log("未获得数据记录");
        }
      };
    } else {
      fn(await fetchData(key));
    }
  };

  dbRequest.onupgradeneeded = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;

    if (!db.objectStoreNames.contains("regionData")) {
      // 创建对象存储空间
      const objectStore = db.createObjectStore("regionData", {
        keyPath: "type",
      });
      // // 创建索引
      // objectStore.createIndex('type', 'type', { unique: true })
    }
  };
}

export { init, getData };
```

## sessionStorage 标签页共享数据

`sessionStorage` 不能在多个窗口或标签页之间共享数据，但是当通过 `window.open` 或链接打开新页面时(不能是新窗口)，新页面会复制前一页的 `sessionStorage`

## toFixed 不是四舍五入

`toFixed` 使用的是银行家算法

其实质是一种【四舍六入五取偶】的方法。

规则是：

- 当舍去位的数值<5时，直接舍去
- 当舍去位的数值>=6时，在舍去的同时向前进一位
- 当舍去位的数值=5时：
  - 5后不为空且不全为0，在舍去的同时向前进一位
  - 5后为空或全为0：
    - 5前数值为奇数，则在舍去的同时向前进一位
    - 5前数值为偶数，则直接舍去

可以使用 `round` 方法替换

```js
666.665.toFixed(2) // '666.66'
666.6651.toFixed(2) // '666.67'
Math.round(666.665*100)/100 // 666.67
```

## jsdoc

对于没有 `ts` 的项目，可以使用 `jsdoc` 来做类型提示，配合 `@ts-check`，或者是开启设置 `checkJs` 来做类型检查

建议在使用复杂类型的数据结构时，使用 `jsdoc`

参考链接：

[jsdoc 使用](https://juejin.cn/post/7319312761074090047)

[jsdoc 文档](https://www.jsdoc.com.cn/)

### 普通类型

```js
// @ts-check

/**
 * @type {number}
 */
const name = 'name'; // 不能将类型“string”分配给类型“number”

// 字面量类型及联合类型
/**
 * @type {'age'|'name'}
 */
 const type = 'age'

```

### 复杂类型

```js
// @ts-check

// 数组
/**
 * @type {number[][]}
 */
 const arr = [[1, 2], [3, 4]]

/**
 * @type [number,string]
 */
const arr = [1, '2']


// 对象
/**
 * @type {{ a : number }}
 */
const obj = {
    a: '1', // 不能将类型“string”分配给类型“number”。
}

/** 
 * @typedef {object} User
 * @property {string} name 
 * @property {number} age 
 */
// /** @typedef {{ name: string; age: number }} User */ 简洁版
/** @type {User} */
const user = { name: 'John Doe', age: 25 };


/** @typedef {number} Age */ // 类型别名
/** 
 * @typedef {object} User
 * @property {number} [Age] // 可选
 */
/** @type {User} */
const user = { };

// 函数
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
 function sum(a, b) {
  return a + b;
}
```

### 实用类型

```ts
interface User {
  name: string;
  age: number;
}

// Partial：使User中的所有属性变为可选
type PartialUser = Partial<User>;
// {
//   name?: string | undefined;
//   age?: number | undefined;
// }

// Readonly：使User中的所有属性变为只读
type ReadonlyUser = Readonly<User>;
// {
//   readonly name: string;
//   readonly age: number;
// }

// Record：使用联合的键和特定类型的值创建新类型
type UserRole = 'admin' | 'user';
type Roles = Record<UserRole, boolean>;
// {
//   admin: boolean;
//   user: boolean;
// }

// Pick：从另一个类型中选择特定属性创建新类型
type UserWithoutAge = Pick<User, 'name'>;
// {
//   name: string;
// }

// Omit：从另一个类型中省略特定属性创建新类型
type UserWithoutName = Omit<User, 'name'>;
// {
//   age: number;
// }
```

```js
/** @typedef {{ name: string; age: number }} User */
/** @typedef {Partial<User>} PartialUser */
/** @typedef {Readonly<User>} ReadonlyUser */
/** @typedef {Record<'admin' | 'user', boolean>} Roles */
/** @typedef {Pick<User, 'name'>} UserWithoutAge */
/** @typedef {Omit<User, 'name'>} UserWithoutName */
```

### 泛型

```js
/**
 * @template T
 * @param {T} val - 传入的值，可以是任何类型
 * @returns {T} 返回传入的值
 */
function a(val) {
    return val
}
```

## toFixed 不是四舍五入算法

`tofixed` 不是绝对的四舍五入，是银行家算法。尽量避免在金额计算使用，可以用 `round` 替代。

![输入图片说明](../image/%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_17156658787078.png)
