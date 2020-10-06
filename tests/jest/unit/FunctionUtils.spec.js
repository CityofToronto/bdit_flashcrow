import { asyncDelay, debounce, identity } from '@/lib/FunctionUtils';

jest.useFakeTimers();

test('FunctionUtils.asyncDelay', async () => {
  let resolved = false;
  async function asyncDelayHelper(wait) {
    await asyncDelay(wait);
    resolved = true;
  }

  const WAIT_MS = 10;
  asyncDelayHelper(WAIT_MS);
  expect(resolved).toBe(false);

  jest.advanceTimersByTime(WAIT_MS - 1);
  /*
   * Allow event loop to fire so that our `asyncDelayHelper` promise can be
   * resolved if it's ready.  (It's not ready yet, but we use the same trick
   * below once it is.)
   */
  await Promise.resolve();
  expect(resolved).toBe(false);

  jest.advanceTimersByTime(1);
  await Promise.resolve();
  expect(resolved).toBe(true);
});

test('FunctionUtils.debounce', () => {
  const WAIT_MS = 10;
  let x = 0;
  const foo = debounce(() => {
    x += 1;
  }, WAIT_MS);

  foo();
  expect(x).toEqual(0);

  foo();
  expect(x).toEqual(0);

  jest.advanceTimersByTime(WAIT_MS - 1);
  expect(x).toEqual(0);
  for (let i = 0; i < 10; i++) {
    foo();
  }
  expect(x).toEqual(0);

  jest.advanceTimersByTime(WAIT_MS);
  expect(x).toEqual(1);
});

test('FunctionUtils.identity', () => {
  let x = 42;
  expect(identity(x)).toBe(x);

  x = { a: 'foo', b: true };
  expect(identity(x)).toBe(x);
});
