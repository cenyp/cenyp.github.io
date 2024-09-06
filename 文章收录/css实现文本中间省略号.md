[源代码](https://codepen.io/xboxyan/pen/VwpPNbm)

[CSS 文本超出提示效果](https://juejin.cn/post/6966042926853914654)

```html
<ul class="con">
    <li class="wrap">
        <span class="txt">CSS 实现优惠券的技巧 - 2021-03-26</span>
        <span class="title" title="CSS 实现优惠券的技巧 - 2021-03-26">CSS 实现优惠券的技巧 - 2021-03-26</span>
    </li>
    <li class="wrap">
        <span class="txt">CSS 测试标题，这是一个稍微有点长的标题，超出一行以后才会有title提示，标题是 实现优惠券的技巧 - 2021-03-26</span>
        <span class="title" title="CSS 测试标题，这是一个稍微有点长的标题，超出一行以后才会有title提示，标题是 实现优惠券的技巧 - 2021-03-26">CSS
            测试标题，这是一个稍微有点长的标题，超出一行以后才会有title提示，标题是 实现优惠券的技巧 - 2021-03-26</span>
    </li>
    <li class="wrap">
        <span class="txt">CSS 拖拽?</span>
        <span class="title" title="CSS 拖拽?">CSS 拖拽?</span>
    </li>
    <li class="wrap">
        <span class="txt">CSS 文本超出自动显示title</span>
        <span class="title" title="CSS 文本超出自动显示title">CSS 文本超出自动显示title</span>
    </li>
</ul>

.con {
    font-size: 14px;
    color: #666;
    width: 600px;
    margin: 50px auto;
    border-radius: 8px;
    padding: 15px;
    overflow: hidden;
    resize: horizontal;
    box-shadow: 20px 20px 60px #bebebe,
        -20px -20px 60px #ffffff;
}

.wrap {
    position: relative;
    line-height: 2; // 控制li间隔
    height: 2em; // 与 ::before 的 top 相关连
    padding: 0 10px;
    overflow: hidden; // 隐藏溢出
    background: #fff;
    margin: 5px 0;
}

.wrap:nth-child(odd) {
    background: #f5f5f5;
}

.title {
    display: block;
    position: relative;
    background: inherit;
    text-align: justify;
    height: 2em;
    overflow: hidden;
    top: -4em; // 正常状态是在 .txt 上面；省略时覆盖 .txt
}

.txt {
    display: block;
    max-height: 4em; // 在触发省略时，可以让 ::before 覆盖 .txt 标签
}
.title::before{
    content: attr(title);
    width: 50%; // 控制省略号显示范围
    float: right; // 让文本在右边，同时让 .title 标签同行
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl; // 控制文字方向，省略号显示在左边
}

```

实现原理

首先是空间足够的情况下，没有发生省略

显示的是 .txt 标签，.title 标签由于设置 top: -4em 是在 .txt 标签上面（y轴上方），

注意：.txt 和 .title 标签高度是 2em (正常状态下)

发生省略时

.txt 标签会触发换行，但最大高度是 4em，刚好让 .title 标签覆盖上面（wrap 限制了 2em 所以还是只会展示一行）

::before 是右浮动，所以会和 .title 标签在同一行

direction 设置为 rtl 实现左省略，利用 width 控制宽度即可让 省略在中间

 **注：** 
原文里面关于滚动为什么设置 translateX(-50%) 是因为有有本身和 ::after 两个文本，所以 50% 刚好是一个文本的宽度

**扩展 多行更多按钮**
```vue
<template>
    <div
        :class="{
            tagList: true,
            showTag: record?.showTagList,
        }"
        >
        <div class="hideDiv">
            <div class="arrow" @click="record.showTagList = !record.showTagList">
                <div v-if="!record?.showTagList">展开 <down-outlined /></div>
                <div v-else>收起 <up-outlined /></div>
            </div>
            <div class="flex-box">
                <button>tag1</button>
                <button>tag2</button>
                <button>tag3</button>
                <button>tag4</button>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .tagList {
        overflow: hidden;
        height: 28px; // 限制单行高度，做收起时使用
        .hideDiv {
            position: relative;
            max-height: 52px; // 限制两行高度，避免 bottom 大小不够，.arrow 不在对应位置
        }
        .arrow {
            position: absolute;
            right: 0;
            bottom: 28px;
            cursor: pointer;
        }
        .flex-box {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-right: 46px; // 避免 .arrow 遮挡
        }

        &.showTag {
            height: 100%;
            .hideDiv {
                max-height: 100%;
            }
        }
    }
</style>
```