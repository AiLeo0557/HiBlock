/**
 * author: 杜朝辉
 * date: 2025-02-19
 * description: 创建元组守卫
 */
export function createTupleGuard<T extends unknown[]>(...types: T): (arr: any[]) => arr is T {
  return (arr: any[]): arr is T => {
    if (!Array.isArray(arr) || arr.length !== types.length) return false;
    return arr.every((value, index) => typeof value === typeof types[index]);
  };
}