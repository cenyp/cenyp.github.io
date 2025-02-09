# CSS 相关

## white-space 妙用

在处理后端返回的 `\n` 上，可以保持换行，在日志等字符串上由后端灵活生成换行。

<demo vue="./demos/css相关/white-space 妙用.vue" />

## flex 相关

`flex` 可以作用于 `::after` 和 `::before`

`gap` 属性可以快速完成 `flex` 子项的间隔设置，适用于 `Flex` 和 `Grid` 布局

<demo vue="./demos/css相关/flex 相关.vue" />

## h5弹窗固定标题和底部按钮

可以使用 `sticky` 定位。这样子处理的好处是，弹窗的高度由内容控制；最大高度由弹窗组件控制，可以保证样式统一。

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

<demo vue="./demos/css相关/h5弹窗固定标题和底部按钮_1.vue" />

## 子元素获取父元素高度

父元素高度为 auto 时子元素无法继承 min-height 的解决方案

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

`mdn` 对 `min-height` 的解释是

1. `CSS` 属性 `min-height` 能够设置元素的最小高度。这样能够防止 `height` 属性的应用值小于 `min-height` 的值。
2. 当 `min-height` 大于 `max-height` 或 `height` 时，元素的高度会设置为 `min-height` 的值。

`即：height` 设置为 0 时，小于 100%，就会设置 `height` 为 100%;
其实设置 `height` 为 100%/`inherit` 也能实现效果

## css 3D/2D 转换时有齿痕

`filter: blur(0.5px);`

参考：[MDN filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter)

## css 模块化

- 命名约束，如 `card\card__menu\card__menu-item\card__menu-item--active`
- `CSS Modules`，利用构建库来实现，如 `vue` 的 `data-v-xxxxx`
- `CSS-in-JS`，把 `css` 手动写入 `style` 中，自然没有命名冲突的问题。如：`styled-components`

## 单选按钮框组边框重叠问题

1. antDv 是通过在设置 `before` 来实现相邻按钮项的边框，通过是否选中来显示不同颜色
2. 通过设置 `margin-left: -1px` 让后面的按钮项覆盖前面的按钮项的边框，选中的按钮用 `z-index`/`position` 来增加权重完成覆盖

## 滚动时 padding-right 失效

子节点触发滚动时 `padding-right` 失效

1. 设置子节点为 `inline-block`，`inline-flex`，`inline-grid`，`inline-table`

## flex: 1

可分为一下三个属性，等同于 `flex: 1 1 0`，即让每个元素自行决定大小

- `flex-grow: 1`：这个属性控制元素在容器中可用空间分配的比例。当容器有多余的空间时，`flex-grow` 指定元素应该如何“生长”来填充这些空间。值为 1 表示该元素会平分多余空间。
- `flex-shrink: 1`：这个属性控制元素在容器空间不足时是否会缩小，以及缩小的比例。值为 1 表示当空间不足时，元素会根据需要缩小。
- `flex-basis: 0`：这个属性设置元素的初始大小，通常指元素的“基础”宽度或高度。设置为 0 表示元素的初始尺寸为 0，所有可用空间将由 `flex-grow` 决定。

>tips 可以利用这个属性，让元素自动占据剩余空间，配合 `flex-direction: column` 在竖直方向下也能应用

## 项目全局重置样式

```css
* {
    /* 统一宽度计算规则 */
    box-sizing: border-box;  
    /* 避免浏览器差异 */
    margin: 0; 
    padding: 0;
    word-break: break-all;

    /* 全局修改滚动条，不然后续在单独组件修改可能会引起组件库组件异常，如 el-table 会计算滚动条宽度来适配样式 */
    &::-webkit-scrollbar-track {
        border-radius: 6px;
        background: transparent;
    }
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    &::-webkit-scrollbar-thumb {
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    &:hover {
        &::-webkit-scrollbar-thumb {
            // #909399 + 0.3
            background-color: rgba(144, 147, 153, 0.3);
            &:hover {
                // #909399 + 0.5
                background-color: rgba(144, 147, 153, 0.5);
            }
        }
    }
}

html,
body,
#app {
    width: 100%;
    height: 100%;
    font-size: 14px;
}
```

## 伪类元素

如果在某个元素下设置伪类，实际上是相当于创建了一个新元素，是受 `flex`、`float` 等等的影响

在实现 `title` 前面有光亮颜色块时，可以利用伪类实现，并使用 `flex` 布局实现上下居中

```css
.title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    color: #222835;

    &::before {
        content: ' ';
        display: inline-block;
        width: 3px;
        height: 13px;
        margin-right: 8px;
        background: #04b78c;
    }
}
```

注意 `css` 语法糖的写法

```scss
.div{
    // 是在div>子元素>::after
    ::after{
        content:' ',
    }
    // 是在div>::after
    &::after{
        content:' ',
    }
}
```

>tips:实现标题前面的色块除了用 `::before` 还可以通过设置左边框的方法

## scss css 属性快速插入

>todo

## 文本鼠标移入放大

```css
:hover {
    transform: scale(1.2);
    transition: all 0.3s;
}
```

但是 `scale` 会在 `display: line` 下失效

同时 `display: flex` 会把子元素变成 `display: block`

## overflow hidden 不能隐藏子节点

1. 父元素没有设置固定的高度或宽度
2. 子元素使用了 `position: absolute` 或 `position: fixed`，定位到祖先样式上了

```vue
<template>
  <div class="pre">
    <div class="out">
      <div class="inner">1</div>
    </div>
  </div>
</template>

<style>
.pre {
  position: absolute;
  width: 200px;
  height: 200px;
}
.out {
  overflow: hidden;
  width: 100px;
  height: 100px;
  border: 1px solid saddlebrown;
  position: absolute; /* 如果去掉这个属性，定位到 pre，inner 就不会被隐藏；反之，定位到 out，则隐藏 */
}

.inner {
  width: 50px;
  height: 50px;
  background-color: blueviolet;
  position: absolute;
  right: -30px;
}
</style>
```

> tips 反之同样可以这样子避免被父样式隐藏。还可以把子元素层级改变到父元素之上，这样子父元素就不会被隐藏了；如弹窗组件一般在 `body` 下
