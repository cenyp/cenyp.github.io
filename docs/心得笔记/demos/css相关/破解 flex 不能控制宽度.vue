<template>
  <div>
    <div>设置 width: 20%</div>
    <div class="container">
      <div class="item">1</div>
      <div class="item" style="width: 20%">2</div>
      <div class="item">3</div>
    </div>
    <div>设置 min-width: 20%;max-width: 20%;</div>
    <div class="container">
      <div class="item">1</div>
      <div class="item" style="min-width: 20%;max-width: 20%;">2</div>
      <div class="item">3</div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.container {
  display: flex;
  margin-bottom: 10px;
  gap: 6px;
}
.item {
  flex: 1;
  border: 1px solid #000;
  text-align: center;
}
</style>
