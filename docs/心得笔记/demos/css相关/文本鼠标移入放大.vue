<template>
  <div>
    <el-button type="primary" @click="hasFlex = !hasFlex">切换 flex</el-button>
    <div
      style="margin-top: 20px;"
      :class="{
        'flex-line': hasFlex,
      }"
    >
      <div class="box"></div>
      <br />
      <div class="txt">文本鼠标移入</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
const hasFlex = ref(false);
</script>
<style scoped>
.flex-line {
  display: flex;
  gap: 20px;
}
.box {
  width: 100px;
  height: 100px;
  background-color: #407fb6;
  transition: all 0.3s;
  cursor: pointer;
}
.box:hover {
  transform: scale(1.2);
}
.txt {
  display: inline;
  margin-left: 10px;
  transition: all 0.3s;
  cursor: pointer;
}
.txt:hover {
  transform: scale(1.2);
}
</style>
