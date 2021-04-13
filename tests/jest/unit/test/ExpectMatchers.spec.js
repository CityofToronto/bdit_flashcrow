import {
  toBeValidCountData,
  toBeValidIndexRangeFor,
  toBeWithinTolerance,
} from '@/lib/test/ExpectMatchers';
import DateTime from '@/lib/time/DateTime';

test('ExpectMatchers.toBeValidCountData', () => {
  // empty count data is valid
  let countData = [];
  let result = toBeValidCountData(countData);
  expect(result.pass).toBe(true);

  // all data points must have timestamp `t`
  countData = [
    {},
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);
  countData = [
    { data: { COUNT: 42 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);
  countData = [
    { t: 'invalid time', data: { COUNT: 42 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);

  // timestamps must be in ascending order
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:45'), data: { COUNT: 42 } },
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 17 } },
    { t: DateTime.fromSQL('2000-01-01 08:00'), data: { COUNT: 73 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);

  // timestamps must have same date
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 42 } },
    { t: DateTime.fromSQL('2000-01-02 07:45'), data: { COUNT: 17 } },
    { t: DateTime.fromSQL('2000-01-03 08:00'), data: { COUNT: 73 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);

  // all data points must have `data`
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30') },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: false },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);

  // all `data` values must have same keys
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 42 } },
    { t: DateTime.fromSQL('2000-01-01 07:45'), data: { COUNT: 17, BAR: 1 } },
    { t: DateTime.fromSQL('2000-01-01 08:00'), data: { COUNT: 73 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 42, FOO: 2 } },
    { t: DateTime.fromSQL('2000-01-01 07:45'), data: { COUNT: 17, BAR: 1 } },
    { t: DateTime.fromSQL('2000-01-01 08:00'), data: { COUNT: 73, FROB: 3 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(false);

  // valid count data
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 42 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(true);
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 42 } },
    { t: DateTime.fromSQL('2000-01-01 07:45'), data: { COUNT: 17 } },
    { t: DateTime.fromSQL('2000-01-01 08:00'), data: { COUNT: 73 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(true);
  countData = [
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 42, SPEED_CLASS: 1 } },
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 17, SPEED_CLASS: 2 } },
    { t: DateTime.fromSQL('2000-01-01 07:30'), data: { COUNT: 73, SPEED_CLASS: 3 } },
  ];
  result = toBeValidCountData(countData);
  expect(result.pass).toBe(true);
});

test('ExpectMatchers.toBeValidIndexRangeFor', () => {
  const countData = Array(5).fill(0);

  let result = toBeValidIndexRangeFor({ lo: 0, hi: 0 }, countData);
  expect(result.pass).toBe(true);

  result = toBeValidIndexRangeFor({ lo: 5, hi: 5 }, countData);
  expect(result.pass).toBe(true);

  result = toBeValidIndexRangeFor({ lo: 0, hi: 5 }, countData);
  expect(result.pass).toBe(true);

  result = toBeValidIndexRangeFor({ lo: 2, hi: 4 }, countData);
  expect(result.pass).toBe(true);

  result = toBeValidIndexRangeFor({ lo: 4, hi: 2 }, countData);
  expect(result.pass).toBe(false);

  result = toBeValidIndexRangeFor({ lo: -1, hi: 1 }, countData);
  expect(result.pass).toBe(false);

  result = toBeValidIndexRangeFor({ lo: 4, hi: 6 }, countData);
  expect(result.pass).toBe(false);

  result = toBeValidIndexRangeFor({ lo: -1, hi: 6 }, countData);
  expect(result.pass).toBe(false);
});

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
