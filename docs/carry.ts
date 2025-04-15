const join = (a, b, c) => {
  return `${a}_${b}_${c}`
}
const curriedJoin = curry(join)
curriedJoin(1, 2, 3) // '1_2_3'
curriedJoin(1)(2, 3) // '1_2_3'
curriedJoin(1, 2)(3) // '1_2_3'