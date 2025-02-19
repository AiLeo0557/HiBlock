import type { HiRequestArgument } from "../utils/getRequestParams";
import type { FixedLengthArray } from '../types';

export type EnumOptionsAlias = FixedLengthArray<string, 2>;
/**
 * author: 杜朝辉
 * date: 2025-02-19
 * description: 枚举选项定义
 */
export interface EnumOptionsRes {
  alias: EnumOptionsAlias,
  args: HiRequestArgument<{ codeType: string }>,
}
export function defineEnumOptions(codeType: string, alias_str?: string): EnumOptionsRes {
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