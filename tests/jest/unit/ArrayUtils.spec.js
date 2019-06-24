import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

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

  xsSorted = ArrayUtils.sortBy(xs, x => x.foo, Constants.SortDirection.DESC);
  expect(xsSorted).toEqual([xs[1], xs[2], xs[0]]);

  xsSorted = ArrayUtils.sortBy(xs, x => x.bar);
  expect(xsSorted).toEqual([xs[2], xs[1], xs[0]]);

  xsSorted = ArrayUtils.sortBy(xs, x => x.bar, Constants.SortDirection.DESC);
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
