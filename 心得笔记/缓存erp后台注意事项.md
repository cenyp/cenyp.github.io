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