<template>
  <div class="bg">
    <div class="title">标题</div>
    <div class="content">
      内容 start<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容 end<br />
    </div>
    <div class="footer">底部按钮</div>
  </div>
</template>
<style scoped>
/* 模拟弹窗组件样式 */
.bg {
  width: 180px;
  height: 300px;
  background-color: aliceblue;
  text-align: center;
  overflow-y: scroll;
}
.title {
  height: 30px;
  background-color: aqua;
  position: sticky;
  top: 0;
}

.footer {
  height: 30px;
  background-color: aquamarine;
  position: sticky;
  bottom: 0;
}
</style>
