<template>
  <el-space>
    <div
      class="intersectionObserver-box"
      style="width: 100px; height: 200px; overflow-y: auto"
    >
      <div class="item" v-for="item in 20" style="border: 1px solid #000">
        {{ item }}
      </div>
    </div>
    <div>
      <div>缓慢滚动</div>
      <div>显示项：{{ txt }}</div>
    </div>
  </el-space>
</template>
<script setup>
import { onMounted, ref } from "vue";

const txt = ref();

onMounted(() => {
  const observer = new IntersectionObserver(
    (doms) => {
      const dom = doms.filter((item) => item.intersectionRatio > 0.1);
      if (dom.length) {
        txt.value = dom.map((item) => item.target.innerText).join(",");
      }
    },
    {
      threshold: 0.1,
      root: document.querySelector(".intersectionObserver-box"),
    }
  );

  document
    .querySelectorAll(".intersectionObserver-box .item")
    ?.forEach((item) => {
      observer.observe(item);
    });
});
</script>
<style scoped></style>
