[CSS 实现多行文本“展开收起”](https://juejin.cn/post/6963904955262435336)

简单样例如下：
```html
<div class="test">
  <span class="tag">更多</span>
  新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类新增一级品类
</div>

.test {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    
    // 设置 ::before 的 float 把 tag 顶下去
    &::before {
        content: '';
        display: block;
        float: right;
        width: 1px;
        // 这里可以用 100% - tag 高度实现动态计算，需要在 .test 包裹一层 flex
        // 在 flex 布局 的子项中，可以通过百分比来计算变化高度。display: grid 和 display: -webkit-box 同样有效
        // 或者是设置固定高度也行，不然不能使用 100% 计算高度
        height: 22px;
    }
    
    // 利用白色背景遮盖 tag。当没有发生省略时，::after 是在第二行遮盖 tag；发生省略时，::after 已经挤到第三行去了，显示出 tag
    &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 22px;
        background: #fff;
    }
}
// 利用 float 让 tag 保持在右边
.tag {
    float: right;
    // 让 tag 单独一行，去掉左右浮动效果
    clear: both;
}
```

原文还有
1. 利用 check 选中控制展开
2. 多浏览器兼容
3. flex 布局影响

原文总结：
1. 文本环绕效果首先考虑浮动 float
2. flex 布局子元素可以通过百分比计算高度
3. 多行文本截断还可以结合文本环绕效果用max-height模拟实现
4. 状态切换可以借助 checkbox
5. CSS 改变文本可以采用伪元素生成
6. 多利用 CSS 遮挡 “障眼法”