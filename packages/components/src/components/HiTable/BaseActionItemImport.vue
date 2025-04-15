<script lang="ts" setup>
import { defineHiFormItems, HiTableColOptions } from '@hi-block/definitions'
import { usePost } from '@hi-block/http'
import { getFieldValueByPath, getFormData } from '@hi-block/utils'
import { inject, reactive, ref, useAttrs, watch } from '@vue/runtime-core'
import { ElMessage, type UploadUserFile } from 'element-plus'
// import fp from 'lodash/fp'
// import type { HiTableColumn } from 'types/global'
// import { computed } from 'vue'
interface ResData {
  name: string[]
  namecn: string[]
  datelist: any
}
// const { flowRight, findIndex, uniqBy } = fp
const page_state: any = inject('page_state', reactive({}))
const $upload_form = ref<any>(null)
const {
  icon, // 共同属性_图标名称
  command, // 共同属性_操作 key
  label, // 共同属性_操作中文名称
  title,
  width = 450, // 弹窗宽度
  height, // 弹窗高度
  download_template_name, // 下载模板文件名称
  download_template_url, // 下载模板路径
  download_template_params, // 下载模板传参
  download_template_params_type = 'json',
  upload_file_url, // 文件上传路径
  upload_file_params_name = 'file', // 上传文件参数名称
  save_tabledata_url, // 保存上传成功回调
  tip = '只能上传excel文件', // 提示信息
  acceptKind = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel', // 上传文件类型
  upload_success_cb = (res: any) => {}, // 上传成功的回调
  upload_on_change = false, // 是否change事件后执行 submit
  upload_on_confirm = false, // 是否confirm事件后执行 submit
  upload_filedata_view = false, // 是否上传成功后展示成功后回调数据
  comfirm_btn_text = '确定',
  show_download_btn = false,
  upload_form_config = { items: {} }
}: any = useAttrs()
const emit = defineEmits(['reload'])
const [formData, formItems] = defineHiFormItems(upload_form_config?.items)
let parse_url = save_tabledata_url
watch(
  formData,
  (formData) => {
    if (formData && save_tabledata_url && save_tabledata_url.includes('{{')) {
      parse_url = save_tabledata_url.replace(/{{(.*?)}}/g, (_: any, _key: string) =>
        getFieldValueByPath(_key, { formData, page_state })
      )
    }
  },
  {
    immediate: true,
    deep: true
  }
)
const handleClick = () => {
  visible.value = true
}
const visible = ref<boolean>(false)
const handleDownload = () => {
  usePost(download_template_url, download_template_params, {
    responseType: 'blob',
    params_type: download_template_params_type
  }).then((data: any) => {
    console.log(64, data)
    const blob = new Blob([data])
    const a = document.createElement('a')
    const parenrTag = document.getElementById('app')
    a.href = window.URL.createObjectURL(blob)
    a.download = download_template_name
    parenrTag!.insertBefore(a, null)
    a.click()
    parenrTag!.removeChild(a)
  })
}
const fileList = ref<UploadUserFile[]>([])
const uploadRef = ref<any>()
const fileChange = async (file: any, fileList: any) => {
  // flowRight(
  //   (uniqList: any) => {
  //     if (uniqList.length !== fileList.length) {
  //       ElMessage.warning('文件名不能重复')
  //       fileList.pop()
  //     }
  //   },
  //   uniqBy('name') // 数组去除 name 相同的元素
  // )(fileList)
  if (upload_on_change) {
    // nextTick(() => doUpload())
  }
}
const handleRemove = () => {}
const handleConfirm = () => {
  if (upload_on_confirm) {
    if (upload_form_config?.items) {
      $upload_form.value.onSubmit()
    } else {
      doUpload()
    }
  }
  if (parse_url) {
    usePost(parse_url, tableData.value, {
      success_message: '保存成功！',
      onSuccess() {
        visible.value = false
        tableData.value = []
        fileList.value = []
        emit('reload')
      }
    })
  }
}
const onSubmit = () => {
  doUpload()
}
const doUpload = () => {
  if (!fileList.value.length) {
    ElMessage.warning('请选择上传文件！')
    return
  }
  const file: any = fileList.value[0].raw
  const form_data = getFormData({})
  if (upload_form_config) {
    Object.entries(formData).forEach(([key, value]: any) => {
      form_data.append(key, value)
    })
  }
  form_data.append(upload_file_params_name, file)

  usePost(upload_file_url, form_data, {
    success_message: `${title || label}成功！`,
    fail_message: `${title || label}失败！`
  }).then((res: ResData) => {
    if (upload_filedata_view) {
      const { name, namecn, datelist } = res
      tableData.value = datelist
      const cols = []
      for (let i = 0; i < name.length; i++) {
        const item = {
          prop: name[i],
          label: namecn[i],
          width: 150
        }
        cols.push(item)
      }
      tableCol.value = cols
    }
    upload_success_cb && upload_success_cb(res)
    if (upload_on_confirm) {
      visible.value = false
    }
  })
}
/** 展示表格相关逻辑 */
const tableCol = ref<HiTableColOptions[]>([])
const tableData = ref<any>([])
const tableDataConfig = reactive({
  default() {
    return tableData
  }
})
</script>
<template>
  <el-button type="primary" class="action_button" @click.stop="handleClick">
    <el-icon :size="14">
      <component :is="icon" />
    </el-icon>
    <span>{{ label }}</span>
  </el-button>
  <hi-dialog
    :title="$attrs.dialog_title || '导入文件'"
    :width="width"
    :comfirm_btn_text="comfirm_btn_text"
    v-model:visible="visible"
    @confirm="handleConfirm"
  >
    <hi-form
      :inline="false"
      :items="formItems"
      :label-width="80"
      :defaultSpan="24"
      v-model:formData="formData"
      ref="$upload_form"
      @submit="onSubmit"
      v-if="upload_form_config"
    />
    <!-- <base-upload-form  :configs="upload_form_config" ref="" /> -->
    <el-upload
      class="upload-demo"
      ref="uploadRef"
      action="#"
      :multiple="false"
      :limit="1"
      :accept="acceptKind"
      :on-change="fileChange"
      :on-remove="handleRemove"
      v-model:file-list="fileList"
      :auto-upload="false"
    >
      <template #tip>
        <div class="el-upload__tip">{{ tip }}</div>
      </template>
      <el-button class="btn" type="primary"> 浏览 </el-button>
    </el-upload>
    <template v-if="show_download_btn" #footer>
      <el-button type="primary" @click="handleDownload"> 下载模板 </el-button>
    </template>
    <hi-table
      v-if="upload_filedata_view && tableData.length"
      :hide_selection_col="true"
      :pagination_config="{ hidden: true }"
      :columns_config="{
        default: tableCol
      }"
      :tableHeight="350"
      :data_config="tableDataConfig"
    />
  </hi-dialog>
</template>

<style scoped>
.upload-demo {
  text-align: left;
}
.btn {
  margin-bottom: 10px;
}
</style>
