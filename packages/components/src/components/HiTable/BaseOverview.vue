<script lang="ts" setup>
import { usePost } from '@hi-block/http'
import { getFieldValueByPath, getFormatNum, getRequestParams, getStringBetween } from '@hi-block/utils'
import { computed, inject, onMounted, reactive, ref, useAttrs, watch } from '@vue/runtime-core'

const props = defineProps({
  tableDataParam: Object,
  overviewData: {
    type: Object,
    default: {}
  },
  page_state: Object,
  chartData: Object,
  searchResult: Object,
  overview_data_list: Array,
  data_config: Object
})
const {
  update_table_param_key_name,
  update_table_param_value_name,
  update_state_key_name,
  update_state_value_name,
  update_config
}: any = useAttrs()
const page_state: any = inject('page_state', reactive({}))
const emits = defineEmits([
  'update:tableDataParam',
  'update:overviewData',
  'update:chartData',
  'update:searchResult'
])

const overviewData = reactive<any>({})
const dataList = computed(() => {
  if (!props.overview_data_list) {
    return []
  }
  return props.overview_data_list?.map((item: Record<string, string>) => {
    let [key, label] = Object.entries(item)[0]
    const value = Reflect.get(overviewData, key) || '-'
    const format_num: number = Reflect.has(item, '_format')
      ? Number(Reflect.get(item, '_format'))
      : 2
    /**
     * transter-detail
     * 传导匹配明细
     * {{overviewData.bhtgencategoryName}} || 白鹤滩
     */
    if (label.includes('||')) {
      let [label_key, default_lable_value] = label.split('||')
      label_key = getStringBetween(label_key, '{{', '}}')
      label = getFieldValueByPath(label_key, props, default_lable_value)
    }
    const new_item: any = {
      key,
      label: label.replace(/{{(.*?)}}/g, (_: any, str: string) => {
        return Reflect.get(overviewData, str) || ''
      }),
      value: typeof value === 'number' ? getFormatNum(value, format_num) : value
    }
    if (Object.entries(item)[1] && !Object.entries(item)[1][0].startsWith('_')) {
      const [rate_key, rate_label] = Object.entries(item)[1]
      const rate_value = Reflect.get(overviewData, rate_key) || '-'
      Object.assign(new_item, { rate_label, rate_value })
    }
    if (Reflect.has(item, '_trigger')) {
      const trigger_config = Reflect.get(item, '_trigger') as any
      const event_type = Reflect.get(trigger_config, 'event_type')
      if (event_type && event_type === 'click') {
        Reflect.set(new_item, 'style', { cursor: 'pointer' })
        Reflect.set(new_item, 'onClick', () => {
          eval(trigger_config.run_code)
        })
      }
    }
    return new_item
  })
})
let prev_param = {}
const loading = ref<boolean>(true)
if (props.data_config?.from?.includes('page_state')) {
  watch(
    page_state,
    (page_state: any) => {
      const res = getFieldValueByPath(props.data_config?.from, props)
      Object.assign(overviewData, res)
    },
    {
      deep: true
    }
  )
}
onMounted(() => {
  watch(
    [() => props.chartData, () => props.tableDataParam],
    async ([chartData, tableDataParam]) => {
      let res
      if (props.data_config?.args) {
        let [url, params, options] = props.data_config.args
        params = getRequestParams(params, options, props)
        const new_param_values = Object.values(params).join(',') + url
        const prev_param_values = Object.values(prev_param).join(',') + url
        if (
          new_param_values &&
          prev_param_values &&
          Object.is(new_param_values, prev_param_values)
        ) {
          return
        }
        if (Reflect.has(options, 'res_key_name')) {
          options.onFormat = (res: any) => {
            if (Reflect.has(options, 'update_data_origin_name')) {
              const data_origin_value_name = Reflect.get(options, 'update_data_origin_value')
              const data_origin_name: 'chartData' = Reflect.get(options, 'update_data_origin_name')
              const data_origin_value = getFieldValueByPath(data_origin_value_name, res)
              emits(`update:${data_origin_name}`, data_origin_value)
            }
            const res_key_name = Reflect.get(options, 'res_key_name')
            const res_value = getFieldValueByPath(res_key_name, res)

            return res_value
          }
        }
        loading.value = true
        res = await usePost(url, params, options)
        loading.value = false
        prev_param = Object.assign({}, params)
      }
      if (props.data_config?.from) {
        res = getFieldValueByPath(props.data_config.from, props)
      }
      if (!res) {
        return
      }
      loading.value = false
      /** 报错死循环 20241123 */
      Object.assign(overviewData, res)
      if (
        !Object.is(
          Object.values(overviewData).join(','),
          Object.values(props.overviewData).join(',')
        )
      ) {
        emits('update:overviewData', overviewData)
      }
      if (update_table_param_key_name) {
        const data = Object.assign({}, props.tableDataParam)
        const update_table_param_value = Reflect.get(res, update_table_param_value_name)
        Reflect.set(data, update_table_param_key_name, update_table_param_value)
        emits('update:tableDataParam', data)
      }
      if (update_state_key_name) {
        const update_state_value = Reflect.get(res, update_state_value_name)
        Reflect.set(page_state, update_state_key_name, update_state_value)
      }
    },
    {
      deep: true,
      immediate: true
    }
  )
})
</script>
<template>
  <div class="data_overview" v-loading="loading">
    <div
      :class="{ data_overview_item: item.key !== 'sign', sign: item.key === 'sign' }"
      :key="item.key"
      :style="{ height: item.rate_label ? '72px' : '48px', ...item.style }"
      v-bind="item"
      v-for="item in dataList"
    >
      <h1 class="_title">{{ item.label }}</h1>
      <el-tooltip v-if="item.value.length > 15" placement="top" :content="item.value">
        <h1 class="_data">{{ item.value }}</h1>
      </el-tooltip>
      <h1 v-else-if="item.key !== 'sign'" class="_data">{{ item.value }}</h1>
      <p class="_info" v-if="item.rate_label">
        <b class="_info_title">{{ item.rate_label }}:</b>
        <b
          class="_info_unm"
          :style="{ color: item.rate_value.includes('-') ? '#db2828' : '#21ba45' }"
        >
          {{ item.rate_value }}
        </b>
      </p>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.data_overview {
  display: flex;
  justify-content: space-between;
  flex: 1;
}
// .data_overview_item:nth-last-child(1) {
//   flex-shrink: 0;
//   flex-grow: 0;
//   flex-basis: max-content;
//   ._data {
//     width: 100%;
//   }
// }
.data_overview_item {
  // flex: 1;
  // flex-basis: 25%;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: max-content;
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  text-align: left;
  overflow: hidden;
  font-family: sans-serif;
  ._title {
    font-size: 15px;
    line-height: 22px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  ._data {
    font-size: 15px;
    line-height: 22px;
    font-weight: 600;
    color: #00c2fe;
    // width: 90%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ._info {
    font-size: 12px;
    ._info_title {
      display: inline-block;
      padding-right: 10px;
    }
  }
}
.data_overview_item.sign {
}
</style>
