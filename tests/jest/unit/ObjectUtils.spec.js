import ObjectUtils from '@/lib/ObjectUtils';

test('ObjectUtils.map', () => {
  let obj = {};
  let mappedObj = ObjectUtils.map(obj, x => x * x);
  expect(mappedObj).toEqual({});

  obj = { a: 2 };
  mappedObj = ObjectUtils.map(obj, x => x * x);
  expect(mappedObj).toEqual({ a: 4 });

  obj = { a: 2, b: 4, c: 3 };
  mappedObj = ObjectUtils.map(obj, x => x * x);
  expect(mappedObj).toEqual({ a: 4, b: 16, c: 9 });

  obj = { a: 'foo', b: 'bar', c: 'baz' };
  mappedObj = ObjectUtils.map(obj, (v, k) => `${k}_${v}`);
  expect(mappedObj).toEqual({ a: 'a_foo', b: 'b_bar', c: 'c_baz' });
});
