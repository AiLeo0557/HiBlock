// import type { InputProps } from 'element-plus'
import type { RequestArgument } from '../utils/getRequestParams';
import { DataTypeOperation } from '../utils/getDataTypeOperation';
import { HiInputOption, MoreOptionConfig, useInputConfig } from './useInputConfig';

export interface ComputedConfig<T> {
  keys?: string[]; // 关联字段
  method: 'add' | 'sub' | 'mul' | 'div' | 'request' | 'filter' | 'switch'; // 计算方法
  args?: RequestArgument<T>, // 请求参数
  from_key?: string; // 计算结果字段
  options?: {
    [key: string]: string; // 选项
  },
  from?: string; // 引用来源
}
export interface DefaultValueConfig {
  computed_config?: ComputedConfig<any>, // 计算配置
  from?: string, // 引用来源
}
export interface HiFormItemOption<T> {
  span?: number, // 栅格数
  formrequired?: boolean, // 是否必填
  readonly?: boolean, // 是否只读
  formrequired_config?: any
  default_value_config?: string | DefaultValueConfig, // 默认值配置
  elConfig: T, // 表单元素配置
  onVisible?: (data?: Record<string, any>) => boolean; // 是否显示
}
export type FormElementOption = []
export type FormItemOption = []


export interface VisibleConfig {
  key: string, // 关联字段
  value: string, // 关联值
  be_equal: string
}


export type HiFormElTag = 'input' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date'
export type HiFormItemConfigOption = string | boolean | number | VisibleConfig | MoreOptionConfig
export type HiFormItemConfigOptions<T extends HiFormItemConfigOption[]> = [
  index: number, // 序号
  label: string, // 标签
  name: string, // 字段名
  type: string, // 类型
  ...T, // 其他配置
]
export type HiFormItemsConfig = {
  [key in HiFormElTag]: HiFormItemConfigOptions<HiFormItemConfigOption[]>[];
};
export type HiFormItemsConfigTuple = [
  tag: HiFormElTag,
  label: string, // 标签
  name: string, // 字段名
  type: string, // 类型
  ...HiFormItemConfigOption[], // 其他配置
]
export interface HiFormItemConfig {
  tag: HiFormElTag,
  label: string, // 标签
  name: string, // 字段名
}

export const useHiFormItems = (config: HiFormItemsConfig) => {
  const formItems: HiFormItemConfig[] = []
  const formData = {}
  Object.entries(config).forEach(([tag, items]: [string, HiFormItemConfigOptions<HiFormItemConfigOption[]>[]]) => {
    items.forEach((item: HiFormItemConfigOptions<HiFormItemConfigOption[]>) => {
      const [index, label, name, ...rest] = item
      // 初始化 formData
      Reflect.set(formData, name, undefined)
      // 初始化 formItems
      Reflect.set(formItems, index, {
        tag,
        label,
        name
      })
      switch (tag) {
        case 'input':
          Object.assign(formItems[index], useInputConfig(rest as unknown as HiInputOption, (value: any) => {
            Reflect.set(formData, name, value)
          }))
          break
      }
    })
  })
  return [formItems, formData]
}