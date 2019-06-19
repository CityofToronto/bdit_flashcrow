import Random from '@/lib/Random';

test('Random.uniform()', () => {
  const N = 100;
  for (let i = 0; i < N; i++) {
    const lo = -Math.random();
    const hi = Math.random();
    const x = Random.uniform(lo, hi);
    expect(x).toBeGreaterThanOrEqual(lo);
    expect(x).toBeLessThan(hi);
  }

  expect(() => {
    Random.uniform(42, 42);
  }).toThrow();
  expect(() => {
    Random.uniform(43, 42);
  }).toThrow();
});

test('Random.range()', () => {
  const N = 100;
  for (let i = 0; i < N; i++) {
    const lo = Math.floor(-Math.random() * 10 - 1);
    const hi = Math.floor(Math.random() * 10);
    const x = Random.range(lo, hi);
    expect(x).toBeGreaterThanOrEqual(lo);
    expect(x).toBeLessThan(hi);
    expect(Number.isInteger(x)).toBeTruthy();
  }

  expect(() => {
    Random.range(42, 42);
  }).toThrow();
  expect(() => {
    Random.range(43, 42);
  }).toThrow();
});


test('Random.choice()', () => {
  const N = 100;
  const xs = ['a'];
  for (let i = 0; i < N; i++) {
    const x = Random.choice(xs);
    expect(x).toEqual('a');
  }
  xs.push('b', 'c');
  for (let i = 0; i < N; i++) {
    const x = Random.choice(xs);
    expect(xs).toContain(x);
  }
  expect(Random.choice([])).toBeNull();
});

test('Random.sample()', () => {
  expect(Random.sample([], 0)).toEqual([]);

  const xs = ['a'];
  expect(Random.sample(xs, 0)).toEqual([]);
  expect(Random.sample(xs, 1)).toEqual(xs);
  expect(Random.sample(xs, 2)).toEqual(xs);

  xs.push('b', 'c');
  const N = 100;
  for (let i = 0; i < N; i++) {
    const ys = Random.sample(xs, 2);
    expect(ys).toHaveLength(2);
    expect(xs).toEqual(expect.arrayContaining(ys));
  }
});
