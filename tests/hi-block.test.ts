// 引入插件
import * as HiBlock from "../dist";

// 测试 getFormData 插件
describe("HiBlock.getFormData", () => {
  const obj = {
    name: 'Leo',
    age: '18'
  };
  // 测试插件是否正确引入
  test("getFormData should be defined", () => {
    expect(HiBlock.getFormData).toBeDefined();
  });
  // 测试插件是否正确使用
  test("getFormData should return a FormData object", () => {
    const formData = HiBlock.getFormData(obj);
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('name')).toBe('Leo');
    expect(formData.get('age')).toBe('18');
  })
});
// 测试 getFormatNum 插件
describe("HiBlock.getFormatNum", () => {
  // 测试插件是否正确引入
  test("getFormatNum should be defined", () => {
    expect(HiBlock.getFormatNum).toBeDefined();
  });
  // 测试插件是否正确使用
  test("getFormatNum should return a formatted number", () => {
    expect(HiBlock.getFormatNum(10000)).toBe('10,000');
    expect(HiBlock.getFormatNum(14665380000.123, 2)).toBe('14,665,380,000.12');
  })
})
// 测试 getFilteFieldsObj 插件
describe("HiBlock.getFilteFieldsObj", () => {
  const obj = {
    name: 'Leo',
    age: '18',
    gender: 'male',

  };
  // 测试插件是否正确引入 
  test("getFilteFieldsObj should be defined", () => {
    expect(HiBlock.getFilteFieldsObj).toBeDefined();
  })
  // 测试插件是否正确使用
  test("getFilteFieldsObj should return a filtered object", () => {
    const filteredObj = HiBlock.getFilteFieldsObj(obj, `name,   age`);
    expect(filteredObj).toEqual({ gender: 'male' });
  })
})
// 测试 getStringBetween 插件
describe("HiBlock.getStringBetween", () => {
  // 测试插件是否正确引入
  test("getStringBetween should be defined", () => {
    expect(HiBlock.getStringBetween).toBeDefined();
  })
  // 测试插件是否正确使用
  test("getStringBetween should return the string between two strings", () => {
    expect(HiBlock.getStringBetween('q<23>[p]r%9%fhhfdjh', 'h', 'j')).toBe('hfd');
  })
})
// 测试 getFieldValue 插件
describe("HiBlock.getFieldValue", () => {
  // 测试插件是否正确引入
  test("getFieldValue should be defined", () => {
    expect(HiBlock.getFieldValue).toBeDefined();
  })
  // 测试插件是否正确使用
  test("getFieldValue should return the value of a field", () => {
    const obj = {
      name: 'Leo', age: '18', gender: 'male',
      family: { father: 'Tom', mother: 'Lucy' },
      friends: [
        { name: 'Jack', age: '18' },
        { name: 'Lily', age: '17' }
      ]
    };
    // expect(HiBlock.getFieldValue('family.father', obj)).toBe('Tom');
    expect(HiBlock.getFieldValue('friends.`name`', obj)).toBe('Jack,Lily');
    expect(HiBlock.getFieldValue('friends.[age]', obj)).toEqual(['18', '17']);
    // expect(HiBlock.getFieldValue('friends[0].name', obj)).toBe('Jack');
    expect(HiBlock.getFieldValue('friends.{age}', obj)).toEqual([{ age: '18' }, { age: '17' }]);
  })
  // 测试数组索引
  test("getFieldValue should return the value of a field with array index", () => {
    const obj = {
      name: 'Leo', age: '18', gender: 'male',
      family: { father: 'Tom', mother: 'Lucy' },
      friends: [
        { name: 'Jack', age: '18' },
        { name: 'Lily', age: '17' }
      ]
    };
    expect(HiBlock.getFieldValue('friends.0.name', obj)).toBe('Jack');
  })
})
// 测试 getRequestParams 插件
describe("HiBlock.getRequestParams", () => {
  // 测试插件是否正确引入
  test("getRequestParams should be defined", () => {
    expect(HiBlock.getRequestParams).toBeDefined();
  })
  // 测试插件是否正确使用
  test("getRequestParams should return the request params", () => {
    const data1 = { name: 'Leo', age: '18', gender: 'male' };
    const data2 = { family: { father: 'Tom', mother: 'Lucy' }, friends: [{ name: 'Jack', age: '18' }, { name: 'Lily', age: '17' }] };
    // 形式一 param_obj 为对象
    const params = HiBlock.getRequestParams({ name: '', friends: [] }, {
      param_name_key: 'data1.name',
      param_friends_key: 'data2.friends.[name]'
    }, { data1, data2 });
    // 形式三 param_obj 为数组
    const params2 = HiBlock.getRequestParams([], { param_value_name: 'data2.friends.[name]' }, { data1, data2 });
    expect(params2).toEqual(['Jack', 'Lily']);
  })
})
// 测试 getDataTypeOperation 插件
describe("HiBlock.getDataTypeOperation", () => {
  // 测试插件是否正确引入
  test("getDataTypeOperation should be defined", () => {
    expect(HiBlock.DataTypeOperation.getDataType).toBeDefined();
  })
  // 测试插件是否正确使用
  test("getDataTypeOperation should return the data type operation", () => {
    expect(HiBlock.DataTypeOperation.getDataType(123)).toBe('number');
    expect(HiBlock.DataTypeOperation.isArray([])).toBe(true);
    expect(HiBlock.DataTypeOperation.isObject({})).toBe(true);
    expect(HiBlock.DataTypeOperation.isString('123')).toBe(true);
    expect(HiBlock.DataTypeOperation.isNumber(123)).toBe(true);
    expect(HiBlock.DataTypeOperation.isBoolean(true)).toBe(true);
  })
})
// 测试 useElementMounted 插件
// describe("HiBlock.useElementMounted", () => {
//   // 测试插件是否正确引入
//   test("useElementMounted should be defined", () => {
//     expect(HiBlock.useElementMounted).toBeDefined();
//   })
//   // 测试插件是否正确使用
//   test("useElementMounted should return the element mounted", () => {
//     // const element = HiBlock.useElementMounted
//     // expect(element).toBe('div');
//     const elementIsMounted = HiBlock.useElementMounted('#app');
//     expect(elementIsMounted.value).toBe(false);
//   })
// })
// 测试 useInputConfig 插件
describe("HiBlock.useInputConfig", () => {
  // 测试插件是否正确引入
  test("useInputConfig should be defined", () => {
    expect(HiBlock.useInputConfig).toBeDefined();
  })
  // 测试插件是否正确使用
  test("useInputConfig should return the input config", () => {
    // 留空默认为 text
    const inputConfig = HiBlock.useInputConfig([, ,]);
    expect(inputConfig.elConfig).toEqual({
      type: 'text',
    })
    // null 默认为 text
    const inputConfig2 = HiBlock.useInputConfig([null, null, null]);
    expect(inputConfig2.elConfig).toEqual({
      type: 'text',
    })
    // 定义 default_value
    const inputConfig3 = HiBlock.useInputConfig([
      'hidden',
      null,
      null,
      {
        computed_config: {
          method: 'request',
          args: [
            'engine-finance/igGkLocal/querySum',
            { ttime: [], dxid: '' },
            {
              param_ttime_key: 'formData.ttime',
              param_dxid_key: 'formData.jzCode',
              param_not_null_key: 'ttime'
            }
          ],
        }
      }
    ]);
  })
})
// 测试 useSelectConfig 插件
describe("HiBlock.useSelectConfig", () => {
  // 测试插件是否正确引入
  test("useSelectConfig should be defined", () => {
    expect(HiBlock.useSelectConfig).toBeDefined();
  })
  // 测试插件是否正确使用
  test("useSelectConfig should return the select config", () => {
    const selectConfig = HiBlock.useSelectConfig(['ENTERPRISE_TYPE']);
    expect(selectConfig).toEqual({
      span: 24,
      elConfig: {
        options_config: {
          alias: ['enumValue', 'enumCode'],
          args: [
            'engine-bill/combox/queryFsApdEnums',
            { codeType: 'ENTERPRISE_TYPE' },
            { res_key_name: 'res.resultValue.0.value' }
          ]
        }
      }
    })
  })
})
// 测试 useHiFormItems 插件
describe("HiBlock.useHiFormItems", () => {
  // 测试插件是否正确引入
  test("useHiFormItems should be defined", () => {
    expect(HiBlock.useHiFormItems).toBeDefined();
  })
  // 测试插件是否正确使用
  test("useHiFormItems should return the form items", () => {
    const form_config = {
      input: [
        [0, '市场主体名称', 'caption', null, null, null, '浙江大唐能源营销有限公司', true, null, 5],
        [1, '市场主体类型', 'type', null, null, null, null, null, null, 5],
      ],
      select: [
        [2, '企业性质', 'enterpriseType', 'ENTERPRISE_TYPE', null, null, true, null, 10, null, 5, true],
      ]
    }
    const [formData, formItems] = HiBlock.useHiFormItems(form_config as any)
    expect(formData).toEqual({
      caption: '浙江大唐能源营销有限公司',
      type: undefined,
      enterpriseType: 10
    })
    expect(formItems).toEqual([
      {
        tag: 'input',
        label: '市场主体名称',
        name: 'caption',
        span: 5,
        elConfig: { type: 'text' },
        formrequired: true
      },
      {
        tag: 'input',
        label: '市场主体类型',
        name: 'type',
        span: 5,
        elConfig: { type: 'text' }
      },
      {
        tag: 'select',
        label: '企业性质',
        name: 'enterpriseType',
        span: 5,
        elConfig: {
          multiple: true,
          options_config: {
            alias: ['enumValue', 'enumCode'],
            args: [
              'engine-bill/combox/queryFsApdEnums',
              { codeType: 'ENTERPRISE_TYPE' },
              {
                res_key_name: 'res.resultValue.0.value'
              }
            ]
          }
        },
        formrequired: true
      }
    ])
  })
})
