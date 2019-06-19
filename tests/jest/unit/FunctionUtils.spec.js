import FunctionUtils from '@/lib/FunctionUtils';

jest.useFakeTimers();

test('FunctionUtils.debounce()', () => {
  const WAIT_MS = 10;
  let x = 0;
  const foo = FunctionUtils.debounce(() => {
    x += 1;
  }, WAIT_MS);

  foo();
  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), WAIT_MS);
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
