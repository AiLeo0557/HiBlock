import { DataTypeOperation } from "./getDataTypeOperation";
import { getFieldValue } from "./getFieldValue";

/**
 * author: 杜朝辉
 * date: 2025-02-17
 * description: 获取请求参数
 * @param {Object} param_obj - 输入的对象
 * @param {Object} param_options - 配置项
 * @param {Object} data_source - 数据源
 */
export function getRequestParams(param_obj: Record<string, any>, param_options: Record<string, any>, data_source: Record<string, any>) {
  let params = {};
  /**
   * 形式一:
   * param_obj 的样式 { param1: 'value1', param2: 'value2' }
   * param_obj 的格式为对象,返回的param 的格式也为对象;
   */
  if (
    DataTypeOperation.isPlainObject(param_obj) && // 过滤掉非对象
    !DataTypeOperation.isEmptyObject(param_obj) // 过滤掉空对象 {}
  ) {
    // 遍历param_obj的每一项
    Object.entries(param_obj).forEach(([key, value]) => {
      // 获取参数名
      const param_key_name = Reflect.get(param_options, `param_${key}_key`);
      // 如果没有设置参数名，则直接使用对象的key作为参数名
      if (!param_key_name) {
        Reflect.set(params, key, value);
        return;
      }
      let param_value: any; // 获取参数值
      // 如果参数名包含runcode_，则执行代码
      if (param_key_name.includes('runcode_')) {
        param_value = eval(param_key_name.replace('runcode_', '')); // 执行代码
      }
      // 如果参数名是数组，则获取数组中的每一项的值
      else if (Array.isArray(param_key_name)) {
        param_value = param_key_name.map((key_name: string) => getFieldValue(key_name, data_source));
      }
      // 否则，获取参数值
      else {
        param_value = getFieldValue(param_key_name, data_source); // 获取参数值
        // 如果参数值是字符串，且参数值是数组，则转换为数组
        if (Array.isArray(value) && typeof param_value === 'string') {
          param_value = [param_value]; // 如果参数值是字符串，且参数值是数组，则转换为数组
        }
      }
      // value 的格式是字符串, param_value 的格式是数组
      if (typeof value === 'string' && Array.isArray(param_value)) {
        param_value = param_value.join(','); // 将数组转换为字符串
      }
      // 设置参数
      Reflect.set(params, key, param_value);
    })
  }
  /**
   * 形式二:
   * 使用范围最小，只支持一个参数
   */
  if (
    param_options && // 过滤掉空对象 null
    Reflect.has(param_options, 'param_key_name') && // 过滤掉没有设置参数的配置项
    Reflect.has(param_options, 'param_value_name') // 过滤掉没有设置参数的配置项
  ) {
    // 获取参数名和参数值
    const param_key_name = Reflect.get(param_options, 'param_key_name');
    const param_value_name = Reflect.get(param_options, 'param_value_name');
    const param_value = getFieldValue(param_value_name, data_source); // 获取参数值
    // 设置参数
    Reflect.set(params, param_key_name, param_value);
  }
  /**
   * 形式三:
   * param_obj 的样式 [{reatUser: '', userName: ''}]
   * param_obj 的格式为数组,返回的param 的格式也为数组;
   * 其中 createrUser、userName 是指数组中的每一项要追加的参数;
   */
  if (
    DataTypeOperation.isArray(param_obj) &&
    param_options?.param_value_name // param_value_name 不能为空
  ) {
    const param_value_name = Reflect.get(param_options, 'param_value_name');
    let param_value = getFieldValue(param_value_name, data_source); // 获取参数值
    if (param_obj[0] && typeof param_obj[0] === 'object') {
      const param_item_supplement = getRequestParams(param_obj[0], param_options, data_source);
      param_value = param_value.map((item: any) => Object.assign(item, param_item_supplement));
    }
    params = param_value
  }
  return params;
}