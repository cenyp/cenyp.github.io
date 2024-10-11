# white-space 妙用
1. 在处理后端返回的 \n 上，可以保持换行

# 格式化导致文本换行
如 prettier 
```html
<!-- prettier -->
xxxxxxxxx
<!-- prettier -->
```

# 页面提示框方案
1. getBoundingClientRect+父节点scrollTop
2. offsetTop 替代 getBoundingClientRect 计算父子节点位置差

问题：如果提示是在复杂组件内部或者是要依赖数据异步渲染的，要加延时以获取最终的定位（注意电脑性能影响）

# flex相关
flex可以作用于::after和::before

gap属性可以快速完成flex子项的间隔设置
```css
.flexLine {
    display: flex;
    gap: 10px;
}
```

# h5弹窗固定标题和底部按钮
可以使用sticky定位，分别设置
```css
.title {
    position: sticky;
    top: 0;
}
.footer {
    position: sticky;
    bottom: 0;
}
```

# 父元素高度为 auto 时子元素无法继承 min-height 的解决方案
```css
.fa {
    height: auto;
    min-height: 100%;
}
.ch {
    height: 50%; // 算不出值
}
```
```css
.fa {
    height: 0; // 改成0就可以了
    min-height: 100%;
}
.ch {
    height: 50%; 
}
```

mdn 对 min-height 的解释是 
1. CSS 属性 min-height 能够设置元素的最小高度。这样能够防止 height 属性的应用值小于 min-height 的值。
2. 当 min-height 大于 max-height 或 height 时，元素的高度会设置为 min-height 的值。

即：height 设置为 0 时，小于 100%，就会设置 height 为 100%;
其实设置 height 为 100%/inherit 也能实现效果

# css 3D/2D 转换时有齿痕
`filter: blur(0.5px);`
https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter

# css 模块化
- 命名约束，如 card\card__menu\card__menu-item\card__menu-item--active
- CSS Modules，利用构建库来实现，如 vue 的 data-v-xxxxx
- CSS-in-JS，把 css 手动写入 style 中，自然没有命名冲突的问题。如：styled-components

# 单选按钮框组边框重叠问题
1. antdv 是通过在设置 before 来实现相邻按钮项的边框，通过是否选中来显示不同颜色
2. 通过设置 margin-left: -1px; 让后面的按钮项覆盖前面的按钮项的边框，选中的按钮用 z-index/position 来增加权重完成覆盖
