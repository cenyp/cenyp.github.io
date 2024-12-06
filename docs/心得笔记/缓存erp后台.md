# 不能监听 route 
route 是响应式的，如果用 watch、computed监听，在多个 tab 切换时，监听/计算会多次触发

# 实现缓存清理功能
1. keep-alive 加入 include 要缓存的页面 name 数组组成
```vue
<router-view v-slot="{ Component }">
    <keep-alive :include="includeCodeList">
        <component :is="Component" :key="$route.name" />
    </keep-alive>
</router-view>
```
2. 在项目开发中，使用 xxxx/index.vue 的话，组件名称就是 index，这样子 include 不能生效；keep-alive组件是以组件名称来判断的
```vue
component: importPage(path,name)
```
```ts
const modules = import.meta.glob(['@/pages/**/*.vue'])

export function importPage(path: string, name: string) {
    return () =>
        modules['/src/pages' + path]().then((module: any) => ({
            ...module.default,
            name: name,
        }))
}
```
需要在组件注入时添加一个 name

# 刷新当前缓存页面
1. 一般缓存时监听 route 变化，所以先清除 include 里面的值，使页面不处于缓存状态，然后 router.replace 到中转页面，中转页面再 router.replace 回来，此时会触发 route 监听，重新写入 include
2. 上面的路由跳转还可以通过变动 key 来完成。先清除 include 里面的值，使页面不处于缓存状态，然后 key = '1'，再手动写入 include，同时 key = ''
``` js
function click() {
    const currentView = tabsViewStore.visitedViews.find(item => item.name === route.name)
    if (currentView) {
        tabsViewStore.delCachedView(currentView).then(() => {
            key.value = '1'
            nextTick(() => {
                key.value = ''
                tabsViewStore.addView(currentView)
                console.log(tabsViewStore.cachedViews)
            })
        })
    }
}
```

推荐使用2，可以避免重复渲染没有变动的组件，同时路由也不会重复变化导致地址栏闪烁
