// import type { InputProps } from 'element-plus'
import { reactive } from '@vue/reactivity';
import type { HiRequestArgument } from '../utils/getRequestParams';
import { HiInputElOption, HiInputOption, MoreOptionConfig, defineHiInputConfig } from './defineHiInputConfig';
import { HiSelectElOption, HiSelectOption, defineHiSelectConfig } from './defineHiSelectConfig';
import { HiDateElOption, HiDateOption, defineHiDateConfig } from './defineHiDateConfig';

export interface ComputedConfig<T> {
  keys?: string[]; // 关联字段
  method: 'add' | 'sub' | 'mul' | 'div' | 'request' | 'filter' | 'switch'; // 计算方法
  args?: HiRequestArgument<T>, // 请求参数
  from_key?: string; // 计算结果字段
  options?: {
    [key: string]: string; // 选项
  },
  from?: string; // 引用来源
}
export interface DefaultValueConfig {
  computed_config?: ComputedConfig<any>, // 计算配置
  from?: string, // 引用来源
  default_select_all?: boolean, // Select 默认全选
  use_select_option?: boolean, // 使用 Select 选项
}
export interface HiFormItemOption<T> {
  tag?: HiFormElTag,
  label?: string, // 标签
  name?: string, // 字段名
  span?: number, // 栅格数
  formrequired?: boolean, // 是否必填
  readonly?: boolean, // 是否只读
  formrequired_config?: any
  default_value_config?: string | DefaultValueConfig, // 默认值配置
  elConfig: T, // 表单元素配置
  onVisible?: (data?: Record<string, any>) => boolean; // 是否显示
}
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
export type FormElementOption = HiInputElOption | HiSelectElOption | HiDateElOption

/**
 * author: 杜朝辉
 * date: 2025-02-19
 * description: 表单项配置
 * @param config 表单项配置JSON文件
 * @returns [HiFormItemOption[], Record<string, any>] 表单项配置和表单数据
 */
export const defineHiFormItems = (config: HiFormItemsConfig) => {
  const formItems: HiFormItemOption<FormElementOption>[] = []
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
      // 设置默认值
      const setDefaultValue = (value: any) => {
        Reflect.set(formData, name, value)
      }
      switch (tag) {
        case 'input':
          Object.assign(formItems[index], defineHiInputConfig(rest as unknown as HiInputOption, setDefaultValue))
          break
        case 'select':
          Object.assign(formItems[index], defineHiSelectConfig(rest as unknown as HiSelectOption, setDefaultValue))
          break
        case 'date':
          Object.assign(formItems[index], defineHiDateConfig(rest as unknown as HiDateOption, setDefaultValue))
          break
      }
    })
  })
  return [reactive(formData), reactive(formItems)]
}