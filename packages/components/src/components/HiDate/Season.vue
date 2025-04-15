<script setup lang="ts">
import { computed } from "@vue/runtime-core";
import { ElDatePicker} from "element-plus"
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

// 转换绑定值为日期对象
const selectedDate = computed({
  get: () => {
    if (!props.modelValue) return null;
    const [year, quarter] = props.modelValue.split("-Q");
    return new Date(Number(year), (Number(quarter) - 1) * 3);
  },
  set: (val) => {
    if (!val) {
      emit("update:modelValue", "");
      return;
    }
    const year = val.getFullYear();
    const month = val.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    emit("update:modelValue", `${year}-Q${quarter}`);
  },
});

// 格式化显示内容
const format = {
  stringify: (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year} 年 第${quarter}季度`;
  },
};

// 值格式
const valueFormat = "YYYY-Q";

// 禁用非季度首月
const disabledDate = (date: Date) => {
  return date.getMonth() % 3 !== 0;
};

// 格式化面板头部
const formatHeader = (date: Date) => {
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${year} 年 第${quarter}季度`;
};

// 处理日期变化
const handleChange = (val: Date | null) => {
  if (!val) return;
  const year = val.getFullYear();
  const quarter = Math.floor(val.getMonth() / 3) + 1;
  emit("update:modelValue", `${year}-Q${quarter}`);
};
</script>
<template>
  <el-date-picker
    v-model="selectedDate"
    type="month"
    placeholder="请选择季度"
    :format="format"
    :value-format="valueFormat"
    @change="handleChange"
    :disabled-date="disabledDate"
  >
    <template #header="{ date }">
      <div class="custom-header">
        <span>{{ formatHeader(date) }}</span>
      </div>
    </template>
  </el-date-picker>
</template>

<style scoped>
.custom-header {
  text-align: center;
  font-weight: bold;
  padding: 8px 0;
}
</style>