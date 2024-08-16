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