import type { InputProps } from 'element-plus'
import type { RequestArgument } from '../utils/getRequestParams';
import { DataTypeOperation } from '../utils/getDataTypeOperation';

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
export interface HiFormItemOption<T> {
  span?: number, // 栅格数
  formrequired?: boolean, // 是否必填
  readonly?: boolean, // 是否只读
  formrequired_config?: any
  default_value_config?: string | ComputedConfig<any>, // 默认值配置
  elConfig: T, // 表单元素配置
  onVisible?: (data?: Record<string, any>) => boolean; // 是否显示
}
export type FormElementOption = []
export type FormItemOption = []

export interface ContentLayoutConfig {
  sider_visiable?: boolean, // 侧边栏是否显示
  table_visiable?: boolean, // 表格是否显示
}

export interface ContentSiderConfig {

}
export interface ContentConfig { }
export interface MoreOptionConfig {
  option_config: {
    label_key: string, // 标签字段名
    value_key: string, // 值字段名
    file_key: string, // 文件字段名
    file_name_key: string, // 文件名字段名
  }
  dialog_config: {
    title: string, // 弹窗标题
    width: number, // 弹窗宽度
  }
  content_config: {
    component: string, // 组件名
    configs_data: {
      layout_config: ContentLayoutConfig, // 布局配置
      args: RequestArgument<any>,
    }
  }
}
export interface VisibleConfig {
  key: string, // 关联字段
  value: string, // 关联值
  be_equal: string
}
export type HiInputOption = [
  type?: string, // 类型
  append?: string, // 后缀
  disabled?: boolean, // 是否禁用
  default_value?: string, // 默认值
  required?: boolean, // 是否必填
  visible_config?: VisibleConfig,
  span?: number, // 栅格数
  more_option_config?: MoreOptionConfig, // 更多配置
]
export function useInputConfig(config_options: HiInputOption, setDefaultValue?: any): HiFormItemOption<InputProps> {
  const defaultConfig: HiFormItemOption<InputProps> = {
    span: 24,
    formrequired: false,
    readonly: false,
    elConfig: {
      placeholder: '', // 占位符
      maxlength: 0, // 最大长度
      minlength: 0, // 最小长度
      type: 'text', // 输入框类型
      prefix: '', // 前缀
      suffix: '', // 后缀
      clearable: false, // 是否可清空
      showPassword: false, // 是否显示密码
      showWordLimit: false, // 是否显示字数限制
      rows: 2, // 文本域行数
      autosize: false, // 自动调整高度
      autocomplete: 'off', // 自动完成
    }
  }
  const [
    type = 'text',
    append = '',
    disabled,
    default_value,
    required,
    visible_config,
    span,
    more_option_config,
  ] = config_options
  // 设置 type
  defaultConfig.elConfig.type = type
  // 设置 append
  if (DataTypeOperation.isNotEmpty(append)) defaultConfig.elConfig.append = append
  // 设置 disabled
  if (DataTypeOperation.isNotEmpty(disabled) && DataTypeOperation.isBoolean(disabled)) defaultConfig.elConfig.disabled = disabled
  // 设置 default_value_config
  if (default_value && !DataTypeOperation.isString(default_value) && setDefaultValue) setDefaultValue(default_value)
  if (default_value && !DataTypeOperation.isEmptyObject(default_value)) defaultConfig.default_value_config = default_value
  // 设置 formrequired
  if (DataTypeOperation.isNotEmpty(required) && DataTypeOperation.isBoolean(required)) defaultConfig.formrequired = required
  if (DataTypeOperation.isNotEmpty(disabled) && DataTypeOperation.isObject(required)) defaultConfig.formrequired_config = disabled
  // 设置 visible_config
  defaultConfig.onVisible = (data?: Record<string, any>): boolean => {
    if (DataTypeOperation.isNotEmpty(visible_config)) {
      const { key, value, be_equal } = visible_config!
      const compare_value = data![key]
      if (be_equal) {
        return compare_value === value
      }
      if (!be_equal) {
        return compare_value !== value
      }
    }
    return true
  }
  // 设置 span
  if (DataTypeOperation.isNotEmpty(span)) defaultConfig.span = span
  return defaultConfig
}
export type HiFormElTag = 'input' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'time' | 'datetime' | 'textarea' | 'cascader' | 'upload' | 'slider' | 'rate' | 'color' | 'tree' | 'table' | 'custom'
export type HiFormItemConfigOptions = [
  index: number, // 序号
  label: string, // 标签
  name: string, // 字段名
  type: string, // 类型
  ...(string | boolean | number | VisibleConfig | MoreOptionConfig)[], // 其他配置
]
export interface HiFormItemConfig {
  tag: HiFormElTag,
  label: string, // 标签
  name: string, // 字段名
}
export type HiFormItemsConfig = {
  [key in HiFormElTag]: HiFormItemConfigOptions[];
};
export const useHiFormItems = (config: HiFormItemsConfig) => {
  const formItems: HiFormItemConfig[] = []
  const formData = {}
  Object.entries(config).forEach(([tag, items]: [string, HiFormItemConfigOptions[]]) => {
    items.forEach((item: HiFormItemConfigOptions) => {
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
  return config
}