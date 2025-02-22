<template>
  <p>缩放浏览器看看</p>
  <p>innerHeight：{{ height }}</p>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const height = ref(window.innerHeight); // 用 ref 存储初始的窗口高度

const updateHeight = () => {
  height.value = window.innerHeight; // 更新窗口高度
};

// 组件挂载时，添加 resize 事件监听
onMounted(() => {
  window.addEventListener("resize", updateHeight);
});

// 组件卸载时，移除事件监听，避免内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateHeight);
});
</script>
<style scoped></style>
