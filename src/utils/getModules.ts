/**
 * author: 杜朝辉
 * date: 2025-02-17
 * description: 获取VUE组件模块Map
 * 
 */

export function getModules(modules: Record<string, any>) {
  const modules_map = new Map<string, any>();
  Object.keys(modules).forEach((key) => {
    modules_map.set(key, modules[key]);
  });
  return modules_map;
}