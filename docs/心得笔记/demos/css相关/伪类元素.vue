<template>
  <div class="title">title123</div>
</template>
<script setup></script>
<style scoped>
.title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  color: #222835;
}
.title::before {
  content: " ";
  display: inline-block;
  width: 3px;
  height: 13px;
  margin-right: 8px;
  background: #04b78c;
}
</style>
