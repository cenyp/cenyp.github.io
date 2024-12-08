# vue3

## 响应式代理 vs. 原始值

在 Vue 3 中，数据是基于 [JavaScript Proxy（代理）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 实现响应式的。使用过 Vue 2 的用户可能需要注意下面这样的边界情况：

```js
export default {
  data() {
    return {
      someObject: {}
    }
  },
  mounted() {
    const newObject = {}
    this.someObject = newObject

    console.log(newObject === this.someObject) // false
    console.log(newObject, this.someObject)
    // {} Proxy {}
  }
}
```

当你在赋值后再访问 `this.someObject`，此值已经是原来的 `newObject` 的一个响应式代理。**与 Vue 2 不同的是，这里原始的 `newObject` 不会变为响应式：请确保始终通过 `this` 来访问响应式状态。**

## Vue2.0 和 Vue3.0 有什么区别

1. 响应式系统的重新配置，使用代理替换 Object.define 属性，使用代理优势：
    1. 可直接监控阵列类型的数据变化
    2. 监听的目标是对象本身，不需要像 Object.defineProperty 那样遍历每个属性，有一定的性能提升
    3. 可拦截应用、拥有密钥、有等13种方法，以及 Object.define 属性没有办法
    4. 直接添加对象属性/删除
2. 新增组合API，更好的逻辑重用和代码组织
3. 重构虚拟 DOM
    1. 模板编译时间优化，将一些静态节点编译成常量
    2. slot优化，采取槽编译成懒人功能，拿槽渲染的决定留给子组件
    3. 在模板中提取和重用内联事件（最初，每次渲染时都会重新生成内联函数）
    4. 代码结构调整，更方便树摇动，使其更小
    5. 使用打字脚本替换流
4. Vue3可以更好的支持TypeScript
5. 优化生命周期钩子

## vue3 响应式数据的判断

- `isRef` : 检查一个值是否为一个 ref 对象
- `isReactive` : 检查一个对象是否是由 reactive 创建的响应式代理
- `isReadonly` : 检查一个对象是否是由 readonly 创建的只读代理
- `isProxy` : 检查一个对象是否是由 reactive 或者 readonly 方法创建的代理
  
## ref函数、reactive函数

**ref函数:**

- 作用: 定义一个响应式的数据

- 语法: `const xxx = ref(initValue)`
  - 创建一个包含响应式数据的引用对象（reference对象，简称ref对象）。
  - JS中操作数据： `xxx.value`
  - 模板中读取数据: 不需要`.value`，直接：`<div>{{xxx}}</div>`
- 备注：
  - 接收的数据可以是：基本类型、也可以是对象类型。
  - 基本类型的数据：响应式依然是靠 `Object.defineProperty()` 的 get 与 set 完成的。
  - 对象类型的数据：内部 “ 求助 ” 了 Vue3.0 中的一个新函数—— reactive 函数。
  
    ```js
      const object = { foo: ref(1) }
      <div>{{ object.foo + 1 }}<div/> //[object Object]1     这样子是不行的
    ```

**reactive函数:**

- 作用: 定义一个对象类型的响应式数据（基本类型不要用它，要用 ref 函数）
- 语法：const 代理对象= reactive (源对象)接收一个对象（或数组），返回一个代理对象（Proxy 的实例对象，简称 proxy 对象）

- reactive 定义的响应式数据是“深层次的”。

- 内部基于 ES6 的 Proxy 实现，通过代理对象操作源对象内部数据进行操作。

**reactive对比ref:**

- 从定义数据角度对比：
  - ref 用来定义：基本类型数据。
  - reactive 用来定义：对象（或数组）类型数据。
  - 备注：ref 也可以用来定义对象（或数组）类型数据, 它内部会自动通过 reactive 转为代理对象。
- 从原理角度对比：
  - ref 通过 Object.defineProperty() 的 get 与 set 来实现响应式（数据劫持）。
  - reactive通过使用 Proxy 来实现响应式（数据劫持）, 并通过 Reflect 操作源对象内部的数据。
- 从使用角度对比：
  - ref 定义的数据：操作数据需要 .value，读取数据时模板中直接读取不需要 .value。
  - reactive 定义的数据：操作数据与读取数据：均不需要 .value。
- 对象数据解构：
  - reactive
  - reactive 定义的数据不能解构使用

## watchEffect函数

- `watch` 的套路是：既要指明监视的属性，也要指明监视的回调。
- `watchEffect` 的套路是：不用指明监视哪个属性，监视的回调中用到哪个属性，那就监视哪个属性。
- `watchEffect` 有点像 `computed`：
  - 但 `computed` 注重的计算出来的值（回调函数的返回值），所以必须要写返回值。
  - 而 `watchEffect` 更注重的是过程（回调函数的函数体），所以不用写返回值。

## toRef、toRefs

作用：创建一个 ref 对象，其 value 值指向另一个对象中的某个属性。

语法：const name = toRef(person,'name')

应用: 要将响应式对象中的某个属性单独提供给外部使用时。

扩展：toRefs 与 toRef 功能一致，但可以批量创建多个 ref 对象

当从组合式函数中返回响应式对象时，`toRefs` 相当有用。使用它，消费者组件可以解构/展开返回的对象而不会失去响应性：

```js
function useFeatureX() {
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // ...基于状态的操作逻辑

  // 在返回时都转为 ref
  return toRefs(state)
}

// 可以解构而不会失去响应性
const { foo, bar } = useFeatureX()
```

## shallowReactive 与 shallowRef

- shallowReactive：只处理对象最外层属性的响应式（浅响应式）。

  ```js
  const state = shallowReactive({
    foo: 1,
    nested: {
      bar: 2
    }
  })
  
  // 更改状态自身的属性是响应式的
  state.foo++
  
  // ...但下层嵌套对象不会被转为响应式
  isReactive(state.nested) // false
  
  // 不是响应式的
  state.nested.bar++
  ```

- shallowRef：只处理基本数据类型的响应式, 不进行对象的响应式处理。

  ```js
  const state = shallowRef({ count: 1 })
    
  // 不会触发更改
  state.value.count = 2
    
  // 会触发更改
  state.value = { count: 2 }
  ```

- 什么时候使用?
  - 如果有一个对象数据，结构比较深, 但变化时只是外层属性变化 ===> shallowReactive。
  - 如果有一个对象数据，后续功能不会修改该对象中的属性，而是生新的对象来替换 ===> shallowRef。

## readonly 与 shallowReadonly

- readonly: 让一个响应式数据变为只读的（深只读）。
- shallowReadonly：让一个响应式数据变为只读的（浅只读）。
- 应用场景: 不希望数据被修改时。

## toRaw 与 markRaw

- toRaw：
  - 作用：将一个由reactive生成的响应式对象转为普通对象。
  - 使用场景：用于读取响应式对象对应的普通对象，对这个普通对象的所有操作，不会引起页面更新。

    ```js
    const foo = {}
    const reactiveFoo = reactive(foo)
    
    console.log(toRaw(reactiveFoo) === foo) // true
    ```

- markRaw：
  - 作用：标记一个对象，使其永远不会再成为响应式对象。
  - 应用场景:
    - 有些值不应被设置为响应式的，例如复杂的第三方类库等。
    - 当渲染具有不可变数据源的大列表时，跳过响应式转换可以提高性能。

    ```js
    const foo = markRaw({})
    console.log(isReactive(reactive(foo))) // false
    
    // 也适用于嵌套在其他响应性对象
    const bar = reactive({ foo })
    console.log(isReactive(bar.foo)) // false
    ```

## customRef

创建一个自定义的 ref，显式声明对其依赖追踪和更新触发的控制方式。

```vue
<template>
    <input type="text" v-model="keyword">
    <h3>{{keyword}}</h3>
</template>
​
<script>
  import {ref,customRef} from 'vue'
  export default {
    name:'Demo',
    setup(){
      // let keyword = ref('hello') //使用Vue准备好的内置ref
      //自定义一个myRef
      function myRef(value,delay){
        let timer
        //通过customRef去实现自定义
        return customRef((track,trigger)=>{
          return{
            get(){
              track() //告诉Vue这个value值是需要被“追踪”的
              return value
            },
            set(newValue){
              clearTimeout(timer)
              timer = setTimeout(()=>{
                value = newValue
                trigger() //告诉Vue去更新界面
              },delay)
            }
          }
        })
      }
      let keyword = myRef('hello',500) //使用程序员自定义的ref
      return {
        keyword
      }
    }
  }
</script>
```

## provide 与 inject

作用：实现祖与后代组件间通信

套路：父组件有一个 `provide` 选项来提供数据，后代组件有一个 `inject` 选项来开始使用这些数据

具体写法：

祖组件中：

```js
setup(){
    ......
    let car = reactive({name:'奔驰',price:'40万'})
    provide('car',car)
    ......
}
```

后代组件中：

```js
setup(props,context){
    ......
    const car = inject('car')
    return {car}
    ......
}
```

## vue3为什么要添加新的组合API，它可以解决哪些问题

在 Vue2.0 中，随着功能的增加，组件越来越复杂，维护起来也越来越难，而难以维护的根本原因是 Vue 的 API 设计迫使开发者使用监视、计算、方法 Option 组织代码，而不是实际的业务逻辑。

另外 Vue2.0 缺乏一个简单而低成本的机制来完成逻辑重用，虽然你可以 minxins 完全重用逻辑，但是当 mixin 更多的时候，就使得很难找到相应的数据，计算出来也许是从中 mixin 的方法，使得类型推断变得困难。

因此组合API外观，主要是解决选项API带来的问题，首先是代码组织，组合API开发者可以根据业务逻辑组织自己的代码，让代码更具可读性和可扩展性，也就是说，当下一个开发者接触到这段不是自己写的代码， 他可以更好地利用代码的组织来反转实际的业务逻辑，或者根据业务逻辑更好地理解代码。

二是实现代码的逻辑提取和重用，当然mixin逻辑提取和重用也可以实现，但就像我之前说的，多个mixin在作用于同一个组件时，很难看出mixin的属性，来源不明确，另外，多个mixin的属性存在变量命名冲突的风险。而 Composition API 恰恰解决了这两个问题。

## 说 Composition API 和 React Hook 很像，请问他们的区别是什么？

从 React Hook 从实现的角度来看，React Hook 是基于 useState 的调用顺序来确定下一个 re 渲染时间状态从哪个 useState 开始，所以有以下几个限制

不在循环中、条件、调用嵌套函数 Hook
你必须确保它总是在你这边 React Top level 调用函数 Hook
使用效果、使用备忘录 依赖关系必须手动确定
和 Composition API 是基于 Vue 的响应系统，和 React Hook 相比

在设置函数中，一个组件实例只调用一次设置，而 React Hook 每次重新渲染时，都需要调用 Hook，给 React 带来的 GC 比 Vue 更大的压力，性能也相对 Vue 对我来说也比较慢
Composition API 你不必担心调用的顺序，它也可以在循环中、条件、在嵌套函数中使用
响应式系统自动实现依赖关系收集，而且组件的性能优化是由 Vue 内部完成的，而 React Hook 的依赖关系需要手动传递，并且依赖关系的顺序必须得到保证，让路 useEffect、useMemo 等等，否则组件性能会因为依赖关系不正确而下降。
虽然 Composition API看起来像React Hook来使用，但它的设计思路也是React Hook的参考

## vue3有哪些新的组件

**Fragment:**

- 在Vue2中: 组件必须有一个根标签
- 在Vue3中: 组件可以没有根标签, 内部会将多个标签包含在一个Fragment虚拟元素中
- 好处: 减少标签层级, 减小内存占用

**Teleport**
什么是Teleport？—— Teleport 是一种能够将我们的组件html结构移动到指定位置的技术。

```vue
<template>
<teleport to="移动位置">
  <div v-if="isShow" class="mask">
    <div class="dialog">
      <h3>我是一个弹窗</h3>
      <button @click="isShow = false">关闭弹窗</button>
    </div>
  </div>
</teleport>
</template>
```

**Suspense:**

等待异步组件时渲染一些额外内容，让应用有更好的用户体验

使用步骤：

异步引入组件

```js
import {defineAsyncComponent} from 'vue'
const Child = defineAsyncComponent(()=>import('./components/Child.vue'))
```

使用Suspense包裹组件，并配置好default 与 fallback

```vue
<template>
  <div class="app">
    <h3>我是App组件</h3>
    <Suspense>
      <template v-slot:default>
        <Child/>
      </template>
      <template v-slot:fallback>
        <h3>加载中.....</h3>
      </template>
    </Suspense>
  </div>
</template>
```

## effect 作用域

**effectScope():**

创建一个 effect 作用域，可以捕获其中所创建的响应式副作用 (即计算属性和侦听器)，手动销毁，回收内存。

**getCurrentScope():**

如果有的话，返回当前活跃的 effect 作用域。

**onScopeDispose():**

在当前活跃的 effect 作用域上注册一个处理回调函数。当相关的 effect 作用域停止时会调用这个回调函数。

这个方法可以作为可复用的组合式函数中 `onUnmounted` 的替代品，它并不与组件耦合，因为每一个 Vue 组件的 `setup()` 函数也是在一个 effect 作用域中调用的。

```vue
<script setup>
import { ref,effectScope,watch,onScopeDispose,getCurrentScope } from 'vue'
const scope = effectScope();
const msg = ref('Hello World!');
  
scope.run(() => {
  console.log(111);
  watch(msg, () => console.log(msg.value));
  onScopeDispose(() => {
   console.log("onScopeDispose");
  });
})

getCurrentScope(); //放在外面才行
    
function aa(){
  console.log(getCurrentScope()); //undefined
  scope.stop();
}
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
  <button @click="aa">
    111
  </button>
</template>
```

## 组合式函数

在 Vue 应用的概念中，“组合式函数”(Composables) 是一个利用 Vue 的组合式 API 来封装和复用**有状态逻辑**的函数。

封装了无状态的一些逻辑

```js
// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0)
  const y = ref(0)

  // 组合式函数可以随时更改其状态。
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 一个组合式函数也可以挂靠在所属组件的生命周期上
  // 来启动和卸载副作用
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 通过返回值暴露所管理的状态
  return { x, y }
}
```

使用

```vue
<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

> 约定和最佳实践

**命名:**

组合式函数约定用驼峰命名法命名，并以“use”作为开头。

**输入参数:**

尽管其响应性不依赖 ref，组合式函数仍可接收 ref 参数。如果编写的组合式函数会被其他开发者使用，你最好在处理输入参数时兼容 ref 而不只是原始的值。[`unref()`](https://cn.vuejs.org/api/reactivity-utilities.html#unref) 工具函数会对此非常有帮助：

```js
import { unref } from 'vue'

function useFeature(maybeRef) {
  // 若 maybeRef 确实是一个 ref，它的 .value 会被返回
  // 否则，maybeRef 会被原样返回
  const value = unref(maybeRef)
}
```

如果你的组合式函数在接收 ref 为参数时会产生响应式 effect，请确保使用 `watch()` 显式地监听此 ref，或者在 `watchEffect()` 中调用 `unref()` 来进行正确的追踪。

**返回值:**

你可能已经注意到了，我们一直在组合式函数中使用 `ref()` 而不是 `reactive()`。我们推荐的约定是组合式函数始终返回一个包含多个 ref 的普通的非响应式对象，这样该对象在组件中被解构为 ref 之后仍可以保持响应性：

```js
// x 和 y 是两个 ref
const { x, y } = useMouse()
```

从组合式函数返回一个响应式对象会导致在对象解构过程中丢失与组合式函数内状态的响应性连接。与之相反，ref 则可以维持这一响应性连接。

如果你更希望以对象属性的形式来使用组合式函数中返回的状态，你可以将返回的对象用 `reactive()` 包装一次，这样其中的 ref 会被自动解包，例如：

```js
const mouse = reactive(useMouse())
// mouse.x 链接到了原来的 x ref
console.log(mouse.x)
```

```vue
<div>
    Mouse position is at: {{ mouse.x }}, {{ mouse.y }}
</div>
```

**副作用:**

在组合式函数中的确可以执行副作用 (例如：添加 DOM 事件监听器或者请求数据)，但请注意以下规则：

- 如果你的应用用到了[服务端渲染](https://cn.vuejs.org/guide/scaling-up/ssr.html) (SSR)，请确保在组件挂载后才调用的生命周期钩子中执行 DOM 相关的副作用，例如：`onMounted()`。这些钩子仅会在浏览器中被调用，因此可以确保能访问到 DOM。
- 确保在 `onUnmounted()` 时清理副作用。举例来说，如果一个组合式函数设置了一个事件监听器，它就应该在 `onUnmounted()` 中被移除 (就像我们在 `useMouse()` 示例中看到的一样)。当然也可以像之前的 `useEventListener()` 示例那样，使用一个组合式函数来自动帮你做这些事。

**使用限制:**

组合式函数在 `<script setup>` 或 `setup()` 钩子中，应始终被**同步地**调用。在某些场景下，你也可以在像 `onMounted()` 这样的生命周期钩子中使用他们。

这个限制是为了让 Vue 能够确定当前正在被执行的到底是哪个组件实例，只有能确认当前组件实例，才能够：

1. 将生命周期钩子注册到该组件实例上
2. 将计算属性和监听器注册到该组件实例上，以便在该组件被卸载时停止监听，避免内存泄漏。

> TIP
>
> `<script setup>` 是唯一在调用 await 之后仍可调用组合式函数的地方。编译器会在异步操作之后自动为你恢复当前的组件实例。
>
> 和 Mixin 的对比

Vue 2 的用户可能会对 [mixins](https://cn.vuejs.org/api/options-composition.html#mixins) 选项比较熟悉。它也让我们能够把组件逻辑提取到可复用的单元里。然而 mixins 有三个主要的短板：

1. **不清晰的数据来源**：当使用了多个 mixin 时，实例上的数据属性来自哪个 mixin 变得不清晰，这使追溯实现和理解组件行为变得困难。这也是我们推荐在组合式函数中使用 ref + 解构模式的理由：让属性的来源在消费组件时一目了然。
2. **命名空间冲突**：多个来自不同作者的 mixin 可能会注册相同的属性名，造成命名冲突。若使用组合式函数，你可以通过在解构变量时对变量进行重命名来避免相同的键名。
3. **隐式的跨 mixin 交流**：多个 mixin 需要依赖共享的属性名来进行相互作用，这使得它们隐性地耦合在一起。而一个组合式函数的返回值可以作为另一个组合式函数的参数被传入，像普通函数那样。

基于上述理由，我们不再推荐在 Vue 3 中继续使用 mixin。保留该功能只是为了项目迁移的需求和照顾熟悉它的用户。

> 和无渲染组件的对比

在组件插槽一章中，我们讨论过了基于作用域插槽的[无渲染组件](https://cn.vuejs.org/guide/components/slots.html#renderless-components)。我们甚至用它实现了一样的鼠标追踪器示例。

组合式函数相对于无渲染组件的主要优势是：组合式函数不会产生额外的组件实例开销。当在整个应用中使用时，由无渲染组件产生的额外组件实例会带来无法忽视的性能开销。

我们推荐在纯逻辑复用时使用组合式函数，在需要同时复用逻辑和视图布局时使用无渲染组件。
