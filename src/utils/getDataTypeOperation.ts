/**
 * author: 杜朝辉
 * date: 2025-02-08
 * description: 获取数据类型
 */
enum DataType {
  UNDEFINED = "undefined",
  NULL = "null",
  BOOLEAN = "boolean",
  NUMBER = "number",
  STRING = "string",
  SYMBOL = "symbol",
  FUNCTION = "function",
  ARRAY = "array",
  DATE = "date",
  REGEXP = "regexp",
  PROMISE = "promise",
  ERROR = "error",
  OBJECT = "object"
}
const objectToString: typeof Object.prototype.toString =
  Object.prototype.toString;
const dataTypes: string[] = [
  "undefined",
  "null",
  "boolean",
  "number",
  "string",
  "symbol",
  "function",
  "array",
  "date",
  "regexp",
  "promise",
  "error",
  "object",
];
const dataTypeMap: { [key: string]: string } = dataTypes.reduce(
  (acc, cur) => {
    if (cur !== undefined) {
      acc[cur] = `[object ${cur.at(0)!.toUpperCase()}${cur.slice(1)}]`;
    }
    return acc;
  },
  {} as { [key: string]: string }
);
export function isType(data: any, type: string): boolean {
  return objectToString.call(data) === dataTypeMap[type];
}

export class DataTypeOperation {
  // 静态方法，获取数据类型
  static getDataType(data: any): string {
    // 使用Object.prototype.toString.call()方法获取数据类型
    return objectToString.call(data).slice(8, -1).toLowerCase();
  }
  // 判断传入的参数是否为空对象
  static isEmptyObject(data: any): boolean {
    // 判断传入的参数是否为对象
    return DataTypeOperation.isObject(data) && Object.keys(data).length === 0;
  }
  // 判断传入的数据是否为文档
  static isDocument(data: any): data is Document {
    // 判断传入的数据是否为对象类型
    return DataTypeOperation.isObjectLike(data) && data.nodeType === 9;
  }
  // 判断data是否为window对象
  static isWindow(data: any): data is Window {
    // 判断data是否为对象
    return DataTypeOperation.isObjectLike(data) && data === data.window;
  }
  static isObject(data: any): data is Object {
    return isType(data, "object");
  }
  static isArray(data: any): data is Array<any> {
    return isType(data, "array");
  }
  static isFunction(data: any): data is Function {
    return isType(data, "function");
  }
  static isString(data: any): data is String {
    return isType(data, "string");
  }
  static isNumber(data: any): data is Number {
    return isType(data, "number");
  }
  static isBoolean(data: any): data is Boolean {
    return isType(data, "boolean");
  }
  static isUndefined(data: any): data is undefined {
    return isType(data, "undefined");
  }
  static isNull(data: any): data is null {
    return isType(data, "null");
  }
  static isSymbol(data: any): data is Symbol {
    return isType(data, "symbol");
  }
  static isDate(data: any): data is Date {
    return isType(data, "date");
  }
  static isRegExp(data: any): data is RegExp {
    return isType(data, "regexp");
  }
  static isPromise(data: any): data is Promise<any> {
    return isType(data, "promise");
  }
  static isError(data: any): data is Error {
    return isType(data, "error");
  }
  static isPrimitive(data: any): data is string | number | boolean | symbol | undefined | null {
    return (
      DataTypeOperation.isUndefined(data) ||
      DataTypeOperation.isNull(data) ||
      DataTypeOperation.isBoolean(data) ||
      DataTypeOperation.isNumber(data) ||
      DataTypeOperation.isString(data) ||
      DataTypeOperation.isSymbol(data)
    );
  }
  static isObjectLike(data: any): data is Object {
    return DataTypeOperation.isObject(data) && !DataTypeOperation.isNull(data);
  }
  static isPlainObject(data: any): data is { [key: string]: any } {
    return DataTypeOperation.isObjectLike(data) && data.constructor === Object;
  }
  static isElement(data: any): data is HTMLElement {
    return DataTypeOperation.isObjectLike(data) && data.nodeType === 1;
  }
  // 判断传入的参数不为空同时不为undefined
  static isNotEmpty(data: any): boolean {
    return data !== undefined && data !== null && data !== "";
  }
}