# vue 样式隔离
Vue组件之间没有做到样式隔离，Vue中的样式隔离，是通过scoped属性来实现的。当在<style>标签上使用scoped属性时。
基本原理概括为以下几个步骤：
1. 为当前组件模板的所有DOM节点添加相同的attribute，添加的属性与其他的scope不重复，data属性(形如：data-v-123)来表示他的唯一性。
2. 在每句css选择器的末尾（编译后的生成的css语句）加一个当前组件的data属性选择器（如.box input[data-v-123]）来私有化样式
3. 如果组件内部包含有其他组件，只会给其他组件的最外层标签加上当前组件的data属性

```vue
<template>
  <div class="example">This is an example</div>
</template>

<style scoped>
.example {
  color: blue;
}
</style>
```

```vue
<template>
  <div class="example" data-v-21e5b78>This is an example</div>
</template>

<style scoped>
.example[data-v-21e5b78] {
  color: blue;
}
</style>
```

# vue 响应式变量打印小技巧
打开调试控制台，找到右上角控制台设置，在偏好设置里找到控制台分类，在这个分类最后一个，勾选自定义格式设置工具
![打印效果](../image/17229091211238.png)

有趣的是，可以清楚的看出 ref 在处理对象是，底层是使用 reactive 处理的

# 动态修改 css 值
方法如下
1. 通过在行内绑定变量
```vue
<script setup>
import { ref } from 'vue'
const color = ref('red')
</script>

<template>
  <p :style="`color: ${color}`">hello</p>
</template>
```
2. 修改绑定的 class 
3. 使用 v-bind
```vue
<script setup>
import { ref } from 'vue'
const theme = ref({
    color: 'red',
})
</script>

<template>
  <p>hello</p>
</template>

<style scoped>
p {
  color: v-bind('theme.color');
}
</style>
```

# vue 双向绑定对象
在一些复杂表单页面要抽离组件，但是子组件要关联到父组件的变量，可以像下面这么写
```vue
<script setup>
import { ref } from 'vue'
const data = ref({
    color: 'red',
})
</script>

<template>
  <child v-modal:data="data" />
</template>
```
```vue
<script setup>
import { ref, computed } from 'vue'
const emit = defineEmits<{
  (_event: 'update:data', _data: any): void
}>()
const props = defineProps({
  data:{
    type: Object,
  }   
})
const dataCom = computed({
  get:()=>props.data,
  // 但是有个问题，实际上这个set是不能监听触发的，但是依然是可以双向绑定，ref 的监听是深层次的
  // 3.4+版本可以看一下 defineModel 
  set:(e)=>emits('update:data',e)
})
// 效果相当于
/**
 * const dataCom = computed(()=>props.data)
 */
</script>

<template>
  <child v-modal:data="data" />
</template>
```

# vue 写官网seo优化 vite-plugin-seo-prerender
原理是用 puppeteer 生成静态页面，但是在访问时会带上 / 后缀，
如 /home/，后续在切换路径时，会变成 /home/xxxx，导致路由无法解析，
原因是，生成的目录是路由目录，nginx做了 301 的转发

解决方法：在守卫钩子做下重定向
```js
router.beforeEach((to, from, next) => {
  // 目前只有一级路由，先简单判断
  if (to.path.startsWith("/") && to.path.endsWith("/")) {
    return next({ name: to.name, query: to.query });
  }
  return next();
});
```

# 自定义指令做按钮权限
一般是判断有没有权限，然后用 removeChild 方法删除子节点，但是会有弊端，在特定情况下会有问题
``` vue
// 前面是虚拟节点
<template v-if="xxx">
  <a v-if="xxx" v-permission="xxx">xxx</a>
</template>
// 后面 v-if+自定义指令
<a v-if="xxx" v-permission="xxx">xxx</a>
```
会报错：TypeError: Cannot read properties of null (reading 'emitsOptions') at shouldUpdateComponent

补充：用来判断组件也是不行的，组件内部的初始化事件还会执行（remove了节点，但是在vue里面还是存在的）

# vue3 createvnode 和 h 区别
两者都是用来创建虚拟节点的，使用上也差别不大

从源码上可以看到 h 是基于 createvnode 实现的，在使用上是做了优化的
```ts
// Actual implementation
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // single vnode without props
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      // props without children
      return createVNode(type, propsOrChildren)
    } else {
      // omit props
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
```

# vue 依赖收集
todo

[Vue2与Vue3响应式原理与依赖收集详解](https://juejin.cn/post/7202454684657107005)