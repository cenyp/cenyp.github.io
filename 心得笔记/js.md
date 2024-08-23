# DocumentFragment
它被作为一个轻量版的 Document 使用，就像标准的 document 一样，存储由节点（nodes）组成的文档结构。与 document 相比，最大的区别是它不是真实 DOM 树的一部分，它的变化不会触发 DOM 树的重新渲染，且不会对性能产生影响。

https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment

# 跨标签页/窗口通讯
window.open 也能跨窗口传递参数、声明 window[xxx] = xxx 或者是 url 上处理