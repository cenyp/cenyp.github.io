<template>
  <div>
    有data-v-xxxxx
    <br />
    <el-cascader
      v-model="value"
      :options="options"
      :props="props"
      class="m20"
    />
  </div>
  <el-cascader v-model="value" :options="options" :props="props" class="m20" />
</template>
<style scoped>
:deep() {
  .m20 {
    margin: 20px;
    background-color: aquamarine;
  }
}
</style>

<script setup>
import { ref } from "vue";

const value = ref([]);

const props = {
  expandTrigger: "hover",
};

const options = [
  {
    value: "guide",
    label: "Guide",
    children: [
      {
        value: "disciplines",
        label: "Disciplines",
        children: [
          {
            value: "consistency",
            label: "Consistency",
          },
          {
            value: "feedback",
            label: "Feedback",
          },
        ],
      },
      {
        value: "navigation",
        label: "Navigation",
        children: [
          {
            value: "side nav",
            label: "Side Navigation",
          },
          {
            value: "top nav",
            label: "Top Navigation",
          },
        ],
      },
    ],
  },
];
</script>
