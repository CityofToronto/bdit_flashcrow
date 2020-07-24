import { setdefault } from '@/lib/MapUtils';

test('MapUtils.setdefault', () => {
  const map = new Map();

  expect(setdefault(map, 'foo', 42)).toEqual(42);
  expect(map.get('foo')).toEqual(42);

  expect(setdefault(map, 'foo', 17)).toEqual(42);
  expect(map.get('foo')).toEqual(42);

  let bar = setdefault(map, 'bar', []);
  expect(map.get('bar')).toEqual([]);
  bar.push('a');

  bar = setdefault(map, 'bar', []);
  expect(map.get('bar')).toEqual(['a']);
  bar.push('b');
  expect(map.get('bar')).toEqual(['a', 'b']);
});
