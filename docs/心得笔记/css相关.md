# CSS 相关

## white-space 妙用

在处理后端返回的 `\n` 上，可以保持换行，在日志等字符串上由后端灵活生成换行。

<demo vue="./demos/css相关/white-space 妙用.vue" />

## flex 相关

`flex` 可以作用于 `::after` 和 `::before`

`gap` 属性可以快速完成 `flex` 子项的间隔设置，适用于 `Flex` 和 `Grid` 布局

<demo vue="./demos/css相关/flex 相关.vue" />

## h5 弹窗固定标题和底部按钮

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

<demo vue="./demos/css相关/h5弹窗固定标题和底部按钮.vue" />

## 子元素获取父元素高度

父元素高度为 `auto` 时子元素无法继承 `min-height` 的解决方案

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

`即：height` 设置为 0 时，小于 100%，就会设置 `height` 为 `100%`;
其实设置 `height` 为 `100%/inherit` 也能实现效果

<demo vue="./demos/css相关/子元素获取父元素高度.vue" />

## css 3D/2D 转换时有齿痕

处理纯色大屏场景下有效

`filter: blur(0.5px);`

参考链接：[MDN filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter)

## css 模块化

- 命名约束，如 `card\card__menu\card__menu-item\card__menu-item--active`
- `CSS Modules`，利用构建库来实现，如 `vue` 的 `data-v-xxxxx`
- `CSS-in-JS`，把 `css` 手动写入 `style` 中，自然没有命名冲突的问题。如：`styled-components`

## 滚动时 padding-right 失效

子节点触发滚动时 `padding-right` 失效

1. 设置子节点为 `inline-block`，`inline-flex`，`inline-grid`，`inline-table`

<demo vue="./demos/css相关/滚动时 padding-right 失效.vue" />

// todo 忘记场景了

## flex: 1

可分为一下三个属性，等同于 `flex: 1 1 0`，即让每个元素自行决定大小

- `flex-grow: 1`：这个属性控制元素在容器中可用空间分配的比例。当容器有多余的空间时，`flex-grow` 指定元素应该如何“生长”来填充这些空间。值为 1 表示该元素会平分多余空间。
- `flex-shrink: 1`：这个属性控制元素在容器空间不足时是否会缩小，以及缩小的比例。值为 1 表示当空间不足时，元素会根据需要缩小。
- `flex-basis: 0`：这个属性设置元素的初始大小，通常指元素的“基础”宽度或高度。设置为 0 表示元素的初始尺寸为 0，所有可用空间将由 `flex-grow` 决定。

> tips 可以利用这个属性，让元素自动占据剩余空间，配合 `flex-direction: column` 在竖直方向下也能应用

## 项目全局重置样式

```scss
* {
  /* 统一宽度计算规则 */
  box-sizing: border-box;
  /* 避免浏览器差异 */
  margin: 0;
  padding: 0;
  word-break: break-all;

  /* 全局修改滚动条，不然后续在单独组件修改可能会引起组件库组件异常，如 el-table 会计算滚动条宽度来适配样式 */
  &::-webkit-scrollbar-track {
    border-radius: 8px;
    background: transparent;
  }
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
  }
  &:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(144, 147, 153, 0.5);
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

```scss
.title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  color: #222835;

  &::before {
    content: " ";
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
.div {
  // 是在div>子元素>::after
  ::after {
    content: " ";
  }
  // 是在div>::after
  &::after {
    content: " ";
  }
}
```

<demo vue="./demos/css相关/伪类元素.vue" />

> tips 实现标题前面的色块除了用 `::before` 还可以通过设置左边框的方法

## scss css 属性快速插入

可以处理常复用的样式：如 `flex布局`；相关业务样式，如提示文案、标题等等

```scss
@mixin sexy-border($color, $width: 1in) {
  border: {
    color: $color;
    width: $width;
    style: dashed;
  }
}
p {
  @include sexy-border(blue);
}
h1 {
  @include sexy-border(blue, 2in);
}
```

参考文档 [scss](https://www.sass.hk/docs/index.html)

## 文本鼠标移入放大

```css
:hover {
  transform: scale(1.2);
  transition: all 0.3s;
}
```

但是 `scale` 会在 `display: inline` 下失效

<demo vue="./demos/css相关/文本鼠标移入放大.vue" />

> tips 父节点设置 `display: flex` 会默认把子元素变成 `display: block`，影响样式效果

## overflow hidden 不能隐藏子节点

1. 父元素没有设置固定的高度或宽度
2. 子元素使用了 `position: absolute` 或 `position: fixed`，定位到祖先样式上了

<demo vue="./demos/css相关/overflow hidden 不能隐藏子节点.vue" />

> tips 反之同样可以这样子避免被父样式隐藏。还可以把子元素层级改变到父元素之上，这样子父元素就不会被隐藏了；如弹窗组件一般在 `body` 下

## 破解 flex 不能控制宽度

一般来说，设置 `flex: 1` 后，宽度会自动填充剩余空间。但在某些场景下，需要控制宽度，如列表某个项的宽度需要固定，但其他项需要填充剩余空间。

可以设置 `min-width` 和 `max-width` 来控制宽度，但这样子会使得宽度固定，无法填充剩余空间。

`min-width/max-width` 会在计算后的宽度小于/大于 `min-width/max-width` 时生效，由此判断 `min-width/max-width` 的优先级大于 `flex: 1`

<demo vue="./demos/css相关/破解 flex 不能控制宽度.vue" />

## overflow: hidden 会影响 sticky 定位布局

1. `overflow-x: hidden` 导致 `sticky` 不生效，谁页面滚动
2. `overflow-y: hidden` 导致 `ios` 下滚动条被 `sticky` 定位遮挡

具体原因没有研究

## 100vh H5 高度覆盖

`100vh` 在 `H5` 浏览器上会受浏览器搜索栏影响，如 `safari`

解决方法：

1. `uniapp` 下使用 `uni.getSystemInfo().windowHeight` 替换
2. 使用 `vh-check` 来修正 `100vh` 值

## css 聊天气泡

```css
.buddle {
  background-color: transparent;
  border-color: transparent;
  border-style: solid;
  border-width: 34px 51px;
  border-image: url(xxxxxx.png) 58% 40% 40% 42% fill / 49px 55px 33px 53px / 1px repeat;
  padding: 0px;
  margin-top: -11px;
}
```

`border-image: url(xxxxxx.png) 58% 40% 40% 42% fill / 49px 55px 33px 53px / 1px repeat;` 拆解

- `border-image-source: url(xxxx.png)`
- `border-image-slice: 58% 40% 40% 42% fill;` 设定边框图片切割点位，顺序为上右下左
- `border-image-width: 49px 55px 33px 53px;` 图片边框宽度，一般为图片 `border-image-slice` 的比例放大缩小
- `border-image-outset: 1px;`
- `border-image-repeat: repeat;`

`border-width: 34px 51px;` 为边框的宽度，一般要和 `border-image-slice` 保持一致，可以避免显示气泡框大小不同导致的边框拉伸

比例/数据确认顺序

1. 确认裁剪的点位，支持百分比/数值，裁剪后的图片要支持填充，不然会出现宫格纹
2. 确认边框图片数据，根据图片大小\*点位比例\*缩放比例可得
3. 边框宽度一般和 `border-image-slice` 保持一致，可小范围调整

> 注
> `border-width` 代表实际的边框大小
> `border-image-width` 代表在边框上图片显示的宽度，所以一般和 `border-width` 一致

## 样式优先级

项目代码的效果为，整个红色节点线上偏移 10px

```css
.fa {
  background-color: red;
}

.ch {
  background-color: red;
  margin-top: -10px;
}
```

为什么？

AI 回答：

父元素 .fa 的高度默认由子元素的高度和子元素的 margin 共同决定（即块级格式化上下文中的高度计算）。子元素的 margin-top 为负值，会减少父元素内容区域的高度，具体减少的数值等于负 margin 的绝对值（若子元素没有其他正 margin 抵消）。
因此，父元素的高度会减小 10px，其底部边界向上移动。

如何去避免，添加 flex，很神奇，fa 的偏移消失了！，只剩下 ch 的偏移！！

```css
.fa {
  display: flex;
  flex-direction: column;
}
```

> 推测是 flex 优先级更高
