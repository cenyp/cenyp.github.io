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
  // 实际上这个set是不能监听触发的，但是依然是可以双向绑定，ref 的监听是深层次的
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