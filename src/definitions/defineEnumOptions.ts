import type { EnumOptionsAlias, HiSelectOptionsConfig } from "../hook/useSelectConfig";

/**
 * author: 杜朝辉
 * date: 2025-02-19
 * description: 枚举选项定义
 */
export function defineEnumOptions(codeType: string, alias_str?: string): HiSelectOptionsConfig<{ codeType: string }> {
  const alias = alias_str?.split(',') as EnumOptionsAlias || ['enumValue', 'enumCode'];
  return {
    alias,
    args: [
      'engine-bill/combox/queryFsApdEnums',
      {
        codeType
      },
      {
        onFormat(res: any) {
          return res.resultValue[0].compare_value
        }
      }
    ]
  }
}