<script lang="ts" setup>
import { type PropType, useAttrs } from "@vue/runtime-core";
import { ElDatePicker } from "element-plus";
import Season from "./Season.vue";

interface DateFormConfig {
  disabledDateStartKey?: string;
  disabledDateEndKey?: string;
}
const props = defineProps({
  formData: Object as PropType<any>,
  disabledDate: Function,
});

const { disabledDateStartKey, disabledDateEndKey } =
  useAttrs() as DateFormConfig;
const disabledDate = (time: any) => {
  if (disabledDateStartKey) {
    const endDateVal = Reflect.get(props.formData, disabledDateStartKey);
    if (endDateVal) {
      return time.getTime() > new Date(endDateVal).getTime();
    }
  }
  if (disabledDateEndKey) {
    const beginDateVal = Reflect.get(props.formData, disabledDateEndKey);
    if (beginDateVal) {
      // 如果当前时间大于开始时间，则小于当前时间的时间都为不可选时间
      if (new Date(beginDateVal).getTime() < new Date().getTime()) {
        return time.getTime() < new Date().getTime();
      }
      // 如果当前时间小于开始时间，则小于开始时间后一天的时间都为不可选时间
      else {
        return (
          time.getTime() <
          new Date(beginDateVal).getTime() + 1 * 24 * 60 * 60 * 1000
        );
      }
    }
  }
};
</script>
<template>
  <season v-if="$attrs.type === 'season'" />
  <el-date-picker v-else v-bind="$attrs" :disabledDate="disabledDate" />
</template>