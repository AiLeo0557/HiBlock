import { DataTypeOperation } from "../utils/getDataTypeOperation"
import { HiRequestArgument } from "../utils/getRequestParams"
import type { ComputedConfig, DefaultValueConfig, HiFormItemOption, VisibleConfig } from "./useHiFormItems"
const { isNull, isPrimitive, isUndefined, isNotEmptyObject, isNotEmpty, isBoolean, isEmptyObject, isString, isObject } = DataTypeOperation
export interface ContentLayoutConfig {
  sider_visiable?: boolean, // 侧边栏是否显示
  table_visiable?: boolean, // 表格是否显示
}
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
      args: HiRequestArgument<any>,
    }
  }
}
export type HiInputOption = [
  type?: string | null, // 类型
  append?: string | null, // 后缀
  disabled?: boolean | null, // 是否禁用
  default_value?: string | DefaultValueConfig | null, // 默认值
  required?: boolean | null, // 是否必填
  visible_config?: VisibleConfig | null,
  span?: number | null, // 栅格数
  more_option_config?: MoreOptionConfig, // 更多配置
]
export interface HiInputElOption {
  type?: string, // 类型
  append?: string, // 后缀
  disabled?: boolean, // 是否禁用
  default_value_config?: DefaultValueConfig, // 默认值
}
/**
 * author: 杜朝辉
 * date: 2025-02-19
 * description: input组件配置
 */
export function useInputConfig(config_options: HiInputOption, setDefaultValue?: any): HiFormItemOption<HiInputElOption> {
  const defaultConfig: HiFormItemOption<HiInputElOption> = {
    span: 24, // 栅格数
    elConfig: {} // el组件配置
  }
  const [
    type = 'text',
    append,
    disabled,
    default_value,
    required,
    visible_config,
    span,
    more_option_config,
  ] = config_options
  // 设置 type
  defaultConfig.elConfig.type = type || 'text'
  // 设置 append
  if (!isNull(append) && !isUndefined(append)) defaultConfig.elConfig.append = append
  // 设置 disabled
  if (isNotEmpty(disabled) && isBoolean(disabled)) defaultConfig.elConfig.disabled = disabled
  // 设置 default_value_config
  if (default_value && isPrimitive(default_value) && setDefaultValue) setDefaultValue(default_value)
  if (default_value && isNotEmptyObject(default_value)) defaultConfig.default_value_config = default_value
  // 设置 formrequired
  if (isNotEmpty(required) && isBoolean(required)) defaultConfig.formrequired = required
  if (isNotEmpty(disabled) && isObject(required)) defaultConfig.formrequired_config = disabled
  // 设置 visible_config
  if (visible_config) {
    defaultConfig.onVisible = (data?: Record<string, any>): boolean => {
      const { key, value, be_equal } = visible_config!
      const compare_value = data![key]
      if (be_equal) {
        return compare_value === value
      }
      if (!be_equal) {
        return compare_value !== value
      }
      return false
    }
  }

  // 设置 span
  if (!isNull(span) && !isUndefined(span)) defaultConfig.span = span
  return defaultConfig
}