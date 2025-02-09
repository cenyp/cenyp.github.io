<template>
  <div class="demo">demo</div>
</template>
<script setup></script>
<style scoped>
.demo {
  display: flex;
  gap: 10px;
}
.demo::after {
  content: "after";
  color: red;
}

.demo::before {
  content: "before";
  color: blue;
}
</style>
