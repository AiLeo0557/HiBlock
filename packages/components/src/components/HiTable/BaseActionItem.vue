<script lang="ts" setup>
import { defineHiFormItems, defineHiTableConfig, type HiTableColElOptions } from '@hi-block/definitions'
import { usePost } from '@hi-block/http'
import { getFieldValueByPath, getRequestParams, getStringBetween, getTableColumnKeys } from '@hi-block/utils'
import { ref, defineProps, defineEmits, type PropType, type Component, computed, useAttrs, reactive, nextTick } from '@vue/runtime-core'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'

/**
 * 行内新增、编辑状态
 */
const editable = ref<boolean>(false)
const addable = ref<boolean>(false)

const props = defineProps({
  selectedTableData: {
    // Table中选中配执行操作的数据
    type: Array,
    default: []
  },
  tableData: {
    type: Array,
    default: []
  },
  columns: {
    // Table的column数据用于导出数据时获得表头数据
    type: Array as PropType<HiTableColElOptions[]>,
    default: []
  },
  content: {
    type: Function as unknown as PropType<Component<any, any, any>>,
    default: null
  },
  items: Array,
  formData: Object,
  searchFormData: Object,
  searchResult: Object,
  exportFileParams: Object,
  overviewData: Object,
  treeNode: Object as PropType<any>,
  params: Object,
  user: Object
})
const emits = defineEmits([
  'reload',
  'click',
  'clearSelection',
  'update:searchFormData',
  'update:content',
  'update:formData',
  'update:items',
  'update:params'
])
const content = computed({
  set(value) {
    emits('update:content', value)
  },
  get() {
    return props.content
  }
})
const formData = computed({
  set(value) {
    emits('update:formData', value)
  },
  get() {
    return props.formData
  }
})
const formItems = computed({
  set(value) {
    emits('update:items', value)
  },
  get() {
    return props.items
  }
})
const {
  icon, // 共同属性_图标名称
  command, // 共同属性_操作 key
  label, // 共同属性_操作中文名称
  exportFileTitle, // 导出操作_导出文件名称
  exportFileType = 'xls', // 导出操作_导出文件类型
  url,
  table_data_excute_args_url,
  hide_footer,
  onFormatParams,
  format_param_to_arr = false,
  type,
  onClickCb,
  exportFileOptions,
  relied = true,
  init_formData_from_selected_tabledata = false,
  init_formData_config,
  table_data_excute_args,
  immediate = false,
  on_excute_cb_config,
  content_config,
  dialog_config,
  tip_config,
  run_code
}: any = useAttrs()
let table_attrs = {}
let origin_selected_table_data: any = []
const { height, width, labelWidth, defaultSpan, slot_btn_config } = dialog_config || {}
const { slot_btn_title, slot_btn_action_url, slot_btn_action_args } = slot_btn_config || {}
const dialog_title = computed<string>(() => {
  if (dialog_config?.title?.includes('{{') && dialog_config.title.includes('}}')) {
    return dialog_config.title.replace(/{{(.*?)}}/g, (_: any, title_key: string) => {
      /**
       * 集成接口信息管理
       * interfaceInfo
       */
      const title_value = getFieldValueByPath(title_key, props)
      return title_value || title_key
    })
  }
  return dialog_config?.title || ''
})
const responseType = ref<any>('json')
const show_dialog = computed(() => type === 'dialog')
const if_relied_selectedTableData = computed<boolean>(() => {
  if (command === 'excute') {
    return relied
  }
  if (command === 'export') {
    if (!props.exportFileParams) {
      if (exportFileOptions && exportFileOptions.default_all) {
        return false
      }
      return true
    }
  }
  return ['edit', 'remove', 'push'].includes(command)
})
const onClearFormData = () => {
  if (!formData.value) {
    return
  }
  const keys = Object.keys(formData.value)
  const data: any = {}
  for (const key of keys) {
    data[key] = undefined
  }
  emits('update:formData', data)
}
const doActionPost = async (params: any) => {
  let parse_url = url || table_data_excute_args?.[0] || table_data_excute_args_url
  if (parse_url.includes('{{') && parse_url.includes('}}')) {
    parse_url = parse_url.replace(/{{(.*?)}}/g, (_: any, param_key: string) =>
      // Reflect.get({...params, searchResult: props.searchResult}, param_key)
      getFieldValueByPath(param_key, { ...params, searchResult: props.searchResult })
    )
  }

  const post_options =
    table_data_excute_args && table_data_excute_args[2]
      ? {
          ...table_data_excute_args[2],
          success_message: `${dialog_title.value || label}成功！`,
          fail_message: `${dialog_title.value || label}失败！`,
          onFormatParams,
          responseType: responseType.value
        }
      : {
          success_message: `${dialog_title.value || label}成功！`,
          fail_message: `${dialog_title.value || label}失败！`,
          onFormatParams,
          responseType: responseType.value
        }
  if (exportFileOptions) {
    Object.assign(post_options, exportFileOptions)
  }
  /**
   * 2024_06_15
   * 损益清算管理/稳供保价/参数管理 parameter-management
   * engine-finance/parameterLinkage/query
   * 接口融合默认参数 type:01
   */
  if (table_data_excute_args && table_data_excute_args[1]) {
    const formated_param = getRequestParams(
      table_data_excute_args[1],
      table_data_excute_args[2],
      /**
       * @date 2024_11_26
       * @page 浮动比例 slidingScales
       * "table_data_excute_args": [
       *  "engine-finance/fsAgtBaFloatscale/addFsAgtBaFloatscaleInfo",
       *    { "touTypeList": [] },
       *    {
       *      "param_touTypeList_key": ["params.touType01", "params.touType02", "params.touType04", "params.touType07"]
       *    }
       * ]
       */
      reactive({ ...props, params })
    )
    params = Object.assign(formated_param, params)
  }
  if (format_param_to_arr) {
    post_options.onFormatParams = (param: any) => [param]
  }
  /**
   * @date 2024-11-26
   * @page 浮动比例_slidingScales
   * @action 编辑
   */
  if (parse_url === 'engine-finance/fsAgtBaFloatscale/updateFsAgtBaFloatscales') {
    const {
      id,
      touType01,
      govFile: govFiles,
      touType02,
      touType04,
      touType07,
      touType,
      ...rest
    } = params
    const res = await usePost('engine-finance/fsAgtBaFloatscale/queryByIds', id.split(','))
    params = res.result.map((item: any) => ({
      ...item,
      ...rest,
      floatPct: Reflect.get(params, `touType${item.touType}`)
    }))
  }
  return usePost(parse_url, params, {
    ...post_options,
    onSuccess(data) {
      if (data.successful || data.success) {
        if (on_excute_cb_config) {
          const { set_formdata_key_name, set_formdata_key_value } = on_excute_cb_config
          const keys = set_formdata_key_name.split('.')
          if (keys[0] === 'searchFormData' && props.searchFormData) {
            Reflect.set(props.searchFormData, keys[1], set_formdata_key_value)
            emits('update:searchFormData', { ...props.searchFormData })
          }
        }
        $form.value && $form.value.onReset()
        visible.value = false
        handleReload()
      }
    }
  })
}
const handleReload = () => {
  emits('reload')
}
/**
 * 导出功能执行逻辑
 */
const doExport = () => {
  let file_name_data = exportFileTitle || (props.treeNode ? props.treeNode.name : '')
  let export_file_params: any = null
  responseType.value = 'blob'
  if (props.exportFileParams) {
    export_file_params = getRequestParams(props.exportFileParams, exportFileOptions, props)
  }
  const export_default_all =
    exportFileOptions && Reflect.has(exportFileOptions, 'default_all')
      ? Reflect.get(exportFileOptions, 'default_all')
      : false
  if (export_default_all && props.tableData && !props.tableData.length) {
    ElMessage.warning('导出数据为空！')
    return
  }
  let params = {
    names: getTableColumnKeys(props.columns, 'prop').flat().join(','),
    namescn: getTableColumnKeys(props.columns, 'label', true).flat().join(','),
    list: export_default_all ? props.tableData : props.selectedTableData
  }
  if (export_file_params) {
    params = export_file_params
    Object.keys(params).forEach((param_key_name: string) => {
      const param_value_name = Reflect.get(exportFileOptions, `param_${param_key_name}_key`)
      const param_key_value = param_value_name && getFieldValueByPath(param_value_name, props)
      param_key_value !== undefined && Reflect.set(params, param_key_name, param_key_value)
    })
  } else if (table_data_excute_args) {
    const [_url, export_param, export_options] = table_data_excute_args
    Object.keys(export_param).forEach((key: string) => {
      let param_value: any = props
      const param_value_key = Reflect.get(export_options, `param_${key}_key`)
      if (param_value_key?.includes('.')) {
        param_value = getFieldValueByPath(param_value_key, param_value)
      } else if (param_value_key?.includes('[') && param_value_key?.includes(']')) {
        const key = param_value_key.split('[')[0]
        const sub_key = getStringBetween(param_value_key, '\\[', '\\]')
        param_value = Reflect.get(param_value, key)
        param_value = param_value.map((item: any) => Reflect.get(item, sub_key))
      } else if (param_value_key?.includes('`') && param_value_key?.includes('`')) {
        const key = param_value_key.split('`')[0]
        const sub_key = getStringBetween(param_value_key, '\\`', '\\`')
        param_value = Reflect.get(param_value, key)
        param_value = param_value.map((item: any) => Reflect.get(item, sub_key)).join(',')
      } else {
        param_value = Reflect.get(param_value, param_value_key)
      }
      Reflect.set(params, key, param_value)
    })
  }
  /**
   * 2024-07-02
   * MonthlyBillPush
   * 批量导出OFD文件功能
   */
  if (type === 'one_by_one') {
    let sequence = Promise.resolve()
    props.selectedTableData.forEach(async (row_data: any) => {
      sequence = sequence.then(() =>
        nextTick(() => {
          emits('update:params', row_data)
        }).then(() => {
          doExportActionPost(row_data, file_name_data)
        })
      )
    })
    return
  }
  emits('update:params', params)
  doExportActionPost(params, file_name_data)
}
const doExportActionPost = async (params: any, file_name_data: string) => {
  if (file_name_data.includes('{{') && file_name_data.includes('}}')) {
    file_name_data = file_name_data.replace(/{{(.*?)}}/g, (_: any, str: string) => {
      const [title_key, format_str]: any = str.split('_')
      const title_value = getFieldValueByPath(title_key, props)
      if (Array.isArray(title_value)) {
        return format_str
          ? `${dayjs(title_value[0]).format(format_str)}至${dayjs(title_value[1]).format(format_str)}`
          : title_value
      }
      return format_str ? dayjs(title_value).format(format_str) : title_value
    })
  }
  return doActionPost(params).then((data) => {
    if (!data) {
      return
    }
    const blob = new Blob([data])
    const a = document.createElement('a')
    const parentTag = document.getElementById('app')
    a.href = window.URL.createObjectURL(blob)
    a.download = `${file_name_data}.${exportFileType}`
    parentTag!.insertBefore(a, null)
    a.click()
    parentTag!.removeChild(a)
  })
}
/**
 * 新增、编辑功能执行逻辑
 */
const doEdit = () => {
  onClearFormData()
  if (command === 'edit' && props.selectedTableData.length && formData.value) {
    emits('update:formData', props.selectedTableData[0])
  }
  if (show_dialog.value) {
    visible.value = true
  }
}
/**
 * 删除功能执行逻辑
 */
const doRemove = () => {}
/**
 * 导入功能执行逻辑
 */
const doImport = () => {}
/**
 *
 */
const doTrigger = () => {
  emits('click')
}
/**
 * 默认操作处理逻辑
 */
const doExcute = () => {
  if (init_formData_from_selected_tabledata) {
    if (content_config.page_name === 'gaspTime') {
      const currentItem = {
        touType01: [],
        touType02: [],
        touType03: [],
        touType04: [],
        touType07: []
      }
      const {
        tou_TYPE01List,
        tou_TYPE02List,
        tou_TYPE03List,
        tou_TYPE04List,
        tou_TYPE07List
      }: any = props.selectedTableData[0]
      Object.assign(currentItem, {
        touType01: tou_TYPE01List.map((item: any) => item.dataTime),
        touType02: tou_TYPE02List.map((item: any) => item.dataTime),
        touType03: tou_TYPE03List.map((item: any) => item.dataTime),
        touType04: tou_TYPE04List.map((item: any) => item.dataTime),
        touType07: tou_TYPE07List.map((item: any) => item.dataTime)
      })
      emits('update:formData', currentItem)
    } else {
      emits('update:formData', props.selectedTableData[0])
      nextTick(() => {
        if (init_formData_config) {
          let form_data = {}
          let { init_formData, init_option } = init_formData_config
          let init_keys = Object.keys(init_formData)
          init_keys.forEach((key: string) => {
            const formData_value_name = `formData_${key}_key`
            if (Reflect.has(init_option, formData_value_name)) {
              const formData_key_value = getFieldValueByPath(formData_value_name, props)
              Reflect.set(form_data, key, formData_key_value)
            }
            if (Array.isArray(Reflect.get(init_formData, key))) {
              let form_data_item = Reflect.get(init_formData, key)[0]
              Object.keys(form_data_item).forEach((item_key: string) => {
                const form_data_item_name = `formData_${item_key}_key`
                if (Reflect.has(init_option, form_data_item_name)) {
                  const form_data_item_key = Reflect.get(init_option, form_data_item_name)
                  const form_data_item_value = getFieldValueByPath(form_data_item_key, props)
                  Reflect.set(form_data_item, item_key, form_data_item_value)
                }
              })
              Reflect.set(form_data, key, [form_data_item])
            }
          })
          const new_form_data = Object.assign({}, props.formData, form_data)
          emits('update:formData', new_form_data)
        }
      })
    }
  }
  let param = table_data_excute_args?.[1]
  const options = table_data_excute_args?.[2]
  if (param) {
    param = getRequestParams(param, options, props)
  } else {
    param = props.selectedTableData
  }

  if (show_dialog.value) {
    if (tip_config) {
      const { msg, condition } = tip_config
      if (!eval(condition)) {
        ElMessage.warning(msg)
        return
      }
    }
    if (immediate) {
      doActionPost(param).then((res) => {
        if (res) {
          visible.value = true
        }
      })
      return
    }
    if (content_config && content_config.component === 'hi-form') {
      const [formData, formItems] = defineHiFormItems(content_config.form_config.items)
      if (!init_formData_from_selected_tabledata) {
        emits('update:formData', formData)
      }
      emits('update:items', formItems)
    }
    if (content_config && content_config.component === 'hi-table') {
      table_attrs = defineHiTableConfig(content_config.table_config, {}, props)
      // :pagination_config=""
      table_attrs.pagination_config = content_config?.pagination_config || {}
    }
    if (content_config?.component) {
      emits('update:content', content_config.component)
    }
    visible.value = true
  }
  if (type === 'confirm') {
    let tip_msg = `是否${dialog_title.value || label}选中数据`
    if (tip_config) {
      const { msg, condition } = tip_config
      const total = props.selectedTableData.length
      const unsatisfied = props.selectedTableData.filter((item: any) => {
        if (eval(condition)) {
          return true
        }
      })
      if (unsatisfied.length) {
        tip_msg = msg.replace(/{{(.*?)}}/g, (_: any, title_key: string) => {
          return eval(title_key)
        })
        ElMessage.warning(tip_msg)
        return
      }
    }
    ElMessageBox.confirm(tip_msg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        if (table_data_excute_args) {
          doActionPost(param)
          return
        }
        doActionPost(props.selectedTableData)
      })
      .catch(() => {})
  }
  if (type === 'immediate') {
    if (tip_config) {
      const { msg, condition } = tip_config
      const total = props.selectedTableData.length
      const unsatisfied = props.selectedTableData.filter((item: any) => {
        if (eval(condition)) {
          return true
        }
      })
      if (unsatisfied.length) {
        const _msg = msg.replace(/{{(.*?)}}/g, (_: any, title_key: string) => {
          return eval(title_key)
        })
        ElMessage.warning(_msg)
        return
      }
    }
    if (table_data_excute_args) {
      if (relied) {
        doActionPost(props.selectedTableData)
      } else {
        doActionPost(param)
      }
    }
    if (run_code) {
      eval(run_code)
    }
  }
  if (type === 'inline') {
    if (relied) {
      editable.value = true
      origin_selected_table_data = props.selectedTableData
      props.selectedTableData.forEach(function (row: any) {
        row.editable = true
      })
    } else {
      addable.value = true
      const new_row = {editable: true}
      props.tableData.unshift(new_row)
      props.selectedTableData.push(new_row)
    }
  }
}
/**
 * 操作类型及操作逻辑
 */
const handleCommand = () => {
  // 执行点击的回调，用来处理一些初始化逻辑
  // 比如 表单的 disabled 状态，在编辑的时候为 true ；
  // 新增的时候为 false
  onClickCb && onClickCb()
  // 判断是否依赖选中数据
  if (if_relied_selectedTableData.value && !props.selectedTableData.length) {
    ElMessage.warning(`请选择需要${label}的数据`)
    return
  }
  switch (command) {
    case 'export':
      doExport()
      break
    case 'add':
    case 'edit':
      doEdit()
      break
    case 'import':
      doImport()
      break
    case 'trigger':
      doTrigger()
      break
    default:
      doExcute()
      break
  }
}
/**
 * 弹窗操作相关逻辑
 */
const visible = ref<boolean>(false)
const $form = ref<any>(null)
const onClose = () => {
  visible.value = false
  $form.value?.onReset?.()
}
const onConfirm = () => {
  $form.value.onSubmit()
}

const onSubmit = (form_data: any) => {
  if (!form_data) {
    return
  }
  const param = form_data
  if (if_relied_selectedTableData.value && !init_formData_from_selected_tabledata) {
    param.dataList = props.selectedTableData
  }
  if (content_config?.page_name === 'gaspTime') {
    let _param: any = props.selectedTableData[0]
    const fsBaPvdatetimeId = _param.id
    _param.tou_TYPE01List = form_data.touType01.map((dataTime: string) => ({
      touType: '01',
      fsBaPvdatetimeId,
      dataTime
    }))
    _param.tou_TYPE02List = form_data.touType02.map((dataTime: string) => ({
      touType: '02',
      fsBaPvdatetimeId,
      dataTime
    }))
    _param.tou_TYPE03List = form_data.touType03.map((dataTime: string) => ({
      touType: '03',
      fsBaPvdatetimeId,
      dataTime
    }))
    _param.tou_TYPE04List = form_data.touType04.map((dataTime: string) => ({
      touType: '04',
      fsBaPvdatetimeId,
      dataTime
    }))
    _param.tou_TYPE07List = form_data.touType07.map((dataTime: string) => ({
      touType: '07',
      fsBaPvdatetimeId,
      dataTime
    }))
    doActionPost(_param)
    return
  }
  doActionPost(param)
}

const handleCancle = () => {
  if (editable.value) {
    editable.value = false
    props.selectedTableData.forEach(function (row: any, index: number) {
      Object.assign(row, {
        editable: false,
        ...origin_selected_table_data[index]
      })
    })
  }
  if (addable.value) {
    addable.value = false
    props.tableData.shift()
    props.selectedTableData.shift()
  }
}
const handleSave = () => {
  let param = table_data_excute_args?.[1]
  const options = table_data_excute_args?.[2]
  if (param) {
    param = getRequestParams(param, options, props)
  } else {
    param = props.selectedTableData
  }
  doActionPost(param).then((res: any) => {
    handleCancle()
  })
}
</script>
<template>
  <div class="action_button_wrapper">
    <base-action-item-import v-if="command === 'import'" @reload="handleReload" v-bind="$attrs" />
    <template v-else>
      <template v-if="editable || addable">
        <div class="double-btns">
          <el-button
            type="primary"
            icon="CircleCheck"
            class="action_button"
            @click.stop="handleSave"
          >
            保存
          </el-button>
          <el-button type="primary" icon="RefreshLeft" @click.stop="handleCancle"> 取消 </el-button>
        </div>
      </template>
      <el-button
        v-else
        type="primary"
        :icon="icon"
        class="action_button"
        @click.stop="handleCommand"
      >
        {{ label }}
      </el-button>
    </template>
    <hi-dialog
      v-if="show_dialog && visible"
      :width="width"
      :height="height"
      :title="dialog_title || label"
      :hide_footer="hide_footer || dialog_config.hide_footer"
      v-model:visible="visible"
      @close="onClose"
      @confirm="onConfirm"
    >
      <component
        v-if="content"
        :is="content"
        :inline="false"
        :items="formItems"
        :label-width="labelWidth"
        :defaultSpan="defaultSpan"
        :treeNode="props.treeNode"
        :overviewData="overviewData"
        :searchResult="searchResult"
        :searchFormData="searchFormData"
        :content_data_args="content_config?.content_data_args"
        ref="$form"
        @submit="onSubmit"
        v-bind="table_attrs"
        v-model:formData="formData"
      />
      <hi-form
        v-else
        :inline="false"
        :items="formItems"
        v-model:formData="formData"
        :label-width="labelWidth"
        :defaultSpan="defaultSpan"
        @submit="onSubmit"
        ref="$form"
      />
      <template v-if="slot_btn_config?.items" #footer>
        <base-action-footer-btn
          :key="index"
          v-bind="item"
          v-model:formData="formData"
          v-for="(item, index) in slot_btn_config?.items"
        />
      </template>
    </hi-dialog>
  </div>
</template>

<style scoped>
.double-btns {
  display: flex;
}
</style>
