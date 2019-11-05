import { toBeWithinTolerance } from '@/lib/test/ExpectMatchers';

test('ExpectMatchers.toBeWithinTolerance', () => {
  let result = toBeWithinTolerance(10, 10, 0.01);
  expect(result.pass).toBe(true);

  result = toBeWithinTolerance(9.995, 10, 0.01);
  expect(result.pass).toBe(true);

  result = toBeWithinTolerance(10.005, 10, 0.01);
  expect(result.pass).toBe(true);

  result = toBeWithinTolerance(9.98, 10, 0.01);
  expect(result.pass).toBe(false);

  result = toBeWithinTolerance(10.02, 10, 0.01);
  expect(result.pass).toBe(false);

  result = toBeWithinTolerance(NaN, 10, 0.01);
  expect(result.pass).toBe(false);

  result = toBeWithinTolerance(-Infinity, 10, 0.01);
  expect(result.pass).toBe(false);

  result = toBeWithinTolerance(Infinity, 10, 0.01);
  expect(result.pass).toBe(false);
});
