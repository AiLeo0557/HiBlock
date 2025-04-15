<script lang="ts" setup>
import type { HiPostArg, HiTableColumn, RemoteColumnOption } from 'types/global'
import { numFormat } from '@/utils/numFormat'
const props = defineProps({
  moduleId: {
    type: String
  },
  searchFormData: Object,
  columns_config: {
    type: Object as PropType<{
      default: HiTableColumn[] | null
      args: HiPostArg<any> | null
    }>
  },
  state: {
    type: Object,
    default: {}
  }
})
const get_columns_url = computed(() => {
  return (
    props?.columns_config?.args?.[0] || 'engine-quality/appSysSet/moduleFormatSearch/getColumns'
  )
})
const remote_cols = reactive<{
  targetdata: string[]
  sourcedata: RemoteColumnOption[]
}>({
  targetdata: [],
  sourcedata: []
})
const columns = computed(() => {
  const _remote_cols = remote_cols.targetdata.map((item: any) => {
    if (item.width) {
      return {
        prop: item.columnEn || item.prop,
        label: item.columnCn || item.label,
        minWidth: item.width
      }
    }
    return {
      prop: item.columnEn || item.prop,
      label: item.columnCn || item.label
    }
  })
  return _remote_cols.length ? _remote_cols : props.columns_config?.default
})
defineExpose({ columns })
watch(
  [() => props.searchFormData, () => props.state],
  (searchFormData) => {
    if (!props.moduleId && props.columns_config?.args) {
      let [url, param, options]: any = props.columns_config?.args
      Object.keys(param).forEach((key: string) => {
        const param_value_name = Reflect.get(options, `param_${key}_key`)
        const param_key_value = getValueByKey(param_value_name, props)
        Reflect.set(param, key, param_key_value)
      })
      useBusPost(url, param, {
        ...options,
        onSuccess(res: any) {
          if (res.successful) {
            remote_cols.targetdata = options.res_key_name
              ? getValueByKey(options.res_key_name, res)
              : res
          }
        }
      })
    }
  },
  { deep: true, immediate: true }
)
onMounted(() => {
  if (props.moduleId) {
    useBusPost(
      get_columns_url.value,
      { moduleId: props.moduleId },
      {
        onSuccess: (data: any) => {
          if (data.successful) {
            if (props.moduleId) {
              remote_cols.targetdata = data.resultValue.true
              remote_cols.sourcedata = data.resultValue.false
            }
          }
          if (Array.isArray(data)) {
            remote_cols.targetdata = data
          }
        }
      }
    )
  }
})
const visible = ref<boolean>(false)
const handleShow = () => {
  visible.value = true
}
const isTableActionsAreaMounted = useElementMounted('#tableActionsArea')
const $transfer = ref<any>(null)
const handleConfirm = () => {
  if (!$transfer) {
    return
  }
  const { targetdata, sourcedata } = toRaw(unref($transfer))
  useBusPost(
    'engine-quality/appSysSet/moduleFormatSearch/saveFormat',
    {
      moduleId: props.moduleId,
      selected: targetdata.map((item: RemoteColumnOption) => item.id).join(','),
      unSelected: sourcedata.map((item: RemoteColumnOption) => item.id).join(',')
    },
    {
      params_type: 'formData',
      onPrompt: true,
      onSuccess() {
        visible.value = false
      }
    }
  )
}
</script>
<!-- v-fix-width -->
<template>
  <base-table-column :key="item.prop" v-bind="item" v-for="item in columns"></base-table-column>
  <Teleport v-if="isTableActionsAreaMounted" to="#tableActionsArea">
    <el-button type="primary" v-if="moduleId" class="action_button" @click="handleShow">
      <el-icon :size="14">
        <component :is="'SwitchFilled'" />
      </el-icon>
      <span>展示列配置</span>
    </el-button>
    <hi-dialog :width="640" title="展示列配置" v-model:visible="visible" @confirm="handleConfirm">
      <hi-transfer
        ref="$transfer"
        :keys="['columnCn', 'id']"
        :targetdata="remote_cols.targetdata"
        :sourcedata="remote_cols.sourcedata"
      />
    </hi-dialog>
  </Teleport>
</template>

<style scoped></style>
