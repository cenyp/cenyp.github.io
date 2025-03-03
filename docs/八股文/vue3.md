# vue3

## 内置组件

### Transition / TransitionGroup

[Transition](https://cn.vuejs.org/api/built-in-components#transition) 为单个元素或组件提供动画过渡效果。

[TransitionGroup](https://cn.vuejs.org/api/built-in-components#TransitionGroup) 为列表中的多个元素或组件提供过渡效果。

### KeepAlive

[KeepAlive](https://cn.vuejs.org/api/built-in-components#keepalive) 缓存包裹在其中的动态切换组件。

常用于做 `ERP` 缓存页面

```vue
<template>
  <keep-alive :include="cachedPages">
    <router-view />
  </keep-alive>
</template>

<script>
export default {
  data() {
    return {
      cachedPages: [],  // 用于存储需要缓存的页面
    };
  },
  watch: {
    $route(to, from) {
      // 如果当前页面不是缓存页面，则添加到缓存
      if (!this.cachedPages.includes(to.name)) {
        this.cachedPages.push(to.name);
      }
    },
  },
};
</script>
```

### Teleport

[Teleport](https://cn.vuejs.org/api/built-in-components#Teleport) 将其插槽内容渲染到 `DOM` 中的另一个位置。

```vue
<Teleport to="#some-id" />
<Teleport to=".some-class" />
<Teleport to="[data-teleport]" />
```

多用于 `toolTips` 和弹窗，可以挂载在指定的 `DOM` 下，如 `body` 下

### Suspense
