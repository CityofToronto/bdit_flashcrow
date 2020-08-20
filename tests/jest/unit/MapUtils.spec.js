import { mapBy, setdefault } from '@/lib/MapUtils';

test('MapUtils.mapBy', () => {
  let xs = [];
  expect(mapBy(xs, x => Math.floor(x))).toEqual(new Map([]));

  xs = [1];
  expect(mapBy(xs, x => Math.floor(x))).toEqual(new Map([
    [1, 1],
  ]));

  xs = [1, 1];
  expect(mapBy(xs, x => Math.floor(x))).toEqual(new Map([
    [1, 1],
  ]));

  xs = [1, 2];
  expect(mapBy(xs, x => Math.floor(x))).toEqual(new Map([
    [1, 1],
    [2, 2],
  ]));

  xs = [1, Math.E, 3, 2, Math.PI];
  expect(mapBy(xs, x => Math.floor(x))).toEqual(new Map([
    [1, 1],
    [2, 2],
    [3, Math.PI],
  ]));
});

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
