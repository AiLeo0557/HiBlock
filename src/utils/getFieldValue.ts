import { DataTypeOperation } from "./getDataTypeOperation";
const { isObject, isArray, isNumber } = DataTypeOperation;

/**
 * author: 杜朝辉
 * date: 2020-12-03
 * description: 根据字段名获取对象中的值，支持嵌套字段和特殊处理规则
 * @param {string} field_path
 *  - 字段名路径，使用点号分隔嵌套字段 (e.g. 'a.b.c' => obj.a.b.c)
 *     1、如果末级字段用 `` 包裹，则将数组对象的指定字段拼接为字符串；(e.g. 'columns.`props`' => '1,2,3')
 *     2、如果末级字段用 [] 包裹，则返回数组对象的指定字段组成的数组；(e.g. 'columns.[props]' => [1, 2, 3])  
 *     3、如果末级字段用 {} 包裹，则返回数组对象的指定字段组成的新对象数组。(e.g. 'columns.{props}' => [{props: 1}, {props: 2}, {props: 3}])
 * @param {Object} obj - 输入的对象
 * @returns {*} - 返回字段对应的值，如果未找到则返回 undefined
 */
export function getFieldValue(field_path: string, data_source: object, defaultValue?: any): any {
  if (typeof data_source !== 'object' || data_source === null) {
    return undefined; // 如果输入不是对象或为 null，直接返回 undefined
  }

  // 分割字段路径，并检查末级字段的包装符号
  const keys: string[] = [];
  let processingType = null; // 用于记录末级字段的处理类型

  field_path.split('.').forEach(key => {
    if (key.startsWith('`') && key.endsWith('`')) {
      keys.push(key.slice(1, -1)); // 去掉反引号
      processingType = 'concat'; // 拼接字符串
    } else if (key.startsWith('[') && key.endsWith(']')) {
      keys.push(key.slice(1, -1)); // 去掉方括号
      processingType = 'array'; // 返回数组
    } else if (key.startsWith('{') && key.endsWith('}')) {
      keys.push(key.slice(1, -1)); // 去掉大括号
      processingType = 'objectArray'; // 返回对象数组
    } else {
      keys.push(key);
    }
  });

  let result: any = data_source;

  for (const key of keys) {
    console.log('key:', key)
    if (isObject(result) && key in result) {
      result = result[key]; // 逐层深入
    } else if (isArray(result) && isNumber(+key) && +key < result.length) {
      result = result[+key]
      console.log('result:', result)
    } else {
      break // 如果某一层不存在指定字段，返回 undefined
    }
  }
  // 如果末级字段需要特殊处理
  if (processingType && Array.isArray(result)) {
    const targetField = keys[keys.length - 1]; // 获取末级字段名
    switch (processingType) {
      case 'concat': {
        // 拼接数组中每个对象的指定字段值为字符串
        result = result
          .filter(item => item && typeof item === 'object' && targetField in item)
          .map(item => item[targetField])
          .join(',');
        break
      }
      case 'array': {
        // 提取数组中每个对象的指定字段值为数组
        result = result
          .filter(item => item && typeof item === 'object' && targetField in item)
          .map(item => item[targetField]);
        break
      }
      case 'objectArray': {
        // 提取数组中每个对象的指定字段值为新对象数组
        result = result
          .filter(item => item && typeof item === 'object' && targetField in item)
          .map(item => ({ [targetField]: item[targetField] }));
        break
      }
      default:
        result = undefined;
    }
  }
  return result;
}

/**
 * 
  if (field_path.includes('[')) {
    const key = field_path.split('[')[0];
    let sub_key = getStringBetween(field_path, '[', ']');
    let sub_key_value: any
    if (!key && sub_key) {
      let param_value = getFieldValue(sub_key, data_source); // 递归获取子字段值
      return [param_value];
    }
    let param_value = getFieldValue(key, data_source); // 递归获取子字段值
    if (sub_key.includes('===')) {
      ;[sub_key, sub_key_value] = sub_key.split('==='); // 获取子字段名和子字段值
      param_value = param_value.filter((item: any) => Object.is(Reflect.get(item, sub_key), sub_key_value));
    } else {
      param_value = param_value.map((item: any) => Reflect.get(item, sub_key));
    }
    return param_value;
  }
  if (field_path.includes('{')) {
    const key = field_path.split('{')[0];
    let sub_key = getStringBetween(field_path, '{', '}');
    let param_value = getFieldValue(key, data_source); // 递归获取子字段值
    param_value = param_value.map((item: any) => {
      const data = {};
      const sub_key_value = Reflect.get(item, sub_key);
      Reflect.set(data, sub_key, sub_key_value);
      return data;
    });
  }
 */