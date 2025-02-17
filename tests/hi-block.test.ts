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
})
