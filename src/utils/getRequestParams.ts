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
  if (
    param_obj && // 过滤掉空对象 null
    typeof param_obj === 'object' && // 过滤掉非对象
    !Array.isArray(param_obj) && // 过滤掉数组
    Object.keys(param_obj).length > 0 // 过滤掉空对象 {}
  ) {
    Object.entries(param_obj).forEach(([key, value]) => {
      const param_key_name = Reflect.get(param_options, `Param_${key}_key`);
      // 如果没有设置参数名，则直接使用对象的key作为参数名
      if (!param_key_name) {
        Reflect.set(params, key, value);
        return;
      }
      let param_value: any; // 获取参数值
      if (param_key_name.includes('runcode_')) {
        param_value = eval(param_key_name.replace('runcode_', '')); // 执行代码
      }
      if (Array.isArray(param_key_name)) {
        param_value = param_key_name.map((key_name: string) => getFieldValue(key_name, data_source));
      }
    })
  }
}