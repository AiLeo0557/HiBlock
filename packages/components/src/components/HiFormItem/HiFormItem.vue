<script lang="ts" setup>
import { computed, defineEmits, onMounted, watch } from "@vue/runtime-core";
import {dayjs, ElCol, ElFormItem} from "element-plus";
import duration from 'dayjs/plugin/duration'
import {calc} from 'hi-calc-pro';
import { getFieldValueByPath, getRequestParams } from "@hi-block/utils";
import { usePost } from "@hi-block/http";

dayjs.extend(duration)

const props = defineProps({
  span: {
    type: Number,
    default: 24
  },
  label: {
    type: String
  },
  tag: {
    type: String
  },
  name: {
    type: String,
    default: ''
  },
  formItemData: {
    type: [String, Number, Array]
  },
  configs: {
    type: Object
  },
  page_state: {
    type: Object
  }
})
const emit = defineEmits(['update:formItemData'])
const placeholder = computed(() => {
  if (props?.configs?.placeholder) {
    return props.configs.placeholder
  }
  if (props?.tag?.includes('input') && !props.tag.includes('more-option')) {
    return `请输入${props?.label}`
  }
  if (props?.tag?.includes('select') || props?.tag?.includes('more-option')) {
    return `请选择${props?.label}`
  }
  return ''
})
const value = computed({
  get() {
    return props.formItemData
  },
  set(value) {
    emit('update:formItemData', value)
    getDateRangeArr(value)
  }
})
const getDateRangeArr = (range_date_arr?: any) => {
  if (props.tag !== 'date') {
    return
  }
  const { type, format, formData }: any = props.configs
  if (type.includes('range')) {
    if (!range_date_arr && !value.value) {
      return
    }
    const unit = type.replace('range', '')
    const range_arr = []
    let [end, start]: any = range_date_arr || value.value
    start = dayjs(start)
    end = dayjs(end)
    let duration_num = dayjs.duration(start.diff(end)).asMonths()
    duration_num = Math.round(duration_num)
    for (let i = 0; i <= duration_num; i++) {
      range_arr.push(dayjs(end).add(i, unit).format(format))
    }
    Reflect.set(formData, `${props.name}_range_arr`, range_arr)
  }
}
onMounted(getDateRangeArr)
watch(
  () => props.page_state,
  (page_state: any) => {
    if (props.configs?.default_value_config && props.configs?.default_value_config.from) {
      const _value = getFieldValueByPath(props.configs?.default_value_config.from, props)
      value.value = _value
    }
  },
  {
    immediate: true,
    deep: true
  }
)
watch(
  () => props.configs.formData,
  async (formData: any) => {
    if (
      props.configs?.default_value_config &&
      props.configs?.default_value_config.computed_config
    ) {
      const { keys, method, args, from_key, options } =
        props.configs?.default_value_config.computed_config
      const values = keys ? keys.map((key: string) => Number(Reflect.get(formData, key))) : null
      if (method === 'sum') {
        value.value = calc().add(...values).value
      }
      if (method === 'mul') {
        value.value = calc().mul(...values).value
      }
      if (method === 'sub') {
        value.value = calc().sub(...values).value
      }
      if (method === 'request') {
        let [url, param, options] = args
        param = getRequestParams(param, options, { formData })
        let res = await usePost(url, param, options)
        if (!res) {
          return
        }
        res = res.resultValue || 0
        value.value = res
      }
      if (method === 'switch') {
        const from_value = Reflect.get(formData, from_key)
        value.value = Reflect.get(options, from_value)
      }
      if (method === 'filter') {
        const [key, sub_key] = from_key.split('.')
        const key_value = Reflect.get(formData, key)
        if (key_value) {
          value.value = Reflect.get(Array.isArray(key_value) ? key_value[0] : key_value, sub_key)
        }
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<template>
  <el-col :span="span">
    <el-form-item :prop="name" :label="label">
      <component
        :name="name"
        :is="`hi-${tag}`"
        :placeholder="placeholder"
        v-model="value"
        v-bind="configs"
      />
    </el-form-item>
  </el-col>
</template>