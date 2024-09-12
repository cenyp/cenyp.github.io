# vue2.0

## 声明式渲染

```vue
<div id="app">
  {{ message }}
</div>
<script>
var app = new Vue({
  el: "#app",
  data: {
    message: "Hello Vue!",
  },
});
</script>
```

vue 是如何识别`{{ }}`语法，并在页面中渲染出相应的值？
要从 vue 对模版节点，也就是#app 节点的解析开始
第一步，html 转 ast。会获取#app 节点，并将其转换为 ast。这里是使用正则表达式对 html 文本就行解析，获取对应的属性，如`{{ }}`，组成一个抽象语法树

```json
{
  "tag": "div",
  "attrs": [
    {
      "name": "id",
      "value": "app"
    }
  ],
  "children": [
    {
      "type": 3,
      "text": "{{message}}"
    }
  ],
  "type": 1,
  "parent": null
}
```

第二步，ast 转 render。对 ast 进行编译，生成 render 函数。\_c，\_v，\_s 等，是 vue 内部处理函数

```js
_c("div", { id: "app" }, _v(_s(message)));
```

第三步，将 render 字符串变成函数。使用 width 关键字获取 vm 上挂载的属性值（在初始化是会把 data 里面的属性挂在在实例上）

```js
() => {
  with (this) {
    return _c("div", { id: "app" }, _v(_s(message)));
  }
};
```

第四步，将 render 函数变成虚拟 dom。现在 data 里面的 message 值已经挂载到 vm 实例上，render 函数已经变成一个虚拟 dom，并且已经将 data 里面的属性值替换成对应的值

```json
{
  "tag": "div",
  "data": {
    "id": "app"
  },
  "children": [
    {
      "text": "Hello Vue!",
      "el": {}
    }
  ],
  "el": {}
}
```

第五步，使用 patch 算法将虚拟 dom 变成真实 dom，并挂载到页面上。
使用 createElement、insertBefore 等方法，生成 DOM 节点，完成渲染

## 响应式

vue 是如何实现响应式的？
Vue.js 的响应式机制是基于订阅者模式（Observer Pattern）实现的，主要包括三个核心概念：依赖（Dep）、观察者（Watcher）和响应式数据对象。

1. 依赖（Dep）：依赖是一个观察者列表，每个依赖都与一个响应式数据对象的属性相关联。当属性发生变化时，依赖会通知所有关联的观察者进行更新操作。
2. 观察者（Watcher）：观察者是一个订阅者，用于监听某个特定的属性。当属性发生变化时，观察者会接收到通知，并执行相应的更新操作。vue 有三种：render、watcher、computed。
3. 响应式数据对象：响应式数据对象是一个普通的 JavaScript 对象，它的属性被转换为“getter/setter”，以便在访问和修改属性时能够自动触发更新操作。

单个数据 --> Object.defineProperty --> set --> dep（做 watcher 收集，watcher 也会做 dep 收集）
--> get --> dep --触发更新--> watcher（更新）  
tips:
每个数据都会有一个 dep 对象，用来收集所有相关的 watcher 对象。
dep 与 watcher 是多对多的关系，一个 dep 对象可以对应多个 watcher 对象，一个 watcher 对象也可以对应多个 dep 对象。

vue2.x 利用 ES5 的 `Object.defineProperty` 方法，对 data 中的属性进行劫持，在属性发生变化时，触发对应的监听事件，更新视图。

首先，在 init 中对 data 的数据进行遍历，使用 `Object.defineProperty` 方法，对每个属性都加上 setter 和 getter。
添加新 watch 监听数据 --执行顺序是 1.先做数据劫持 2.向 dep 里面添加 watcher 3. 触发数据更新 4.set 里面的 dep.notify(触发 watcher 里面的更新)

```js
Object.defineProperty(data, key, {
  get: function get() {
    // 调用depend方法进行dep和watcher双向绑定
    if (Dep.target) {
      dep.depend();
      if (childDep.dep) {
        childDep.dep.depend();
      }
    }
    return value;
  },
  set: function set(newVal) {
    if (newVal === value) return;
    // 解决赋值没有监听问题
    observer(newVal);
    value = newVal;

    // 更新watch监听数据
    dep.notify();
  },
});
```

https://ufdj-erp-fe-1318198985.cos.ap-guangzhou.myqcloud.com/category/20230706/3A0155B9C866F31E4B2AE3842B4A9538/vue_modal.png

https://zhuanlan.zhihu.com/p/168768245?utm_id=0

## v-if

从源码可以看到，v-if 最终会生成一个三元表达式。

```js
/*处理v-if*/
function genIf(el: any): string {
  /*标记位*/
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice());
}

/*处理if条件*/
function genIfConditions(conditions: ASTIfConditions): string {
  /*表达式不存在*/
  if (!conditions.length) {
    return "_e()";
  }

  const condition = conditions.shift();
  if (condition.exp) {
    // 生成一个三元表达式
    return `(${condition.exp})?${genTernaryExp(
      condition.block
    )}:${genIfConditions(conditions)}`;
  } else {
    return `${genTernaryExp(condition.block)}`;
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  /*v-if与v-once同时存在的时候应该使用三元运算符，譬如说(a)?_m(0):_m(1)*/
  function genTernaryExp(el) {
    return el.once ? genOnce(el) : genElement(el); //genElement处理节点
  }
}
```

## v-show

在 Vue 的源码中，v-show 指令的处理主要由 render 函数和 patch 函数完成。

render 函数：在组件实例化过程中，Vue 会将模板编译成 render 函数，用于生成 VNode。当存在 v-show 指令时，render 函数会根据 v-show 的值来生成对应的 VNode，如果指令的值为 false，则会生成一个注释节点（即不渲染该元素），否则生成一个普通的 VNode。

patch 函数：当组件需要更新时，Vue 内部会调用 patch 函数进行 DOM 的重新渲染。如果更新时发现某个元素的 v-show 值发生了变化，那么 patch 函数会根据新的值来更新该元素的显示状态，具体做法是通过修改元素的 style.display 属性来实现的。当 v-show 的值为 false 时，将 display 属性设置为 "none" 隐藏元素；当 v-show 的值为 true 时，将 display 属性设置为 "" 显示元素。

下面是 render 函数和 patch 函数处理 v-show 指令的相关部分源码：

```javascript
// render 函数中的处理
function renderElement(element, options) {
  // ...
  if (show) {
    addDirective(el, "show", true);
  } else {
    addDirective(el, "show", false);
    childNode = createEmptyVNode();
  }
  // ...
}

// patch 函数中的处理
function patchVShow(oldVnode, vnode) {
  const oldShow = !!oldVnode.data.directives && oldVnode.data.directives.show;
  const show = !!vnode.data.directives && vnode.data.directives.show;
  if (oldShow !== show) {
    const style = vnode.elm.style || {};
    style.display = show ? "" : "none";
  }
}
```

在 render 函数中，当存在 v-show 指令时，如果指令的值为 false，则会生成一个注释节点 childNode = createEmptyVNode()；如果指令的值为 true，则会添加一个 show 指令。

在 patch 函数中，当更新时发现某个元素的 v-show 值发生了变化时，会根据新的值来修改元素的 style.display 属性，从而实现元素的显示或隐藏。

注意，v-show 不支持 <template> 元素。因为不能通过修改元素的 display 属性来控制 <template> 元素的显示或隐藏。

## v-for

可以看到 Vue 内部会使用 \_l 函数来处理 v-for 循环，并根据不同的遍历数据类型分别做处理，返回对应数据类型的遍历结果来渲染对应节点。

```js
/*处理v-for循环 (item,index) in list */
function genFor(el: any): string {
  const exp = el.for;
  const alias = el.alias;
  // item
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
  // index
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";

  if (
    process.env.NODE_ENV !== "production" &&
    maybeComponent(el) &&
    el.tag !== "slot" &&
    el.tag !== "template" &&
    !el.key
  ) {
    warn(
      `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
        `v-for should have explicit keys. ` +
        `See https://vuejs.org/guide/list.html#key for more info.`,
      true /* tip */
    );
  }

  /*标记位，避免递归*/
  // genElement 方法处理节点渲染
  el.forProcessed = true; // avoid recursion
  return (
    `_l((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${genElement(el)}` +
    "})"
  );
}

export function _l(val: any, render: () => VNode): ?Array<VNode> {
  /*根据类型循环render*/
  let ret: ?Array<VNode>, i, l, keys, key;
  if (Array.isArray(val) || typeof val === "string") {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === "number") {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    keys = Object.keys(val);
    ret = new Array(keys.length);
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      ret[i] = render(val[key], key, i);
    }
  }
  return ret;
}
```

为什么 v-for 要设置 key？

- 为了高效的更新虚拟 DOM。
- 避免 diff 算法对不同节点识别成同一个

官网说法：
key 的特殊 attribute 主要用在 Vue 的虚拟 DOM 算法，在新旧 nodes 对比时辨识 VNodes。如果不使用 key，Vue 会使用一种最大限度减少动态元素并且尽可能的尝试就地修改/复用相同类型元素的算法。而使用 key 时，它会基于 key 的变化重新排列元素顺序，并且会移除 key 不存在的元素。
有相同父元素的子元素必须有独特的 key。重复的 key 会造成渲染错误。

从源码看

```js
/*
  判断两个VNode节点是否是同一个节点，需要满足以下条件
  key相同
  tag（当前节点的标签名）相同
  isComment（是否为注释节点）相同
  是否data（当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息）都有定义
  当标签是<input>的时候，type必须相同
*/
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  );
}
```

但在大多数情况下，v-for 遍历，不设置 key 值，也是可以正确运行的。因为即使 diff 算法判断错误，在 patchVnode 函数处理中，会根据有无子节点时做处理。
只适用于列表渲染输出的结果不依赖子组件状态或者临时 DOM 状态 (例如表单输入值) 的情况

在 Vue2.x 中, 对于 v-if/v-else/v-else-if 的各分支项 key 是必须的, 需要我们自己配置, 而且不建议使用循环的索引 index 作为 key, 相信大家都有踩到过这个 use-index-for-key 的坑了.
所以 Vue3.x 现在会自动生成唯一的 key, 不用我们手动添加了; 而如果我们还非要自己添加, 那就需要保证每个分支必须使用唯一的  key, 而不能通过故意使用相同的  key  来强制重用分支。

## $on $emit $off $once 事件监听及触发原理

初始化事件在 vm 上创建一个\_events 对象，用来存放事件。\_events 的内容如下：

```js
{
  eventName: [func1, func2, func3];
}

/*初始化事件*/
export function initEvents(vm: Component) {
  /*在vm上创建一个_events对象，用来存放事件。*/
  vm._events = Object.create(null);
  /*这个bool标志位来表明是否存在钩子，而不需要通过哈希表的方法来查找是否有钩子，这样做可以减少不必要的开销，优化性能。*/
  vm._hasHookEvent = false;
  // init parent attached events
  /*初始化父组件attach的事件*/
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}
```

### $on

$on方法用来在vm实例上监听一个自定义事件，该事件可用$emit 触发。

```javascript
Vue.prototype.$on = function (
  event: string | Array<string>,
  fn: Function
): Component {
  const vm: Component = this;

  /*如果是数组的时候，则递归$on，为每一个成员都绑定上方法*/
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      this.$on(event[i], fn);
    }
  } else {
    (vm._events[event] || (vm._events[event] = [])).push(fn);
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    /*这里在注册事件的时候标记bool值也就是个标志位来表明存在钩子，而不需要通过哈希表的方法来查找是否有钩子，这样做可以减少不必要的开销，优化性能。*/
    if (hookRE.test(event)) {
      vm._hasHookEvent = true;
    }
  }
  return vm;
};
```

### $once

`$once` 监听一个只能触发一次的事件，在触发以后会自动移除该事件。

```javascript
Vue.prototype.$once = function (event: string, fn: Function): Component {
  const vm: Component = this;
  function on() {
    /*在第一次执行的时候将该事件销毁*/
    vm.$off(event, on);
    /*执行注册的方法*/
    fn.apply(vm, arguments);
  }
  on.fn = fn;
  vm.$on(event, on);
  return vm;
};
```

### $off

`$off` 用来移除自定义事件

```javascript
Vue.prototype.$off = function (
  event?: string | Array<string>,
  fn?: Function
): Component {
  const vm: Component = this;
  // all
  /*如果不传参数则注销所有事件*/
  if (!arguments.length) {
    vm._events = Object.create(null);
    return vm;
  }
  // array of events
  /*如果event是数组则递归注销事件*/
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      this.$off(event[i], fn);
    }
    return vm;
  }
  // specific event
  const cbs = vm._events[event];
  /*Github:https://github.com/answershuto*/
  /*本身不存在该事件则直接返回*/
  if (!cbs) {
    return vm;
  }
  /*如果只传了event参数则注销该event方法下的所有方法*/
  if (arguments.length === 1) {
    vm._events[event] = null;
    return vm;
  }
  // specific handler
  /*遍历寻找对应方法并删除*/
  let cb;
  let i = cbs.length;
  while (i--) {
    cb = cbs[i];
    if (cb === fn || cb.fn === fn) {
      cbs.splice(i, 1);
      break;
    }
  }
  return vm;
};
```

### $emit

`$emit` 用来触发指定的自定义事件。

```javascript
Vue.prototype.$emit = function (event: string): Component {
  const vm: Component = this;
  if (process.env.NODE_ENV !== "production") {
    const lowerCaseEvent = event.toLowerCase();
    if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
      tip(
        `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(
            vm
          )} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
      );
    }
  }
  let cbs = vm._events[event];
  if (cbs) {
    /*将类数组的对象转换成数组*/
    cbs = cbs.length > 1 ? toArray(cbs) : cbs;
    const args = toArray(arguments, 1);
    /*遍历执行*/
    for (let i = 0, l = cbs.length; i < l; i++) {
      cbs[i].apply(vm, args);
    }
  }
  return vm;
};
```

## 组件化 component

## 为什么说 VUE 没有完全遵循 MVVM 模型

像 MVVM 模型，遵循的是 VIEW 与 VM 层是双向数据绑定的，即数据驱动视图，视图改变数据触发逻辑交互。而 VUE 还有 ref 这类 API 允许在 Model 层直接操作 DOM，所以说是不符合 MVVM 模型。

像 MVC 是 C 控制层改变数据层 M，触发 V 视图层更新；V 视图层变动触发 C 层。

个人理解
MVVM 是 M <==> VM <==> V，像修改数据驱动视图，视图变动通过 watch、computed 做监听处理是 MVVM 的体现。
MVC 是 M <==> C <==> V (<==> M) ，数据变动触发 C 层逻辑交互，再通过 V 视图层更新，类似@change 等事件监听

## 生命周期钩子

源码里面是使用 `callHook(vm, 'beforeCreate')`方法来触发生命周期，在不同的操作前后比如在执行`vm._update`（视图更新）方法前后执行 beforeMount 和 mounted 钩子。

callHook 会执行 VM 实例本身的钩子函数和 mixins 里面的钩子函数，并且会在初始化时合并成一个数组，然后遍历执行。

## 模版语法解析

Vue.js 模板语法解析的流程主要包括以下几个步骤：

1. 解析：Vue.js 会将模板字符串解析成抽象语法树（AST）。
2. 静态分析：在 AST 中对模板中的静态节点进行标记，以便后续优化渲染性能。
3. 代码生成：将 AST 转换为可执行的渲染函数，返回一个纯 JavaScript 函数，并将该函数缓存起来以备复用。渲染函数接收一个“渲染上下文”对象作为参数，用于保存组件实例、作用域插槽等数据。
4. 执行渲染函数：当组件需要重新渲染时，Vue.js 会调用之前生成的渲染函数，并传入最新的渲染上下文对象，以生成最新的虚拟 DOM。
5. 生成虚拟 DOM：渲染函数会根据渲染上下文对象生成一棵新的虚拟 DOM 树。
6. 执行比对算法：Vue.js 会使用 Virtual DOM 算法将新的虚拟 DOM 树与旧的虚拟 DOM 树进行比较，找出需要更新的节点。
7. 执行更新操作：根据比对结果，Vue.js 会对需要更新的节点进行更新操作，通常是通过 DOM 操作或者使用 Diff 算法进行优化。

整个流程中，AST 的解析、代码生成和虚拟 DOM 的生成都是在组件编译时进行的，只需要在组件创建时执行一次，以后每次重新渲染时只需要执行最后三步即可。这样可以大大提高 Vue.js 的性能，并且使得组件的渲染过程更加可控和可预测。

## $watch 原理

1. 在 initState 阶段，调用 initWatch 方法进行初始化

```js
function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key];
    /*数组则遍历进行createWatcher*/
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}
```

2. 根据数据类型创建不同的 Watcher

```js
/*创建一个观察者Watcher*/
function createWatcher(vm: Component, key: string, handler: any) {
  let options;
  /*对对象类型进行严格检查，只有当对象是纯javascript对象的时候返回true*/
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === "string") {
    /*
        当然，也可以直接使用vm中methods的方法
    */
    handler = vm[handler];
  }
  /*用$watch方法创建一个watch来观察该对象的变化*/
  vm.$watch(key, handler, options);
}
```

3. 利用 Watcher 做数据监听，当数据赋值时，触发 set 方法，调用 dep.notify()方法，通知所有的 Watcher 对象进行更新操作，便触发 handler 回调函数。

```js
vm.prototype.$watch = function (exprOrfn, handler, options) {
  const vm = this;
  const watcher = new Watcher(vm, exprOrfn, handler, {
    ...options,
    user: true,
  });
  // 立即执行
  if (options?.immediate) {
    handler.call(vm, watcher.value);
  }
};
```

比如：监听了 c 触发 fn，初始化时生成一个 Watcher，当模版编译到 c 时，收集依赖改依赖 Watcher。在 c 被赋值时，触发 set 方法，执行 dep.notify 更新所有 Watcher，fn 就会执行

## computed 属性原理

1. 在 init 阶段，会调用 initComputed 方法，对 computed 属性进行初始化。创建 Watcher 用于后续的数据监听与更新

```js
/*初始化computed*/
function initComputed(vm: Component, computed: Object) {
  const computed = vm.$options.computed;
  let watcher = (vm._computedWatchers = {});
  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === "function" ? userDef : userDef.get;
    watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true }); //lazy 避免初始运算
    defineComputed(vm, key, userDef);
  }
}
```

2. 对 get 属性进行处理，当原来数据更新时，触发 Watcher 的 update 方法，调用 dep.notify()方法（这里计算属性的dep和依赖的water相互记录），更新dirty的值。然后触发 get 方法，重新计算依赖的数据。

```js
const sharedPropertyDefinition = {};
function defineComputed(target, key, userDef) {
  if (typeof userDef === "function") {
    sharedPropertyDefinition.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  // Object.defineProperty会创建不存在的属性
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
function createComputedGetter(key) {
  return function () {
    let watcher = this._computedWatchers[key];
    if (watcher) {
      //
      if (watcher.dirty) {
        // evaluate() {
        //     this.value = this.get()
        //     this.dirty = false
        // }
        // dirty赋值为false，避免重复计算，即数据缓存
        // 在updata中dirty会赋值为true，即依赖数据更新时，当触发get时，便会会重新计算，实现计算属性
        watcher.evaluate();
      }
      // 双向数据依赖收集
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}
```

比如：计算属性 c=a+b，初始化生成 Watcher，当模版执行到 c 时，触发计算，收集 a、b依赖，并设置 dirty 为 false，当 a/b 触发依赖更新时，dirty 变为 true，重新计算 a+b

## 虚拟 DOM

引入虚拟 DOM 的好处

1. 对重复 DOM 操作有性能优化，确保 DOM 操作的性能。这里是通过 diff 算法对比新旧虚拟 DOM 树，只更新必要的 DOM 节点；还有 nextTick 等方法做优化
2. 跨平台，虚拟 DOM 可以渲染到不同平台，如 web、weex、小程序等。通过 ast 树渲染成一个抽象的 DOM 树，然后通过不同平台的 render 方法渲染成平台 DOM。
3. 打开函数式 UI 编程的大门，使得组件抽象化，使得代码更易维护。最早是 react 在 13 年提出的。

虚拟 DOM 被诟病的地方是，在某些情境下，对于一些不需要重新渲染的节点会重新渲染，如：一个组件里面有大量节点可以复用，但因为判断为是不同节点，从而重新渲染，还有比如静态节点（不含变量）
对此，VUE 做了 v-once、带编译时信息的虚拟 DOM 等等方法提高 diff 算法的性能

https://cn.vuejs.org/guide/extras/rendering-mechanism.html

无虚拟 DOM 框架，如：svelte
在编译阶段，帮我们直接把声明式代码（声明式代码是一种以描述目标状态为主导的编程风格，其中开发者主要关注于“做什么”而非“如何做”。）转化为更加高效的命令式代码（命令式代码是一种非常常见的编程风格，它的主要特点是通过一条条命令来描述一个计算机程序的执行过程。通常情况下，命令式代码使用一系列指令来改变计算机的状态，以实现程序的功能。），并且减少了运行时代码

从编译后代码可以看到 vue 打包后还会引入 c\h\n 等等的内部编译函数，而 svelte 只有对 createElement 等原生操作方法的封装。所以说 react、vue 是运行时框架，scelte 是编译时框架

虚拟 DOM 框架和无虚拟 DOM 框架，都可以实现 UI 驱动的编程方式，即数据驱动视图

对于国内来说，虚拟 DOM 框架更合适，因为虚拟 DOM 框架可以实现小程序跨平台，而小程序跨平台是前端框架发展的大趋势。因为小程序是不能直接操作 DOM 的，在这块虚拟 DOM 框架就很有优势，svelte 打包产物是对 DOM 的操作 api。还有对于 jsx 的支持也是虚拟 DOM 框架的优势，像 taro3 也是升级成 vdom 模式，uniapp 更是不支持 jsx 开发小程序。（uni-app 能编译时跨端是因为 vue template 和小程序 template 基本一致）。要在实现一套 runtime 也不是不可行，可代价就太大了，得不偿失且性能难说。

## watcher 收集 dep 的原因
vue2 里面会有有三种 watcher

1. 监听 watcher，便于解除 watcher 的订阅，当有监听是废弃时，要去掉对应的 watcher
2. 计算 watcher，为了让这些 dep 能够有机会收集渲染 watcher，计算属性的依赖可能并不会在页面渲染的时候用到，修改对应依赖。触发更新时，dep 会遍历所有 watcher，收集 dep 是为了避免 dep 里面没有对应的 watcher，导致无法触发更新（因为在渲染上是没有的）
3. 渲染 watcher，便于解除 watcher 的订阅

## 为什么 v-for 和 v-if 不能一起用

当 v-for 和 v-if 同时存在于同一个元素上时，v-for 具有更高的优先级，它会先执行循环遍历，并将元素和子组件重复渲染多次。在每次循环迭代过程中，v-if 会再次进行条件判断。
从源码上看，处理 v-for 会优先于 v-if。

```js
function genElement(el: ASTElement): string {
  if (el.staticRoot && !el.staticProcessed) {
    /*处理static静态节点*/
    return genStatic(el);
  } else if (el.once && !el.onceProcessed) {
    /*处理v-once*/
    return genOnce(el);
  } else if (el.for && !el.forProcessed) {
    /*处理v-for*/
    return genFor(el);
  } else if (el.if && !el.ifProcessed) {
    /*处理v-if*/
    return genIf(el);
  } else if (el.tag === "template" && !el.slotTarget) {
    /*处理template*/
    return genChildren(el) || "void 0";
  } else if (el.tag === "slot") {
    /*处理slot*/
    return genSlot(el);
  } else {
    // component or element
    /*处理组件或元素*/
    let code;
    if (el.component) {
      code = genComponent(el.component, el);
    } else {
      const data = el.plain ? undefined : genData(el);

      const children = el.inlineTemplate ? null : genChildren(el, true);
      code = `_c('${el.tag}'${
        data ? `,${data}` : "" // data
      }${
        children ? `,${children}` : "" // children
      })`;
    }
    // module transforms
    for (let i = 0; i < transforms.length; i++) {
      code = transforms[i](el, code);
    }
    return code;
  }
}
```

## nextTick
在用户调用时，把函数压入执行栈中，等dom节点更新完成再调用执行栈。

因为 dom 操作是宏任务，在实现上优先用 promise > MutationObserver（监听dom节点变化）> setImmediate > setTimeout(0)

注意在 vue3 中不再对低版本支持，所以只有 promise 方法实现

## 计算属性依赖收集过程
https://juejin.cn/post/7220020535299539002#heading-4
![输入图片说明](../../image/%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_17246681805021.png)
