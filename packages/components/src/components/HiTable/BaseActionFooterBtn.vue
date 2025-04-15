<script lang="ts" setup>
import { usePost } from '@hi-block/http'
import { getFieldValueByPath } from '@hi-block/utils'
import { useAttrs, defineProps, defineEmits } from '@vue/runtime-core'

const props = defineProps({
  formData: Object
})
const emits = defineEmits([
  'reload',
  'clearSelection',
  'update:searchFormData',
  'update:content',
  'update:formData',
  'update:items',
  'update:params'
])
const { slot_btn_title, slot_btn_action_url, slot_btn_action_args }: any = useAttrs()
const handleRun = async () => {
  if (slot_btn_action_args) {
    const [url, params, options] = slot_btn_action_args
    Object.assign(options, {
      success_message: `${slot_btn_title}成功！`,
      fail_message: `${slot_btn_title}失败！`
    })
    let new_params: any = params
    Object.keys(params).forEach((key_name: string) => {
      const param_value_name = Reflect.get(options, `param_${key_name}_key`)
      const param_value = getFieldValueByPath(param_value_name, props)
      Reflect.set(new_params, key_name, param_value)
    })
    if (options.update_config) {
      const { item_key, res_key } = options.update_config
      options.onSuccess = (res: any) => {
        const res_value = getFieldValueByPath(res_key, res)
        Object.entries(props?.formData).forEach(([key, value]: any) => {
          if (!Reflect.has(res_value, key)) {
            Reflect.set(res_value, key, value)
          }
        })
        emits(`update:${item_key}`, res_value)
      }
    }
    await usePost(url, new_params, options)
  } else {
    await usePost(slot_btn_action_url, props.formData, {
      success_message: `${slot_btn_title}成功！`,
      fail_message: `${slot_btn_title}失败！`
    })
  }
}
</script>
<template>
  <el-button type="primary" @click="handleRun">{{ slot_btn_title }}</el-button>
</template>
