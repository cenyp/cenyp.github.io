# nextTick 与 数据更新

`nextTick` 的 异步更新在 `setTimeout` 下要按代码顺序执行，即更新在后，`nextTick` 是拿不到的，要看渲染 `watcher` 的位置
![输入图片说明](../image/202410161423code.png)

`vue` 源码

```ts
const resolvedPromise = /*#__PURE__*/ Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null
export function nextTick<T = void>(
  this: T,
  fn?: (this: T) => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}
```

`vue2` `nextTick` 函数和渲染函数，都会放入任务队列（异步队列，用 `Promise` 处理）中，所以先插入的先执行。

- 直接写 `setup`
  - 赋值在前：更新 `effect` 在 `nextTick` 之前执行，所以是最新的
  - 赋值在后：
    - vue2：初始执行 [`更新watcher（初始渲染）`,`nextTick`(原理 `Promise.resolve.then`),`更新watcher（赋值）`] => 合并两个重复的渲染 => [`更新 watcher`，`nextTick`(原理 `Promise.resolve.then`)] 所以打印的是最新的。
    - vue3：初始的更新 `effect`，会赋值到 `currentFlushPromise`，在执行 `nextTick` 时，返回 `currentFlushPromise`，即在更新 `effect` 后执行。**（1）**
- `setTimeOut`
  - 赋值在前：新
  - 赋值在后：
    - vue2：[`nextTick`, `更新watcher（赋值，也是异步的）`]，`nextTick` 先执行所以是旧的。
    - vue3：此时已经创建渲染 `effect` 并执行，`currentFlushPromise` 置为 `null`，`nextTick` 调用会生成行的 `Promise.resolve()` 来生成新的微任务，在 vue 的任务队列中比更新 `effect` 靠前，会先自行，所以是旧的 **（2）**
- 直接写 `Promise.resolve`，同 `setTimeOut`
- 用户行为事件回调执行，同 `setTimeOut`
  
> vue3
> 猜测 `currentFlushPromise` 是为了更好的获取 `DOM` 状态
> 实际使用还是看更新 `effect` 和 `nextTick` 的顺序，如果更新 `effect` 在前，`nextTick` 在后，则获取的是最新的，反之，则获取的是旧的。
> `setTimeOut` /事件触发，已经是属于下次事件循环了，`currentFlushPromise` 已为 `null`（在 vue 事件队列结束时，会生成 `Promise.resolve` 来清空 `currentFlushPromise` ）

总结：定时器和用户时间回调属于新事件循环，`nextTick` 要写在后面，直接写和 `Promise.resolve` 都是最新的

参考链接：[nextTick 与 数据更新](https://juejin.cn/post/7309668204103286818)
