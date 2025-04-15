<script lang="ts" setup>
import { ref, 
  defineExpose,
  defineProps, PropType, inject, reactive, useAttrs, computed, 
  unref,
  toRaw} from '@vue/runtime-core';
import { type FormInstance } from 'element-plus';
import { type HiFormItemOption, type FormElementOption } from '@hi-block/definitions';
import HiFormItem from './HiFormItem.vue';

const formRef = ref<FormInstance>()
const props = defineProps({
  showSearchBtn: {
    type: Boolean,
    default() {
      return false
    }
  },
  formData: {
    type: Object as PropType<any>,
    default: {}
  },
  items: {
    type: Array as PropType<HiFormItemOption<FormElementOption>[]>,
    default() {
      return []
    }
  },
  searchBtnText: {
    type: String,
    default() {
      return '查询'
    }
  },
  defaultSpan: {
    type: Number
  },
  reFetch: {
    type: Boolean,
    default: false
  }
})
const page_state: any = inject('page_state', reactive({}))
const { defaultLength }: any = useAttrs()
const targetdata = ref<any>(props.items)
const sourcedata = ref<any>(null)
if (defaultLength !== undefined) {
  targetdata.value = props.items.slice(0, defaultLength)
  sourcedata.value = props.items.slice(defaultLength)
}
const total = ref<number>(0)
const totals: any = ref([])
const itemRows = computed(() => {
  total.value = 0
  let row: any = []
  const rows: any = []
  targetdata.value.forEach((item: any, index: any) => {
    let item_span = item.span === undefined ? props.defaultSpan : item.span
    if (item_span === 24) {
      // 处理 item_span === 24 之前存储
      if (row.length) {
        rows.push(row)
        totals.value.push(0)
        total.value = 0
        row = []
      }
      /**
       * 价格信息发布
       * pricingInformation
       */
      // 处理 item_span === 24
      row.push(item)
      rows.push(row)
      row = []
    } else {
      total.value += item_span
      row.push(item)
      if (total.value >= 24) {
        rows.push(row)
        totals.value.push(0)
        total.value = 0
        row = []
      } else {
        /**
         * billStatistics
         */
        if (index === targetdata.value.length - 1) {
          rows.push(row)
          totals.value.push(total.value)
        }
      }
    }
    // if (total.value + item_span >= 24) {}
  })
  return rows
})
const row_length = computed(() => itemRows.value.length)
const emit = defineEmits(['update:formData', 'submit'])
const haddleSubmit = () => {
  formRef.value?.validate((isValid: boolean) => {
    if (isValid) {
      console.log(97, unref(props.formData))
      emit('submit', unref(props.formData))
    }
  })
}
const haddleReset = () => {
  if (formRef.value?.resetFields) {
    formRef.value?.resetFields()
    if (props.reFetch) {
      emit('submit', unref(props.formData))
    }
  }
}
const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props?.items
    .filter((item: HiFormItemOption<FormElementOption>) => item.formrequired || item.formrequired_config)
    .forEach((item: HiFormItemOption<FormElementOption>) => {
      if (Reflect.has(item, 'formrequired')) {
        Reflect.set(rules, item.name, [
          {
            required: true,
            message:
              item?.placeholder || `请${item.tag.includes('input') ? '输入' : '选择'}${item.label}`,
            trigger: 'blur'
          }
        ])
      }
      if (Reflect.has(item, 'formrequired_config')) {
        Reflect.set(rules, item.name, item.formrequired_config)
      }
    })
  return rules
})
defineExpose({
  onReset: haddleReset,
  onSubmit: haddleSubmit
})
const $transfer = ref<any>(null)
const visible = ref<boolean>(false)
const handleConfirm = () => {
  const { targetdata: target, sourcedata: source } = toRaw(unref($transfer))
  targetdata.value = target.map((item: any) => toRaw(item))
  sourcedata.value = source.map((item: any) => toRaw(item))
  visible.value = false
  total.value = 0
  totals.value = []
}
const haddleShow = () => {
  visible.value = true
}
</script>
<template>
  <div class="form_wrap">
    <el-form ref="formRef" status-icon :rules="formRules" :model="formData" v-bind="$attrs">
      <el-row :gutter="16" :key="`el-row-${i}`" v-for="(row, i) in itemRows">
        <template
          v-for="({ tag, span, label, name, onVisible, ...configs }, index) in row"
          :key="`hi-form-item-${index}`"
        >
          <hi-form-item
            :tag="tag"
            :name="name"
            :span="span || defaultSpan"
            :label="label"
            :configs="{ ...configs, formData }"
            v-if="!onVisible || (onVisible && onVisible(formData))"
            v-model:page_state="page_state"
            v-model:formItemData="formData[name]"
            :style="`display:${configs.type === 'hidden' && 'none'}`"
          />
        </template>

        <div class="btn-group" v-if="showSearchBtn && totals[i]">
          <el-button type="primary" @click="haddleSubmit()">
            {{ searchBtnText }}
          </el-button>
          <el-button type="primary" @click="haddleReset()"> 重置 </el-button>
          <el-button v-if="defaultLength" type="primary" @click="haddleShow">
            搜索项配置
          </el-button>
        </div>
      </el-row>
      <el-row class="last-row" v-show="showSearchBtn && !Number(total)">
        <el-form-item class="btn-group">
          <el-button type="primary" @click="haddleSubmit()">
            {{ searchBtnText }}
          </el-button>
          <el-button type="primary" @click="haddleReset()"> 重置 </el-button>
          <el-button v-if="defaultLength" type="primary" @click="haddleShow">
            搜索项配置
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <hi-dialog :width="640" title="搜索项配置" v-model:visible="visible" @confirm="handleConfirm">
      <hi-transfer
        ref="$transfer"
        :keys="['label', 'name']"
        :targetdata="targetdata"
        :sourcedata="sourcedata"
      />
    </hi-dialog>
  </div>
</template>