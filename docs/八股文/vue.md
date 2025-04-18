# VUE

## SPA 单页面的理解

`SPA`（ single-page application ）仅在 Web 页面初始化时加载相应的 `HTML`、`JavaScript` 和 `CSS`。一旦页面加载完成，`SPA` 不会因为用户的操作而进行页面的重新加载或跳转；取而代之的是利用路由机制实现 `HTML` 内容的变换，UI 与用户的交互，避免页面的重新加载。

**优点：**

- 用户体验好、快，内容的改变不需要重新加载整个页面，避免了不必要的跳转和重复渲染；
- 基于上面一点，`SPA` 相对对服务器压力小；
- 前后端职责分离，架构清晰，前端进行交互逻辑，后端负责数据处理；

**缺点：**

- 初次加载耗时多：为实现单页 Web 应用功能及显示效果，需要在加载页面的时候将 `JavaScript`、`CSS` 统一加载，部分页面按需加载；
- 前进后退路由管理：由于单页应用在一个页面中显示所有的内容，所以不能使用浏览器的前进后退功能，所有的页面切换需要自己建立堆栈管理；
- `SEO` 难度较大：由于所有的内容都在一个页面中动态替换显示，所以在 `SEO` 上其有着天然的弱势。

## v-show 与 v-if 区别

**v-if** 是**真正**的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；也是**惰性的**：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

**v-show** 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 `CSS` 的 `display` 属性进行切换。

所以，`v-if` 适用于在运行时很少改变条件，不需要频繁切换条件的场景；`v-show` 则适用于需要非常频繁切换条件的场景。

此外，也要考虑使用时组件渲染和生命周期的影响，还有数据初始化的影响

## Class 与 Style 动态绑定

`Class` 可以通过对象语法和数组语法进行动态绑定：

- 对象语法：

```vue
<div v-bind:class="{ active: isActive, 'text-danger': hasError }"></div>
<script>
export default {
  data:()=>{
    isActive: true,
    hasError: false
  }
}
</script>
```

- 数组语法：

```vue
<div v-bind:class="[isActive ? activeClass : '', errorClass]"></div>
<script>
export default {
  data:()=>{
    activeClass: 'active',
    errorClass: 'text-danger'
  }
}
</script>
```

`Style` 也可以通过对象语法和数组语法进行动态绑定：

- 对象语法：

```vue
<div v-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
<script>
export default {
  data:()=>{
    activeColor: 'red',
    fontSize: 30
  }
}
</script>
```

- 数组语法：

```vue
<div v-bind:style="[styleColor, styleSize]"></div>

<script>
export default {
  data:()=>{
    styleColor: {
      color: 'red'
    },
    styleSize:{
      fontSize:'23px'
    }
  }
}
</script>
```

## Vue 的单向数据流

所有的 `prop` 都使得其父子 `prop` 之间形成了一个**单向下行绑定**：父级 `prop` 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。

额外的，每次父级组件发生更新时，子组件中所有的 `prop` 都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变 prop。如果你这样做了，Vue 会在浏览器的控制台中发出警告。子组件想修改时，只能通过 `$emit` 派发一个自定义事件，父组件接收到后，由父组件修改。

有两种常见的试图改变一个 `prop` 的情形 :

- **这个 `prop` 用来传递一个初始值；这个子组件接下来希望将其作为一个本地的 prop 数据来使用。** 在这种情况下，最好定义一个本地的 `data` 属性并将这个 `prop` 用作其初始值：

```js
export default {
  props: ['initialCounter'],
  data: function () {
    return {
      counter: this.initialCounter
    }
  }
}
```

- **这个 prop 以一种原始的值传入且需要进行转换。** 在这种情况下，最好使用这个 `prop` 的值来定义一个计算属性

```js
export default {
  props: ['size'],
  computed: {
    normalizedSize: function () {
      return this.size.trim().toLowerCase()
    }
  }
}
```

## computed 和 watch

**computed：**

1. 支持缓存，只有依赖数据发生改变，才会重新进行计算
2. 不支持异步，当 `computed` 内有异步操作时无效，无法监听数据的变化，也存在没有返回值的情况
3. `computed` 属性值会默认走缓存，计算属性是基于它们的响应式依赖进行缓存的，也就是基于 `data` 中声明过或者父组件传递的`props`中的数据通过计算得到的值
4. 如果一个属性是由其他属性计算而来的，这个属性依赖其他属性，是一个多对一或者一对一，一般用 `computed`
5. 如果 `computed` 属性属性值是函数，那么默认会走 `get` 方法；函数的返回值就是属性的属性值；在 `computed` 中的，属性都有**一个 get 和一个 set**方法，当数据变化时，调用 `set` 方法。

**watch：**

1. 不支持缓存，数据变，直接会触发相应的操作；
2. watch支持异步；
3. 监听的函数接收两个参数，第一个参数是最新的值；第二个参数是输入之前的值；当一个属性发生变化时，需要执行对应的操作；一对多；
4. 监听数据必须是data中声明过或者父组件传递过来的props中的数据，当数据变化时，触发其他操作，函数有两个参数，
    1. `immediate`：组件加载立即触发回调函数执行，
    2. `deep`：深度监听，为了发现**对象内部值**的变化，复杂类型的数据时使用，例如数组中的对象内容的改变，注意监听数组的变动不需要这么做。注意：`deep`无法监听到数组的变动和对象的新增，参考vue数组变异,只有以响应式的方式触发才会被监听到。

**运用场景：**

- 当我们需要进行数值计算，并且依赖于其它数据时，应该使用 `computed`，因为可以利用 `computed` 的***缓存特性***，避免每次获取值时，都要重新计算；
- 当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 `watch`，使用 `watch` 选项允许我们执行异步操作 ( 访问一个 API )，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

## Vue不能监听数组项直接赋值

由于 `JavaScript` 的限制，Vue 不能检测到以下数组的变动：

- 当你利用索引直接设置一个数组项时，例如：`vm.items[indexOfItem] = newValue`
- 当你修改数组的长度时，例如：`vm.items.length = newLength`

为了解决第一个问题，Vue 提供了以下操作方法：

```js
// Vue.set
Vue.set(vm.items, indexOfItem, newValue)
// vm.$set，Vue.set的一个别名
vm.$set(vm.items, indexOfItem, newValue)
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```

为了解决第二个问题，Vue 提供了以下操作方法：

```js
// Array.prototype.splice
vm.items.splice(newLength)
```

> 原因是 VUE2 使用 `object.defineProperty` 对数据进行劫持，无法自动劫持新属性，所以会在新属性负责后再劫持一次

## Vue 生命周期的理解

**（1）生命周期是什么？**

Vue 实例有一个完整的生命周期，也就是从开始创建、初始化数据、编译模版、挂载 Dom -> 渲染、更新 -> 渲染、卸载等一系列过程，我们称这是 Vue 的生命周期。

**（2）各个生命周期的作用:**

| 生命周期        | 描述                                                                  |
| --------------- | --------------------------------------------------------------------- |
| `beforeCreate`  | 组件实例被创建之初，组件的属性生效之前                                |
| `created`       | 组件实例已经完全创建，属性也绑定，但真实 dom 还没有生成，$el 还不可用 |
| `beforeMount`   | 在挂载开始之前被调用：相关的 `render` 函数首次被调用                  |
| `mounted`       | el 被新创建的 `vm.$el` 替换，并挂载到实例上去之后调用该钩子           |
| `beforeUpdate`  | 组件数据更新之前调用，发生在虚拟 DOM 打补丁之前                       |
| `update`        | 组件数据更新之后                                                      |
| `activated`     | `keep-alive` 专属，组件被激活时调用                                   |
| `deactivated`   | `keep-alive` 专属，组件被销毁时调用                                   |
| `beforeDestroy` | 组件销毁前调用                                                        |
| `destroyed`     | 组件销毁后调用                                                        |

**（3）生命周期示意图:**

![`](../image/vue-16471372602231.png)

## Vue 的父子组件生命周期钩子函数执行顺序

Vue 的父组件和子组件生命周期钩子函数执行顺序可以归类为以下 4 部分：

- 加载渲染过程
  父 `beforeCreate` -> 父 `created` -> 父 `beforeMount` -> 子 `beforeCreate` -> 子 `created` -> 子 `beforeMount` -> 子 `mounted` -> 父 `mounted`
- 子组件更新过程
  父 `beforeUpdate` -> 子 `beforeUpdate` -> 子 `updated` -> 父 `updated`
- 父组件更新过程
  父 `beforeUpdate` -> 父 `updated`
- 销毁过程
  父 `beforeDestroy` -> 子 `beforeDestroy` -> 子 `destroyed` -> 父 `destroyed`

## 在哪个生命周期内调用异步请求

可以在钩子函数 `created`、`beforeMount`、`mounted`中进行调用，因为在这三个钩子函数中，data 已经创建，可以将服务端端返回的数据进行赋值。但是本人推荐在 `created`钩子函数中调用异步请求，因为在 `created`钩子函数中调用异步请求有以下优点：

- 能更快获取到服务端数据，减少页面 `loading` 时间；
- ssr 不支持 `beforeMount`、`mounted`钩子函数，所以放在 `created`中有助于一致性；

## 在什么阶段才能访问操作DOM

在钩子函数 `mounted` 被调用前，Vue 已经将编译好的模板挂载到页面上，所以在 `mounted`中可以访问操作 DOM。vue 具体的生命周期示意图可以参见如下，理解了整个生命周期各个阶段的操作，关于生命周期相关的面试题就难不倒你了。

![`](../image/src=http___www.pianshen.com_images_437_5a3625515cb482a42ff49db6a235b035-16471376581592.png)

## 父组件监听到子组件的生命周期

比如有父组件 `Parent` 和子组件 `Child`，如果父组件监听到子组件挂载 `mounted` 就做一些逻辑处理，可以通过以下写法实现：

```js
// Parent.vue
<Child @mounted="doSomething"/>
    
// Child.vue
mounted() {
  this.$emit("mounted");
}
```

以上需要手动通过 `$emit` 触发父组件的事件，更简单的方式可以在父组件引用子组件时通过 `@hook` 来监听即可，如下所示：

```vue
<!-- Parent.vue  -->
<Child @hook:mounted="doSomething" ></Child>

<script>
export default {
  methods: {
   doSomething() {
      console.log('父组件监听到 mounted 钩子函数 ...');
   }
  }
}
</script>
    
<!-- Child.vue -->
<script>
export default {
  mounted(){
   console.log('子组件触发 mounted 钩子函数 ...');
  }, 
}
</script>
<!-- 以上输出顺序为： -->
<!-- 子组件触发 mounted 钩子函数 ... -->
<!-- 父组件监听到 mounted 钩子函数 ...      -->
```

当然 `@hook` 方法不仅仅是可以监听 `mounted`，其它的生命周期事件，例如：`created`，`updated` 等都可以监听。还在第三方库没有`change`回调时有重要作用。

> 补充
> [VNode 生命周期事件](https://v3-migration.vuejs.org/zh/breaking-changes/vnode-lifecycle-events.html)
> 在 `Vue3` 中，事件名附带的是 `vue:` 前缀：`<child-component @vue:updated="onUpdated">`

## keep-alive

`keep-alive` 是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 ，其有以下特性：

- 一般结合路由和动态组件一起使用，用于缓存组件；
- 提供 `include`和 `exclude`属性，两者都支持字符串或正则表达式， `include`表示只有名称匹配的组件会被缓存，`exclude`表示任何名称匹配的组件都不会被缓存 ，其中 `exclude`的优先级比 `include`高；
- 对应两个钩子函数 `activated`和 `deactivated`，当组件被激活时，触发钩子函数 `activated`，当组件被移除时，触发钩子函数 `deactivated`。

```vue
<template>

  <!-- 基本 -->
  <keep-alive>
    <component :is="view"></component>
  </keep-alive>

  <!-- 多个条件判断的子组件 -->
  <keep-alive>
    <comp-a v-if="a > 1"></comp-a>
    <comp-b v-else></comp-b>
  </keep-alive>

  <!-- 和 `<transition>` 一起使用 -->
  <transition>
    <keep-alive>
      <component :is="view"></component>
    </keep-alive>
  </transition>
</template>
```

**keep-alive 原理:**

在具体实现上，`keep-alive` 在内部维护了一个 `key` 数组和一个缓存对象

```js
//keep-alive 内部声明周期函数
created () {
  this.cache = Object.create(null)
  this.keys = []
},
```

`key` 数组记录目前缓存的组件 `key` 值，如果组件没有指定 `key` 值，会自动生成一个唯一的 `key` 值

`cache` 对象会以 `key` 值为键，`vnode` 为值，用于缓存组件对应的虚拟 `DOM`

在 `keep-alive` 的渲染函数中，其基本逻辑是判断当前渲染的 `vnode` 是否有对应的缓存，如果有，会从缓存中读取到对应的组件实例，如果没有就会把它缓存。

当缓存的数量超过`max`设置的数值时，`keep-alive`会移除 `key` 数组中的第一个元素

```js
render () {
  const slot = this.$slots.default; //获取默认插槽
  const vnode = getFirstComponentChild(slot); //得到插槽中第一个组件的vnode
  const name = getComponentName(vnode.componentOptions); //获取组件名字
 
  const { cache, keys } = this; //获取当前的混村内对象和key数组
  const key: ?string = vnode.key == null
      ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
      : vnode.key; //获取组件的key值，如果没有key值，会按照规则自动生成
  if (cache[key]) {
  //有缓存
  //重用组件实例
    vnode.componentInstance = cache[key].componentInstance    
    remove(keys, key); //删除key值
    //将key值加入到数组末尾，这样是为了保证最近使用的组件在数组中靠后，主要是为了方便设置的max值删除很久没使用的组件
    keys.push(key)
  } else {
  //没有缓存的则进行缓存
    cache[key] = vnode
    keys.push(key)
    // prune oldest entry
    if (this.max && keys.length > parseInt(this.max)) {
    //超过最大缓存数量，移除第一个key对应的缓存
      pruneCacheEntry(cache, keys[0], keys, this._vnode)
    }
  }
  vnode.data.keepAlive = true
  return vnode || (slot && slot[0])
}
```

## 组件中 data 为什么是一个函数

为什么组件中的 `data` 必须是一个函数，然后 `return` 一个对象，而 `new Vue` 实例里，`data` 可以直接是一个对象？

```js
// data
data() {
  return {
  message: "子组件",
  childName:this.name
  }
}

// new Vue
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {App}
})
```

因为组件是用来复用的，且 JS 里对象是引用关系，如果组件中 `data` 是一个对象，那么这样作用域没有隔离，子组件中的 `data` 属性值会相互影响，修改其中一个，别的也会被修改

如果组件中 `data` 选项是一个函数，那么每个实例可以维护一份被返回对象的独立的拷贝，组件实例之间的 `data` 属性值不会互相影响

而 `new Vue` 的实例，是不会被复用的，因此不存在引用对象的问题。

## v-model 的原理

我们在 `vue` 项目中主要使用 `v-model` 指令在表单 `input、textarea、select` 等元素上创建双向数据绑定，我们知道 `v-model` 本质上不过是语法糖，`v-model` 在内部为不同的输入元素使用不同的属性并抛出不同的事件：

- `text` 和 `textarea` 元素使用 `value` 属性和 `input` 事件；
- `checkbox` 和 `radio` 使用 `checked` 属性和 `change` 事件；
- `select` 字段将 `value` 作为 `prop` 并将 `change` 作为事件。

以 `input` 表单元素为例：

``` vue
<template>
  <input v-model='something'>
  <!-- 相当于  -->
  <input v-bind:value="something" v-on:input="something = $event.target.value">
</template>
```

如果在自定义组件中，`v-model` 默认会利用名为 `value` 的 `prop` 和名为 `input` 的事件，如下所示：

```vue
<script>
Vue.component('base-checkbox', {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: Boolean
  },
  template: `
    <input
      type="checkbox"
      v-bind:checked="checked"
      v-on:change="$emit('change', $event.target.checked)"
    >
  `
})
</script>

<template>
  <base-checkbox v-model="lovingVue"></base-checkbox>
  <!-- 等价于 -->
  <base-checkbox :checked="lovingVue" @change="val => { lovingVue = val }"></base-checkbox>
  <!-- 每当输入值，传入checked中，触发子组件的change函数，进而通过$emit触发父组件中change函数，实现数据双向绑定 -->
</template>
```

## Vue 组件间通信方式

Vue 组件间通信是面试常考的知识点之一，这题有点类似于开放题，你回答出越多方法当然越加分，表明你对 Vue 掌握的越熟练。Vue 组件间通信只要指以下 3 类通信：父子组件通信、隔代组件通信、兄弟组件通信，下面我们分别介绍每种通信方式且会说明此种方法可适用于哪类组件间通信。

**（1）`props / $emit`  适用 父子组件通信**

这种方法是 Vue 组件的基础，相信大部分同学耳闻能详，所以此处就不举例展开介绍。

**（2）`ref` 与 `$parent / $children` 适用 父子组件通信**

- `ref`：如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例
- `$parent` / `$children`：访问父 / 子实例
- vue3 不存在 $children，可通过 refs 访问

**（3）`$emit / $on`  适用于 父子、隔代、兄弟组件通信**

这种方法通过一个空的 Vue 实例作为中央事件总线（事件中心），用它来触发事件和监听事件，从而实现任何组件间的通信，包括父子、隔代、兄弟组件。

```js
var Event = new Vue();
Event.$emit(事件名,数据);
Event.$on(事件名,data => {});
```

**（4）`$attrs`/`$listeners` 适用于 隔代组件通信**

- `$attrs`：包含了父作用域中不被 prop 所识别 (且获取) 的特性绑定 ( class 和 style 除外 )。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 ( class 和 style 除外 )，并且可以通过 `v-bind="$attrs"` 传入内部组件。通常配合 inheritAttrs 选项一起使用。
- `$listeners`：包含了父作用域中的 (不含 .native 修饰器的)  v-on 事件监听器。它可以通过 `v-on="$listeners"` 传入内部组件
- vue3 两者合并成 $attrs

```vue
<grandfather :data="666"></grandfather>
<father v-bind="$attrs" v-on="$listeners"></father>
<children>{{$props.data/$attrs}}</children>
```

**（5）`provide / inject` 适用于 隔代组件通信**

祖先组件中通过 provider 来提供变量，然后在子孙组件中通过 inject 来获取变量。`provide / inject` API 主要解决了跨级组件间的通信问题，不过它的使用场景，主要是子组件获取上级组件的状态，跨级组件间建立了一种主动提供与依赖注入的关系。

**（6）Vuex  适用于 父子、隔代、兄弟组件通信:**

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。每一个 Vuex 应用的核心就是 store（仓库）。“store” 基本上就是一个容器，它包含着你的应用中大部分的状态 ( state )。

- Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
- 改变 store 中的状态的唯一途径就是显式地提交  (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化。

## Vuex

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。每一个 Vuex 应用的核心就是 store（仓库）。“store” 基本上就是一个容器，它包含着你的应用中大部分的状态 ( state )。

（1）Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。

（2）改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化。

主要包括以下几个模块：

- State：定义了应用状态的数据结构，可以在这里设置默认的初始状态。
- Getter：允许组件从 Store 中获取数据，mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性。
- Mutation：是唯一更改 store 中状态的方法，且必须是同步函数。
- Action：用于提交 mutation，而不是直接变更状态，可以包含任意异步操作。
- Module：允许将单一的 Store 拆分为多个 store 且同时保存在单一的状态树中。

### Vue SSR

> Vue.js 是构建客户端应用程序的框架。默认情况下，可以在浏览器中输出 Vue 组件，进行生成 DOM 和操作 DOM。然而，也可以将同一个组件渲染为服务端的 HTML 字符串，将它们直接发送到浏览器，最后将这些静态标记"激活"为客户端上完全可交互的应用程序。
>
> 即：SSR大致的意思就是vue在客户端将标签渲染成的整个 html 片段的工作在服务端完成，服务端形成的html 片段直接返回给客户端这个过程就叫做服务端渲染。

**服务端渲染 SSR 的优缺点如下：**

**（1）服务端渲染的优点：**

- 更好的 SEO： 因为 SPA 页面的内容是通过 Ajax 获取，而搜索引擎爬取工具并不会等待 Ajax 异步完成后再抓取页面内容，所以在 SPA 中是抓取不到页面通过 Ajax 获取到的内容；而 SSR 是直接由服务端返回已经渲染好的页面（数据已经包含在页面中），所以搜索引擎爬取工具可以抓取渲染好的页面；
- 更快的内容到达时间（首屏加载更快）： SPA 会等待所有 Vue 编译后的 js 文件都下载完成后，才开始进行页面的渲染，文件下载等需要一定的时间等，所以首屏渲染需要一定的时间；SSR 直接由服务端渲染好页面直接返回显示，无需等待下载 js 文件及再去渲染等，所以 SSR 有更快的内容到达时间；

**（2） 服务端渲染的缺点：**

- 更多的开发条件限制： 例如服务端渲染只支持 `beforeCreate`和 `created`两个钩子函数，这会导致一些外部扩展库需要特殊处理，才能在服务端渲染应用程序中运行；并且与可以部署在任何静态文件服务器上的完全静态单页面应用程序 SPA 不同，服务端渲染应用程序，需要处于 `Node.js server` 运行环境；
- 更多的服务器负载：在 Node.js  中渲染完整的应用程序，显然会比仅仅提供静态文件的  server 更加大量占用CPU 资源 (CPU-intensive - CPU 密集)，因此如果你预料在高流量环境 ( high traffic ) 下使用，请准备相应的服务器负载，并明智地采用缓存策略。

如果没有 SSR 开发经验的同学，可以参考本文作者的另一篇 SSR 的实践文章[《Vue SSR 踩坑之旅》](https://juejin.im/post/6844903824956588040)，里面 SSR 项目搭建以及附有项目源码。

## vue-router 路由模式

`vue-router` 有 3 种路由模式：`hash`、`history`、`abstract`，对应的源码如下所示：

```js
switch (mode) {
  case 'history':
    this.history = new HTML5History(this, options.base)
    break
  case 'hash':
    this.history = new HashHistory(this, options.base, this.fallback)
    break
  case 'abstract':
    this.history = new AbstractHistory(this, options.base)
    break
  default:
    if (process.env.NODE_ENV !== 'production') {
      assert(false, `invalid mode: ${mode}`)
    }
}
```

其中，3 种路由模式的说明如下：

- `hash`:  使用 `URL hash` 值来作路由。支持所有浏览器，包括不支持 `HTML5 History Api` 的浏览器；
- `history`:  依赖 `HTML5 History API` 和服务器配置。具体可以查看 `HTML5 History` 模式；
- `abstract`:  支持所有 `JavaScript` 运行环境，如 `Node.js` 服务器端。如果发现没有浏览器的 API，路由会自动强制进入这个模式.

## vue-router 中 hash 和 history 路由模式实现原理

**（1）hash 模式的实现原理:**

早期的前端路由的实现就是基于 `location.hash` 来实现的。其实现原理很简单，`location.hash` 的值就是 URL 中 # 后面的内容。比如下面这个网站，它的`location.hash` 的值为 '#search'：

`https://www.word.com#search`

hash  路由模式的实现主要是基于下面几个特性：

- URL 中 hash 值只是客户端的一种状态，也就是说当向服务器端发出请求时，hash 部分不会被发送；
- hash 值的改变，都会在浏览器的访问历史中增加一个记录。因此我们能通过浏览器的回退、前进按钮控制hash 的切换；
- 可以通过 a 标签，并设置 href 属性，当用户点击这个标签后，URL 的 hash 值会发生改变；或者使用  JavaScript 来对 `location.hash` 进行赋值，改变 URL 的 hash 值；
- 我们可以使用 **hashchange** 事件来监听 hash 值的变化，从而对页面进行跳转（渲染）。

**（2）history 模式的实现原理:**

HTML5 提供了 `History API` 来实现 URL 的变化。其中做最主要的 API 有以下两个：**history.pushState() 和 history.repalceState( )**。这两个 API 可以在不进行刷新的情况下，操作浏览器的历史纪录。唯一不同的是，前者是新增一个历史记录，后者是直接替换当前的历史记录，如下所示：

```js
window.history.pushState(null, null, path);
window.history.replaceState(null, null, path);
```

`history` 路由模式的实现主要基于存在下面几个特性：

- `pushState`和 `replaceState`两个 API 来操作实现 URL 的变化 ；
- 我们可以使用 `popstate`事件来监听 url 的变化，从而对页面进行跳转（渲染）；
- `history.pushState()` 或 `history.replaceState()` 不会触发 `popstate`事件，这时我们需要手动触发页面跳转（渲染）。

## MVVM

`Model–View–ViewModel` （MVVM） 是一个软件架构设计模式，由微软 WPF 和 Silverlight 的架构师 Ken Cooper 和 Ted Peters 开发，是一种简化用户界面的事件驱动编程方式。由 John Gossman（同样也是 WPF 和 Silverlight 的架构师）于2005年在他的博客上发表

MVVM 源自于经典的 `Model–View–Controller`（MVC）模式  ，MVVM 的出现促进了前端开发与后端业务逻辑的分离，极大地提高了前端开发效率，MVVM 的核心是 ViewModel 层，它就像是一个中转站（value converter），负责转换 `Model` 中的数据对象来让数据变得更容易管理和使用，该层向上与视图层进行双向数据绑定，向下与 `Model` 层通过接口请求进行数据交互，起呈上启下作用。如下图所示：

![img](../image/mvvm.png)

（1）`View` 层

`View` 是视图层，也就是用户界面。前端主要由 HTML 和 CSS 来构建 。

（2）`Model` 层

`Model` 是指数据模型，泛指后端进行的各种业务逻辑处理和数据操控，对于前端来说就是后端提供的 api 接口。

（3）`ViewModel` 层

`ViewModel` 是由前端开发人员组织生成和维护的视图数据层。在这一层，前端开发者对从后端获取的 `Model` 数据进行转换处理，做二次封装，以生成符合 `View` 层使用预期的视图数据模型。需要注意的是 `ViewModel` 所封装出来的数据模型包括视图的状态和行为两部分，而 `Model` 层的数据模型是只包含状态的，比如页面的这一块展示什么，而页面加载进来时发生什么，点击这一块发生什么，这一块滚动时发生什么这些都属于视图行为（交互），视图状态和行为都封装在了 `ViewModel` 里。这样的封装使得 `ViewModel` 可以完整地去描述 `View` 层。

MVVM 框架实现了双向绑定，这样 `ViewModel` 的内容会实时展现在 `View` 层，前端开发者再也不必低效又麻烦地通过操纵 DOM 去更新视图，MVVM 框架已经把最脏最累的一块做好了，我们开发者只需要处理和维护 ViewModel，更新数据视图就会自动得到相应更新。这样 `View` 层展现的不是 `Model` 层的数据，而是 `ViewModel` 的数据，由 `ViewModel` 负责与 `Model` 层交互，这就完全解耦了 `View` 层和 `Model` 层，这个解耦是至关重要的，它是前后端分离方案实施的重要一环。

我们以下通过一个 Vue 实例来说明 MVVM 的具体实现，有 Vue 开发经验的同学应该一目了然：

（1）View 层

```vue
<template>
  <div id="app">
    <p>{{message}}</p>
    <button v-on:click="showMessage()">Click me</button>
  </div>
</template>
```

（2）ViewModel 层

```js
var app = new Vue({
  el: '#app',
  data: {  // 用于描述视图状态   
    message: 'Hello Vue!', 
  },
  methods: {  // 用于描述视图行为  
    showMessage(){
      let vm = this;
      alert(vm.message);
    }
  },
  created(){
    let vm = this;
    // Ajax 获取 Model 层的数据
    ajax({
      url: '/your/server/data/api',
      success(res){
        vm.message = res;
      }
    });
  }
})
```

（3） Model 层

```js
{
  "url": "/your/server/data/api",
  "res": {
    "success": true,
    "name": "xxxxx",
    "domain": "www.xxxx.com"
  }
}
```

![img](../image/v2-f32a2759e4f734b9be436a2e912bd215_720w.jpg)

### vue 不是 MVVM模式？

`Vue.js` 并没有完全遵循 `MVVM` 模型，可以使用 `ref` 来获取组件实例，从而修改视图。

## 数据双向绑定

Vue 数据双向绑定主要是指：数据变化更新视图，视图变化更新数据，如下图所示：

![2.png](../image/16c4a3ce0c045693tplv-t2oaga2asx-zoom-in-crop-mark1304000.webp)

即：

- 输入框内容变化时，Data 中的数据同步变化。即 `View => Data` 的变化。
- Data 中的数据变化时，文本节点的内容同步变化。即 Data => View 的变化。

其中，View 变化更新 Data ，可以通过事件监听的方式来实现，所以 Vue 的数据双向绑定的工作主要是如何根据 Data 变化更新 View。

Vue 主要通过以下 4 个步骤来实现数据双向绑定的：

实现一个监听器 `Observer`：对数据对象进行遍历，包括子属性对象的属性，利用 `Object.defineProperty()` 对属性都加上 `setter` 和 `getter`。这样的话，给这个对象的某个值赋值，就会触发 `setter`，那么就能监听到了数据变化。

实现一个解析器 `Compile`：解析 Vue 模板指令，将模板中的变量都替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，调用更新函数进行数据更新。

实现一个订阅者 `Watcher`：`Watcher` 订阅者是 `Observer` 和 `Compile` 之间通信的桥梁 ，主要的任务是订阅 `Observer` 中的属性值变化的消息，当收到属性值变化的消息时，触发解析器 `Compile` 中对应的更新函数。

实现一个订阅器 Dep：订阅器采用 发布-订阅 设计模式，用来收集订阅者 `Watcher`，对监听器 `Observer` 和 订阅者 `Watcher` 进行统一管理。

以上四个步骤的流程图表示如下，如果有同学理解不大清晰的，可以查看作者专门介绍数据双向绑定的文章[《0 到 1 掌握：Vue 核心之数据双向绑定》](https://juejin.im/post/6844903903822086151)，有进行详细的讲解、以及代码 demo 示例。

![3.png](../image/16c4a3ce0bcb0d91tplv-t2oaga2asx-zoom-in-crop-mark1304000.webp)

## 实现对象和数组的监听

如果被问到 Vue 怎么实现数据双向绑定，大家肯定都会回答 通过 `Object.defineProperty()` 对数据进行劫持，但是  `Object.defineProperty()` 只能对属性进行数据劫持，不能对整个对象进行劫持，同理无法对数组进行劫持，但是我们在使用 Vue 框架中都知道，Vue 能检测到对象和数组（部分方法的操作）的变化，那它是怎么实现的呢？我们查看相关代码如下：

```js
/**
 * Observe a list of Array items.
 */
observeArray (items: Array<any>) {
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])  // observe 功能为监测数据的变化
  }
}

/**
 * 对属性进行递归遍历
 */
let childOb = !shallow && observe(val) // observe 功能为监测数据的变化
```

`vue2` 通过循环遍历对象和数组来劫持每个项，`$set` 则补充对新增属性的处理

通过以上 `Vue` 源码部分查看，我们就能知道 `Vue` 框架是通过遍历数组 和递归遍历对象，从而达到利用  `Object.defineProperty()` 也能对对象和数组（部分方法的操作）进行监听。

## Proxy 与 Object.defineProperty 对比

**Proxy 的优势如下:**

- `Proxy` 可以直接监听对象而非属性；
- `Proxy` 可以直接监听数组的变化；
- `Proxy` 有多达 13 种拦截方法,不限于 apply、ownKeys、deleteProperty、has 等等是 `Object.defineProperty` 不具备的；
- `Proxy` 返回的是一个新对象,我们可以只操作新的对象达到目的,而 `Object.defineProperty` 只能遍历对象属性直接修改；
- `Proxy` 作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利；

**Object.defineProperty 的优势如下:**

- 兼容性好，支持 IE9，而 `Proxy` 的存在浏览器兼容性问题,而且无法用 polyfill 磨平，因此 Vue 的作者才声明需要等到下个大版本( 3.0 )才能用 `Proxy` 重写。

## vm.$set() 解决对象新增属性不能响应

受现代 `JavaScript` 的限制 ，`Vue` **无法检测到对象属性的添加或删除**。由于 `Vue` 会在初始化实例时对属性执行 `getter/setter` 转化，所以属性必须在 `data` 对象上存在才能让 `Vue` 将它转换为响应式的。但是 `Vue` 提供了 `Vue.set (object, propertyName, value) / vm.$set (object, propertyName, value)`  来实现为对象添加响应式属性，那框架本身是如何实现的呢？

我们查看对应的 `Vue` 源码：`vue/src/core/instance/index.js`

```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  // target 为数组  
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 修改数组的长度, 避免索引>数组长度导致splcie()执行有误
    target.length = Math.max(target.length, key)
    // 利用数组的splice变异方法触发响应式  
    target.splice(key, 1, val)
    return val
  }
  // key 已经存在，直接修改属性值  
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  // target 本身就不是响应式数据, 直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 对属性进行响应式处理
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

我们阅读以上源码可知，`vm.$set` 的实现原理是：

- 如果目标是数组，直接使用数组的 **splice** 方法触发相应式；
- 如果目标是对象，会先判读属性是否存在、对象是否是响应式，最终如果要对属性进行响应式处理，则是通过调用 **defineReactive** 方法进行响应式处理（ `defineReactive`方法就是  `Vue` 在初始化对象时，给对象属性采用 `Object.defineProperty` 动态添加 `getter` 和 `setter` 的功能所调用的方法）

## 虚拟 DOM 的优缺点

**优点：**

- **保证性能下限：** 框架的虚拟 `DOM` 需要适配任何上层 `API` 可能产生的操作，它的一些 `DOM` 操作的实现必须是普适的，所以它的性能并不是最优的；但是比起粗暴的 `DOM` 操作性能要好很多，因此框架的虚拟 `DOM` 至少可以保证在你不需要手动优化的情况下，依然可以提供还不错的性能，即保证性能的下限；
- **无需手动操作 DOM：** 我们不再需要手动去操作 DOM，只需要写好 `View-Model` 的代码逻辑，框架会根据虚拟 `DOM` 和 数据双向绑定，帮我们以可预期的方式更新视图，极大提高我们的开发效率；
- **跨平台：** 虚拟 `DOM` 本质上是 `JavaScript` 对象,而 `DOM` 与平台强相关，相比之下虚拟 `DOM` 可以进行更方便地跨平台操作，例如服务器渲染、`weex` 开发等等。

**缺点:**

- **无法进行极致优化：** 虽然虚拟 `DOM` + 合理的优化，足以应对绝大部分应用的性能需求，但在一些性能要求极高的应用中虚拟 `DOM` 无法进行针对性的极致优化。比如：`react` 的 `diff` 算法需要对整个虚拟树遍历，虽然引入了时间切片 `fiber`，但仍然消耗性能；`vue` 同理。这也是无虚拟DOM 框架的核心优势，但也仅限于小项目。

## 虚拟 DOM 实现原理

虚拟 DOM 的实现原理主要包括以下 3 部分：

- 用 JavaScript 对象模拟真实 DOM 树，对真实 DOM 进行抽象；
- diff 算法 — 比较两棵虚拟 DOM 树的差异；
- patch 算法 — 将两个虚拟 DOM 对象的差异应用到真正的 DOM 树。

如果对以上 3 个部分还不是很了解的同学，可以查看本文作者写的另一篇详解虚拟 DOM 的文章《[深入剖析：Vue核心之虚拟DOM](https://juejin.im/post/6844903895467032589#heading-14)》

## Vue 中的 key 有什么作用

key 是为 Vue 中 vnode 的唯一标记，通过这个 key，我们的 diff 操作可以更准确、更快速。Vue 的 diff 过程可以概括为：oldCh 和 newCh 各有两个头尾的变量 `oldStartIndex`、`oldEndIndex` 和 `newStartIndex`、`newEndIndex`，它们会新节点和旧节点会进行两两对比，即一共有4种比较方式：`newStartIndex` 和`oldStartIndex` 、`newEndIndex` 和  `oldEndIndex` 、`newStartIndex` 和 `oldEndIndex` 、`newEndIndex` 和 `oldStartIndex`，如果以上 4 种比较都没匹配，如果设置了key，就会用 key 再进行比较，在比较的过程中，遍历会往中间靠，一旦 StartIdx > EndIdx 表明 oldCh 和 newCh 至少有一个已经遍历完了，就会结束比较。具体有无 key 的 diff 过程，可以查看作者写的另一篇详解虚拟 DOM 的文章《[深入剖析：Vue核心之虚拟DOM](https://juejin.im/post/6844903895467032589#heading-14)》

所以 Vue 中 key 的作用是：key 是为 Vue 中 vnode 的唯一标记，通过这个 key，我们的 diff 操作可以更准确、更快速

**更准确**：因为带 key 就不是就地复用了，在 sameNode 函数 `a.key === b.key` 对比中可以避免就地复用的情况。所以会更加准确。

**更快速**：利用 key 的唯一性生成 map 对象来获取对应节点，比遍历方式更快，源码如下：

```js
function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}
```

[v-for 绑定key值,不建议使用index (原因详解)](https://blog.csdn.net/weixin_46174785/article/details/107265365)

> **key 不能使用 index 作为值**

**前提:**

在使用非文本节点的组件，且这个组件没有依赖于响应式的props，那么此时对于列表的删除操作会导致视图错乱。

**比如:**

问题源于key的重复，假设你的列表有两行，当你删了第一行，那么第二行的key就变成了第一行的key，这两个key是相同的。基于VirtualDOM的库会把key相同的组件认作同一个组件，因而不会去更新视图。

也就是说，你删了第一行，本来预期的第二行变成了第一行，结果变成因为key相同，最后第一行保持不变，反而是第二行消失了。

**为什么我没有复现:**

大部分时候我们即使使用index作为key，不会复现这个问题，这好像与我们上述分析不符。但是事实上，“使用index作为key并且不会出问题”这种场景，其实过程是这样的：

第一步：通过修改数据删除第一行，数据变化引起vue去更新视图，更新的过程中发现key相同，最终第一行保持不变，反而是第二行消失。这是第一次render。
第二步：第一行的VirtualDOM的确没有变，但是第一行的组件的props变了，由原来第一行的props，变成了第二行的props，由于props变化，第一行的组件需要使用新的props更新视图，最终第一行变成了第二行的样子。这是第二次render。

也就是说，“使用index作为key并且不会出问题”这种场景，是因为render了两次，才最终达成了视图的正确更新。

## 优化 Vue 项目

如果没有对 Vue 项目没有进行过优化总结的同学，可以参考本文作者的另一篇文章[《 Vue 项目性能优化 — 实践指南 》](https://juejin.im/post/6844903913410314247)，文章主要介绍从 3 个大方面，22 个小方面详细讲解如何进行 Vue 项目的优化。

**（1）代码层面的优化:**

- `v-if` 和 `v-show` 区分使用场景
- `computed`和 `watch`区分使用场景
- v-for 遍历必须为 item 添加 key，且避免同时使用 v-if
- 长列表性能优化
- 事件的销毁
- 图片资源懒加载
- 路由懒加载
- 第三方插件的按需引入
- 优化无限列表性能
- 服务端渲染 SSR or 预渲染

**（2）Webpack 层面的优化:**

- Webpack 对图片进行压缩
- 减少 ES6 转为 ES5 的冗余代码
- 提取公共代码
- 模板预编译
- 提取组件的 CSS
- 优化 SourceMap
- 构建结果输出分析
- Vue 项目的编译优化

**（3）基础的 Web 技术的优化:**

- 开启 gzip 压缩
- 浏览器缓存
- CDN 的使用
- 使用 Chrome Performance 查找性能瓶颈

## vue3.0 特性

Vue 3.0 正走在发布的路上，Vue 3.0 的目标是让 Vue 核心变得更小、更快、更强大，因此 Vue 3.0 增加以下这些新特性：

**（1）监测机制的改变:**

3.0 将带来基于代理 Proxy 的 observer 实现，提供全语言覆盖的反应性跟踪。这消除了 Vue 2 当中基于 `Object.defineProperty` 的实现所存在的很多限制：

- 只能监测属性，不能监测对象
- 检测属性的添加和删除；
- 检测数组索引和长度的变更；
- 支持 `Map、Set、WeakMap` 和 `WeakSet`。

新的 `observer`还提供了以下特性：

- 用于创建 `observable`的公开 API。这为中小规模场景提供了简单轻量级的跨组件状态管理解决方案。
- 默认采用惰性观察。在 2.x 中，不管反应式数据有多大，都会在启动时被观察到。如果你的数据集很大，这可能会在应用启动时带来明显的开销。在 3.x 中，只观察用于渲染应用程序最初可见部分的数据。
- 更精确的变更通知。在 2.x 中，通过 `Vue.set` 强制添加新属性将导致依赖于该对象的 watcher 收到变更通知。在 3.x 中，只有依赖于特定属性的 watcher 才会收到通知。
- 不可变的 `observable`：我们可以创建值的“不可变”版本（即使是嵌套属性），除非系统在内部暂时将其“解禁”。这个机制可用于冻结 prop 传递或 Vuex 状态树以外的变化。
- 更好的调试功能：我们可以使用新的 `renderTracked`和 `renderTriggered`钩子精确地跟踪组件在什么时候以及为什么重新渲染。

**（2）模板:**

模板方面没有大的变更，只改了作用域插槽，2.x 的机制导致作用域插槽变了，父组件会重新渲染，而 3.0 把作用域插槽改成了函数的方式，这样只会影响子组件的重新渲染，提升了渲染的性能。

同时，对于 `render`函数的方面，vue3.0 也会进行一系列更改来方便习惯直接使用 api 来生成 vdom 。

**（3）对象式的组件声明方式:**

`vue2.x`中的组件是通过声明的方式传入一系列 `option`，和 `TypeScript`的结合需要通过一些装饰器的方式来做，虽然能实现功能，但是比较麻烦。3.0 修改了组件的声明方式，改成了类式的写法，这样使得和 `TypeScript`的结合变得很容易。

此外，vue 的源码也改用了 `TypeScript`来写。其实当代码的功能复杂之后，必须有一个静态类型系统来做一些辅助管理。现在 `vue3.0` 也全面改用 `TypeScript`来重写了，更是使得对外暴露的 api 更容易结合 `TypeScript`。静态类型系统对于复杂代码的维护确实很有必要。

**（4）其它方面的更改:**

`vue3.0` 的改变是全面的，上面只涉及到主要的 3 个方面，还有一些其他的更改：

- 支持自定义渲染器，从而使得 weex 可以通过自定义渲染器的方式来扩展，而不是直接 fork 源码来改的方式。
- 支持 `Fragment`（多个根节点）和 Portal（在 dom 其他部分渲染组建内容）组件，针对一些特殊的场景做了处理。
- 基于 `treeshaking`优化，提供了更多的内置功能。

## $nextTick原理

所有同步任务都在主线程上执行的，形成一个执行栈。主线程外，会存在一个任务队列，只要异步任务有结果，就在任务队列中放置一个事件。当执行栈中的所有同步任务执行完后，就会读取去任务队列。那么对应的异步任务，会结束等待状态，进入执行栈。 `主线程不断重复第三步` 这里之线程的执行过程是一个`tick`，而所有的异步结果都是通过任务队列来调度。`Event Loop`分为宏任务和微任务，无论是执行宏任务还是微任务，完成后都会进入到下一个`tick`，并且在两个 `tick`之间进程 UI 渲染 由于`Vue DOM` 更新是异步执行的，即修改数据时，视图不会立即更新，而是监听数据变化，并缓存在同一事件循环中，等同一数据循环中的所有数据变化完成之后，在同一进行视图更新。为了确保得到更新后的 `DOM`，所以设置了`Vue.nextTick()`方法（设置了异步函数）

```js
// 修改数据
vm.msg = 'Hello'
// DOM 还没有更新
Vue.nextTick(function () {
  // DOM 更新了
})

// 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
Vue.nextTick()
  .then(function () {
    // DOM 更新了
  })
```

## Object.defineProperty

1. `configurable`: `false` 时，不能删除当前属性，且不能重新配置当前属性的描述符(有一个小小的意外：可以把 `writable`的状态由 true 改为 false ,但是无法由 false 改为 true) ,但是在 `writable: true` 的情况下，可以改变 `value`的值。
2. `configurable: true`时，可以删除当前属性，可以配置当前属性所有描述符。
3. `value`和 `get`是同一个作用，只能同时用一个。
4. `writable`和 `set`是同一个作用，用一个。
5. `get、set` 与 `value、writable` 不能同时出现，会报错。

```js
function observe(obj, key, val, method) {
  Object.defineProperty(obj, key, {
    configurable: true, //描述属性是否配置，以及可否删除
    enumerable: true,  //描述属性是否会出现在for in 或者 Object.keys()的遍历中
    // writable: true,//属性的值是否可以被重写。设置为true可以被重写；设置为false，不能被重写。
    //value: val,
    get() {
      console.log("get", val);
      return val
    },
    set(newValue) {
      console.log("set", newValue);
      val = newValue
    }
  })
}

let arr = [1, 2, 3]
let obj = {
  name: "man",
  age: "18"
}
arr.forEach((item, index) => {
  observe(arr, index, item)
});

for (const key in obj) {
  observe(obj, key, obj[key])
}

/*
(3) [(...), (...), (...)]
0: 1
1: 2
2: 3
length: 3
get 0: ƒ get()
set 0: ƒ set(newValue)
get 1: ƒ get()
set 1: ƒ set(newValue)
get 2: ƒ get()
set 2: ƒ set(newValue)
__proto__: Array(0)
*/
```

对方法进行挟持

```js
function observe(obj, key, value) {
  Object.defineProperty(obj, key, {
    value() {
      value.bind(this, ...arguments)()
      return this.length
    }
  })
}

let arrType = ["push", "pop", "shift", "unshift", "splice"]

arrType.forEach(item => {
  observe(Array.prototype, item, Array.prototype[item])
});
```

## Proxy

```js
let p = new Proxy(target, handler);
```

语法非常简单,只有两个参数，很好理解

- target：用Proxy包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler： 一个对象，其属性是当执行一个操作时定义代理的行为的函数。

1. `handler.getPrototypeOf()`
    在读取代理对象的原型时触发该操作，比如在执行 `Object.getPrototypeOf(proxy)` 时。
2. `handler.setPrototypeOf()`
    在设置代理对象的原型时触发该操作，比如在执行 `Object.setPrototypeOf(proxy, null)` 时。
3. `handler.isExtensible()`
    在判断一个代理对象是否是可扩展时触发该操作，比如在执行 `Object.isExtensible(proxy)` 时。
4. `handler.preventExtensions()`
    在让一个代理对象不可扩展时触发该操作，比如在执行 `Object.preventExtensions(proxy)` 时。
5. `handler.getOwnPropertyDescriptor()`
    在获取代理对象某个属性的属性描述时触发该操作，比如在执行 `Object.getOwnPropertyDescriptor(proxy, “foo”)` 时。
6. `handler.defineProperty()`
    在定义代理对象某个属性时的属性描述时触发该操作，比如在执行 `Object.defineProperty(proxy, “foo”, {})` 时。
7. `handler.has()`
    在判断代理对象是否拥有某个属性时触发该操作，比如在执行 `“foo” in proxy` 时。
8. `handler.get()`
    在读取代理对象的某个属性时触发该操作，比如在执行 `proxy.foo` 时。
9. `handler.set()`
    在给代理对象的某个属性赋值时触发该操作，比如在执行 `proxy.foo = 1` 时。
10. `handler.deleteProperty()`
    在删除代理对象的某个属性时触发该操作，比如在执行 `delete proxy.foo` 时。
11. `handler.ownKeys()`
    在获取代理对象的所有属性键时触发该操作，比如在执行 `Object.getOwnPropertyNames(proxy)` 时。
12. `handler.apply()`
    当目标对象为函数，且被调用时触发。
13. `handler.construct()`
    在给一个目标对象为构造函数的代理对象构造实例时触发该操作，比如在执行`new proxy()` 时。

```js
let test = {
  name: "小红"
};
test = new Proxy(test, {
  get(target, key) {
    console.log('获取了getter属性');
    return target[key];
  }
});
console.log(test.name);
```

## v-if 加载同名组件

当`v-if`加载同名组件时，只有第一个组件的绑定数据会被加载，若`v-if`切换的是逻辑复杂的控件时，切换时不重新渲染极易出问题。
需要给要重新渲染的控件添加一个`key`属性，来唯一标识该控件，被`key`标识后会重新渲染，使用`key='1',key='2'···`即可。

## v-show

使用`v-show`会有数据缓存

## diff 算法

vue和react的`diff`算法，都是忽略跨级比较，只做同级比较。vue `diff`时调动patch函数，参数是vnode和oldVnode，分别代表新旧节点。

1. vue比对节点，当节点元素类型相同，但是className不同，认为是不同类型元素，删除重建，而react会认为是同类型节点，只是修改节点属性

2. vue的列表比对，采用从两端到中间的比对方式，而react则采用从左到右依次比对的方式。当一个集合，只是把最后一个节点移动到了第一个，react会把前面的节点依次移动，而vue只会把最后一个节点移动到第一个。总体上，vue的对比方式更高效。

![img](../image/1210947-20190627184317535-836081536.png)

![img](../image/1210947-20190627184531480-1654910001.png)

## CDN

参考链接[CDN](https://www.jianshu.com/p/3d6b9a5a4e8a)

## 双向数据绑定

```vue
//父组件
<child :showDrawlPassword.sync="show" />

//子组件
<div @click="click"></div>
<script>
export default {
  methods: {
    click(){
     this.$emit("update:showDrawlPassword", false); //双向数据绑定
  }
  },
};
</script>
```

使用 `.sync`与`this.$emit("update:[name]", [value])`

```vue
<script>
Vue.component('my-checkbox', {
  model: {
    prop: 'checked', //绑定的变量
    event: 'change' // 绑定的事件
  },
// 触发 change 事件即可
})
</script>
<template>
  <my-checkbox v-model="foo" value="some value"></my-checkbox>

  <!-- 相当于 -->
  <my-checkbox
    :checked="foo"
    @change="val => { foo = val }"
    value="some value">
  </my-checkbox>
</template>
```

## slot 数据传递

**默认插槽:**

```vue
<!-- aa.vue -->
<div>
    <slot>222</slot> 
</div>

<!-- 111 可以带默认内容 -->
<aa>111</aa> 

<!-- 666 -->
<aa></aa> 
```

**具名插槽:**

```vue
<!-- aa.vue -->
<div>
    <slot name="one">222</slot> 
</div>

<template>
  <aa>
    111
    <template v-slot:one> //具名插槽-对应渲染 #name 是缩写
      <h1>Here might be a page title</h1>
    </template>
  </aa>
</template>
```

**作用域插槽:**

```vue
<!-- current-use -->
<template>
  <span>
    <slot v-bind:user="user">
      {{ user.lastName }}
    </slot>
  </span>
</template>

<template>
  <current-user>
    <template v-slot:default="slotProps">
      {{ slotProps.user.firstName }}
    </template>
  </current-user>
</template>
```

## inheritAttrs

如果你**不**希望组件的根元素继承 attribute，你可以在组件的选项中设置 `inheritAttrs: false`

但是 `class` 和 `style` 不属于 `$attrs`，仍然会应用到组件的根元素

像这样使用时：

```html
<my-component id="my-id" class="my-class"></my-component>
```

将生成以下 HTML：

```html
<label class="my-class">
  <input type="text" id="my-id" />
</label>
```

`inheritAttrs: false` 对`class/style` 也生效，样式生效

## 自定义指令

```js
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})

//如果想注册局部指令，组件中也接受一个 directives 的选项：
directives: {
  focus: {
    // 指令的定义
    inserted: function (el) {
      el.focus()
    }
  }
}
```

> 钩子函数

- `bind`：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- `inserted`：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- `update`：所在组件的 VNode 更新时调用，**但是可能发生在其子 VNode 更新之前**。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。

- `componentUpdated`：指令所在组件的 VNode **及其子 VNode** 全部更新后调用。
- `unbind`：只调用一次，指令与元素解绑时调用。

```js
Vue.directive('demo', {
  bind: function (el, binding, vnode) {
    var s = JSON.stringify
    el.innerHTML = ...
  }
})
```

> 钩子函数参数

- `el`：指令所绑定的元素，可以用来直接操作 DOM。

- `binding`：一个对象，包含以下 `property`：
  - `name`：指令名，不包括 `v-` 前缀
  - `value`：指令的绑定值，例如：`v-my-directive="1 + 1"` 中，绑定值为 `2`
  - `oldValue`：指令绑定的前一个值，仅在 `update` 和 `componentUpdated` 钩子中可用。无论值是否改变都可用
  - `expression`：字符串形式的指令表达式。例如 `v-my-directive="1 + 1"` 中，表达式为 `"1 + 1"`
  - `arg`：传给指令的参数，可选。例如 `v-my-directive:foo` 中，参数为 `"foo"`。
  - `modifiers`：一个包含修饰符的对象。例如：`v-my-directive.foo.bar` 中，修饰符对象为 `{ foo: true, bar: true }`
  
- `vnode`：Vue 编译生成的虚拟节点

- `oldVnode`：上一个虚拟节点，仅在 `update` 和 `componentUpdated` 钩子中可用

> 除了 `el` 之外，其它参数都应该是只读的，切勿进行修改。如果需要在钩子之间共享数据，建议通过元素的 [`dataset`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset) 来进行。

## attrs 和 listeners

`$attrs​`包含属性，当没有 `prop`中的数据，`prop`是绑定在实例上的，即`this.xxx`

`v-model`的值默认是 `value`，可以超过 `model`选项命名属性名

`$listeners`包含方法

## provide / inject

```js
// 父级组件提供 'foo'
{
  provide: {
    foo: 'bar'
  },
}

// 子组件注入 'foo'
{
  inject: ['foo'],
  created () {
    console.log(this.foo) // => "bar"
}
```

## vue实例中的data与组件中的data的区别

一般简单Vue实例(常见教程视频中)

```js
new Vue({
  el: "#id",
  data: {
    message: "Vue实例"
  }
});
```

在组件化的项目中(我们在公司接触的项目)
一般会这么写

```js
export default {
  name: "home";
    data() {
      return {
        message: "组件化项目一般这样写~",
        ......
      }
  }
}
```

> 两者区别

在大型项目中 data 需要使用 return 来返回数据，不用 return 这种方式返回的数据在 vue 实例中是全局可见的，容易造成数据污染。使用 return 返回的数据仅在组件内可见，对其他组件不生效。
