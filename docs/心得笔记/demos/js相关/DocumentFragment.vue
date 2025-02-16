<template>
  <el-button type="primary" @click="handleClick">点击插入 DOM</el-button>
  <div class="DocumentFragment_test"></div>
</template>
<script setup>
import { onMounted } from "vue";
onMounted(() => {
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        console.log("DOM 重新渲染");
      }
    }
  });

  observer.observe(document.querySelector(".DocumentFragment_test"), {
    childList: true,
    subtree: true,
  });
});

function handleClick() {
  const list = document.querySelector(".DocumentFragment_test");
  const fruits = ["Apple", "Orange", "Banana", "Melon"];

  // 创建的是虚拟节点，不会直接插入到 DOM 中
  // document.createElement 是会创建真实节点
  const fragment = new DocumentFragment();

  fruits.forEach((fruit) => {
    const li = document.createElement("li");
    li.textContent = fruit;
    fragment.appendChild(li);
  });

  list.appendChild(fragment);
}
</script>
<style scoped></style>
