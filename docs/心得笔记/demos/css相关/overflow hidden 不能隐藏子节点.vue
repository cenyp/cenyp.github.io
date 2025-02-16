<template>
  <div class="pre">
    <div class="out">
      <div class="inner"></div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.pre {
  width: 100px;
  height: 100px;
  position: relative;
}
.out {
  overflow: hidden;
  width: 100px;
  height: 100px;
  border: 2px solid rgb(236, 145, 80);
  /* 如果去掉这个属性，定位到 pre，inner 就不会被隐藏；反之，定位到 out，则隐藏 */
  position: absolute;
}

.inner {
  width: 50px;
  height: 50px;
  background-color: rgb(177, 108, 241);
  position: absolute;
  right: -30px;
}
</style>
