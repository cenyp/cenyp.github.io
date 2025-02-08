<template>
  <div>没有设置 white-space</div>
  <div>-------------------------------------------</div>

  <div>{{ txt }}</div>
  <br>
  <div>设置 white-space: break-spaces</div>
  <div>-------------------------------------------</div>

  <div style="white-space: break-spaces">{{ txt }}</div>
  <br>
  <div>设置 white-space: pre</div>
  <div>-------------------------------------------</div>
  <div style="white-space: pre">{{ txt }}</div>
</template>
<script setup>
const txt = `蒹葭苍苍，白露为霜。所谓伊人，在水一方。溯洄从之，道阻且长。\n溯游从之，宛在水中央。`;
</script>
