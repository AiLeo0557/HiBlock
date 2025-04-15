<script setup lang="ts">
import { ElInput } from "element-plus";
// import { buttonProps } from "element-plus/es/components/button/src/button";

// 继承 Element-Button 的所有 Props
// const props = defineProps({
//   ...buttonProps,
//   // 扩展自定义 Props
//   rounded: {
//     type: Boolean,
//     default: false,
//   },
// });

// const props = defineProps({
//   ...inputProps,
// });

// 透传所有 Element-Button 的功能
defineOptions({
  name: "HiInput",
  // inheritAttrs: false,
});
</script>

<template>
  <ElInput v-bind="$attrs" />
</template>

<style scoped>
</style>