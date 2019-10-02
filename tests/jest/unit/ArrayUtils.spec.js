import ArrayUtils from '@/lib/ArrayUtils';
import { SortDirection } from '@/lib/Constants';

test('ArrayUtils.range()', () => {
  expect(ArrayUtils.range(-1)).toEqual([]);
  expect(ArrayUtils.range(3, 3)).toEqual([]);
  expect(ArrayUtils.range(4, 3)).toEqual([]);
  expect(ArrayUtils.range(0, 3)).toEqual([0, 1, 2]);
  expect(ArrayUtils.range(3)).toEqual([0, 1, 2]);
  expect(ArrayUtils.range(-1, 3)).toEqual([-1, 0, 1, 2]);
  expect(ArrayUtils.range(1, 3)).toEqual([1, 2]);

  const N = 20;
  const k = 10;
  for (let i = 0; i < N; i++) {
    let lo = Math.floor(Math.random() * k);
    let hi = Math.floor(Math.random() * k);
    if (lo > hi) {
      [lo, hi] = [hi, lo];
    }
    const xs = ArrayUtils.range(lo, hi);
    const n = hi - lo;
    expect(xs).toHaveLength(n);
    for (let j = 0; j < n; j++) {
      expect(xs[j]).toBe(lo + j);
    }
  }
});

test('ArrayUtils.sumObjects()', () => {
  const xs = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
    { a: 5, c: 6 },
    { b: 7 },
  ];
  let sum;

  sum = ArrayUtils.sumObjects([]);
  expect(sum).toStrictEqual({});

  sum = ArrayUtils.sumObjects([{}]);
  expect(sum).toStrictEqual({});

  sum = ArrayUtils.sumObjects([xs[0]]);
  expect(sum).toStrictEqual(xs[0]);

  sum = ArrayUtils.sumObjects([xs[0], {}]);
  expect(sum).toStrictEqual(xs[0]);

  sum = ArrayUtils.sumObjects([xs[0], xs[1]]);
  expect(sum).toStrictEqual({ a: 4, b: 6 });

  sum = ArrayUtils.sumObjects(xs);
  expect(sum).toStrictEqual({ a: 9, b: 13, c: 6 });
});

test('ArrayUtils.selectIndices()', () => {
  const xs = ArrayUtils.range(10, 20);
  let ys;

  ys = ArrayUtils.selectIndices(xs, []);
  expect(ys).toStrictEqual([]);

  ys = ArrayUtils.selectIndices(xs, [0]);
  expect(ys).toStrictEqual([xs[0]]);

  ys = ArrayUtils.selectIndices(xs, [0, 1, 2]);
  expect(ys).toStrictEqual([xs[0], xs[1], xs[2]]);

  ys = ArrayUtils.selectIndices(xs, ArrayUtils.range(0, 10));
  expect(ys).toStrictEqual(xs);
});

test('ArrayUtils.getMinBy()', () => {
  const xs = [
    { foo: 42, bar: 'c' },
    { foo: 1729, bar: 'b' },
    { foo: 1234, bar: 'a' },
  ];
  let xMin;

  xMin = ArrayUtils.getMinBy([], x => x.foo);
  expect(xMin).toBeNull();

  xMin = ArrayUtils.getMinBy([xs[0]], x => x.foo);
  expect(xMin).toBe(xs[0]);

  xMin = ArrayUtils.getMinBy(xs, x => x.foo);
  expect(xMin).toBe(xs[0]);

  xMin = ArrayUtils.getMinBy(xs, x => x.bar);
  expect(xMin).toBe(xs[2]);

  xMin = ArrayUtils.getMinBy(xs, x => -Math.abs(x.foo - 1111));
  expect(xMin).toBe(xs[0]);
});

test('ArrayUtils.getMinIndexBy()', () => {
  const xs = [
    { foo: 42, bar: 'c' },
    { foo: 1729, bar: 'b' },
    { foo: 1234, bar: 'a' },
  ];
  let indexMin;

  indexMin = ArrayUtils.getMinIndexBy([], x => x.foo);
  expect(indexMin).toBeNull();

  indexMin = ArrayUtils.getMinIndexBy([xs[0]], x => x.foo);
  expect(indexMin).toBe(0);

  indexMin = ArrayUtils.getMinIndexBy(xs, x => x.foo);
  expect(indexMin).toBe(0);

  indexMin = ArrayUtils.getMinIndexBy(xs, x => x.bar);
  expect(indexMin).toBe(2);

  indexMin = ArrayUtils.getMinIndexBy(xs, x => -Math.abs(x.foo - 1111));
  expect(indexMin).toBe(0);
});

test('ArrayUtils.getMaxBy()', () => {
  const xs = [
    { foo: 42, bar: 'c' },
    { foo: 1729, bar: 'b' },
    { foo: 1234, bar: 'a' },
  ];
  let xMax;

  xMax = ArrayUtils.getMaxBy([], x => x.foo);
  expect(xMax).toBeNull();

  xMax = ArrayUtils.getMaxBy([xs[0]], x => x.foo);
  expect(xMax).toBe(xs[0]);

  xMax = ArrayUtils.getMaxBy(xs, x => x.foo);
  expect(xMax).toBe(xs[1]);

  xMax = ArrayUtils.getMaxBy(xs, x => x.bar);
  expect(xMax).toBe(xs[0]);

  xMax = ArrayUtils.getMaxBy(xs, x => -Math.abs(x.foo - 1111));
  expect(xMax).toBe(xs[2]);
});

test('ArrayUtils.getMaxIndexBy()', () => {
  const xs = [
    { foo: 42, bar: 'c' },
    { foo: 1729, bar: 'b' },
    { foo: 1234, bar: 'a' },
  ];
  let indexMax;

  indexMax = ArrayUtils.getMaxIndexBy([], x => x.foo);
  expect(indexMax).toBeNull();

  indexMax = ArrayUtils.getMaxIndexBy([xs[0]], x => x.foo);
  expect(indexMax).toBe(0);

  indexMax = ArrayUtils.getMaxIndexBy(xs, x => x.foo);
  expect(indexMax).toBe(1);

  indexMax = ArrayUtils.getMaxIndexBy(xs, x => x.bar);
  expect(indexMax).toBe(0);

  indexMax = ArrayUtils.getMaxIndexBy(xs, x => -Math.abs(x.foo - 1111));
  expect(indexMax).toBe(2);
});

test('ArrayUtils.sortBy()', () => {
  const xs = [
    { foo: 42, bar: 'c' },
    { foo: 1729, bar: 'b' },
    { foo: 1234, bar: 'a' },
  ];
  let xsSorted;

  xsSorted = ArrayUtils.sortBy([], x => x.foo);
  expect(xsSorted).toEqual([]);

  xsSorted = ArrayUtils.sortBy([xs[0]], x => x.foo);
  expect(xsSorted).toEqual([xs[0]]);

  xsSorted = ArrayUtils.sortBy(xs, x => x.foo);
  expect(xsSorted).toEqual([xs[0], xs[2], xs[1]]);

  xsSorted = ArrayUtils.sortBy(xs, x => x.foo, SortDirection.DESC);
  expect(xsSorted).toEqual([xs[1], xs[2], xs[0]]);

  xsSorted = ArrayUtils.sortBy(xs, x => x.bar);
  expect(xsSorted).toEqual([xs[2], xs[1], xs[0]]);

  xsSorted = ArrayUtils.sortBy(xs, x => x.bar, SortDirection.DESC);
  expect(xsSorted).toEqual([xs[0], xs[1], xs[2]]);

  xsSorted = ArrayUtils.sortBy(xs, x => -Math.abs(x.foo - 1111));
  expect(xsSorted).toEqual([xs[0], xs[1], xs[2]]);
});

test('ArrayUtils.groupBy()', () => {
  const xs = ArrayUtils.range(0, 10);
  let xsGrouped;

  xsGrouped = ArrayUtils.groupBy([], x => x % 3);
  expect(xsGrouped).toEqual([]);

  xsGrouped = ArrayUtils.groupBy([xs[0]], x => x % 3);
  expect(xsGrouped).toEqual([[xs[0]]]);

  xsGrouped = ArrayUtils.groupBy(xs, x => x % 3);
  expect(xsGrouped).toEqual([
    [0, 3, 6, 9],
    [1, 4, 7],
    [2, 5, 8],
  ]);
});
