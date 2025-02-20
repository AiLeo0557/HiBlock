import { HiFormItemOption, VisibleConfig } from "./useHiFormItems"
import { DataTypeOperation } from "../utils/getDataTypeOperation";
import { createTypeGuard } from "../factories/createTupleGuard";
import dayjs, { ManipulateType } from "dayjs";
const { isNull, isString, isObject, isUndefined, isArray, isBoolean } = DataTypeOperation;

type disabled_date_st = [start?: string, end?: string]
type DateType = 'year' | 'month' | 'date' | 'datetime' | 'time' | 'week' | 'daterange' | 'monthrange' | 'datetimerange' | 'timerange' | 'yearrange'
interface DefaultDateValueConfig {
  offset_amount: number | [number, number],
  offset_unit: ManipulateType,
}
export const isDefaultDateValueConfig = createTypeGuard<DefaultDateValueConfig>(['offset_amount', 'offset_unit'])
export type HiDateOption = [
  type: DateType, // 类型
  format_config?: [format: string | null, value_format: string | null], // 格式
  disabled_config?: boolean | disabled_date_st | null, // 禁用配置
  default_value_config?: DefaultDateValueConfig | string | null, // 默认值配置
  visible_config?: VisibleConfig | null, // 是否显示
  span?: number | null, // 表单栅格
  required?: boolean | null, // 是否必填
]
export interface HiDateElOption {
  type: DateType, // 类型
  format?: string, // 格式
  valueFormat?: string, // 值格式
  multiple?: boolean,
  disabled?: boolean,
  disabledDateStartKey?: string,
  disabledDateEndKey?: string,
}
export function isDateType(value: any): value is DateType {
  const dateTypes: DateType[] = [
    'year',
    'month',
    'date',
    'datetime',
    'time',
    'week',
    'daterange',
    'monthrange',
    'datetimerange',
    'timerange',
    'yearrange'
  ];
  return typeof value === 'string' && dateTypes.includes(value as DateType);
}
/**
 * author: 杜朝辉
 * date: 2025-02-20
 * description: Date 组件配置
 */
export function useHiDateConfig(config_options: HiDateOption, setDefaultValue?: any): HiFormItemOption<HiDateElOption> {
  const defaultConfig: HiFormItemOption<HiDateElOption> = {
    span: 24, // 栅格数
    elConfig: {
      type: 'date', // 类型
      format: undefined, // 格式
      valueFormat: undefined, // 值格式
    } // el组件配置
  }
  const [
    type,
    format_config,
    disabled_config,
    default_value_config,
    visible_config,
    span,
    required,
  ] = config_options
  // 设置 type
  if (isDateType(type)) defaultConfig.elConfig.type = type
  // 设置 format_config
  if (format_config) {
    const [format, value_format] = format_config
    if (isString(format)) defaultConfig.elConfig.format = format
    if (isString(value_format)) defaultConfig.elConfig.valueFormat = value_format
  }
  // 设置 disabled_config
  if (isBoolean(disabled_config) || isObject(disabled_config)) {
    if (isBoolean(disabled_config)) {
      defaultConfig.elConfig.disabled = disabled_config
    }
    if (isArray(disabled_config)) {
      const [disabledDateStartKey, disabledDateEndKey] = disabled_config
      if (disabledDateStartKey) defaultConfig.elConfig.disabledDateStartKey = disabledDateStartKey
      if (disabledDateEndKey) defaultConfig.elConfig.disabledDateEndKey = disabledDateEndKey
    }
  }
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
  // 设置 default_value_config
  if (default_value_config && setDefaultValue) {
    let res
    if (isString(default_value_config)) {
      res = default_value_config
    }
    if (isDefaultDateValueConfig(default_value_config)) {
      const { offset_amount, offset_unit } = default_value_config
      const [format, value_format] = format_config
      if (type.includes('range')) {
        if (isArray(offset_amount)) {
          res = [
            dayjs().subtract(offset_amount[0], offset_unit).format(value_format),
            dayjs().subtract(offset_amount[1], offset_unit).format(value_format),
          ]
        } else {
          res = [
            dayjs().subtract(offset_amount, offset_unit).format(value_format),
            dayjs().format(value_format),
          ]
        }
      }
      if (isNumber(offset_amount)) {
        res = dayjs().subtract(offset_amount, offset_unit).format(value_format)
      }
    }
    setDefaultValue(res)
  }
  // 设置 span
  if (!isNull(span) && !isUndefined(span)) defaultConfig.span = span as number
  // 设置 required
  if (isBoolean(required)) defaultConfig.formrequired = required as boolean
  return defaultConfig
}
