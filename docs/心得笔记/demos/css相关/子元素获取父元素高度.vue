<template>
  <div class="flex-line">
    <div>
      <div>height: auto</div>
      <div class="box">
        <div class="fa">
          <div class="ch"></div>
        </div>
      </div>
    </div>
    <div>
      <div>height: 0</div>
      <div class="box">
        <div class="fa" style="height: 0">
          <div class="ch"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.flex-line {
  display: flex;
  gap: 20px;
}
.box {
  height: 200px;
}
.fa {
  background-color: burlywood;
  display: block;
  width: 200px;
  min-height: 100%;
  height: auto;
}
.ch {
  display: block;

  background-color: aqua;
  height: 50%;
}
</style>
