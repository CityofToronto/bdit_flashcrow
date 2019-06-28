import TimeFormatters from '@/lib/time/TimeFormatters';

test('TimeFormatters.formatDefault()', () => {
  let t = null;
  expect(TimeFormatters.formatDefault(t)).toEqual('');

  t = new Date(1986, 6, 31, 21, 16, 0);
  expect(TimeFormatters.formatDefault(t)).toEqual('7/31/1986');

  t = new Date(2000, 0, 1, 1, 23, 45);
  expect(TimeFormatters.formatDefault(t)).toEqual('1/1/2000');
});

test('TimeFormatters.formatTimeOfDay()', () => {
  let t = null;
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('');

  t = new Date(1986, 6, 31, 21, 16, 0);
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('21:16');

  t = new Date(2000, 0, 1, 1, 23, 45);
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('01:23');
});

test('TimeFormatters.formatYearMonth()', () => {
  let t = null;
  expect(TimeFormatters.formatYearMonth(t)).toEqual('');

  t = new Date(1986, 6, 31, 21, 16, 0);
  expect(TimeFormatters.formatYearMonth(t)).toEqual('Jul 1986');

  t = new Date(2000, 0, 1, 1, 23, 45);
  expect(TimeFormatters.formatYearMonth(t)).toEqual('Jan 2000');
});
