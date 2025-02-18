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
export function isObject(data: any): boolean {
  return isType(data, "object");
}
export function isArray(data: any): boolean {
  return isType(data, "array");
}
export function isFunction(data: any): boolean {
  return isType(data, "function");
}
export function isString(data: any): boolean {
  return isType(data, "string");
}
export function isNumber(data: any): boolean {
  return isType(data, "number");
}
export function isBoolean(data: any): boolean {
  return isType(data, "boolean");
}
export function isUndefined(data: any): boolean {
  return isType(data, "undefined");
}
export function isNull(data: any): boolean {
  return isType(data, "null");
}
export function isSymbol(data: any): boolean {
  return isType(data, "symbol");
}
export function isDate(data: any): boolean {
  return isType(data, "date");
}
export function isRegExp(data: any): boolean {
  return isType(data, "regexp");
}
export function isPromise(data: any): boolean {
  return isType(data, "promise");
}
export function isError(data: any): boolean {
  return isType(data, "error");
}
export function isPrimitive(data: any): boolean {
  return (
    isUndefined(data) ||
    isNull(data) ||
    isBoolean(data) ||
    isNumber(data) ||
    isString(data) ||
    isSymbol(data)
  );
}
export function isObjectLike(data: any): boolean {
  return isObject(data) && !isNull(data);
}
export function isPlainObject(data: any): boolean {
  return isObjectLike(data) && data.constructor === Object;
}
export function isElement(data: any): boolean {
  return isObjectLike(data) && data.nodeType === 1;
}
export function isWindow(data: any): boolean {
  return isObjectLike(data) && data === data.window;
}
export function isDocument(data: any): boolean {
  return isObjectLike(data) && data.nodeType === 9;
}
// 判断是否为空对象
export function isEmptyObject(data: any): boolean {
  return isObject(data) && Object.keys(data).length === 0;
}
export function getDataType(data: any): string {
  return objectToString.call(data).slice(8, -1).toLowerCase();
}