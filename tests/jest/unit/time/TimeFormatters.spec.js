import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

test('TimeFormatters.formatCsv()', () => {
  let t = null;
  expect(TimeFormatters.formatCsv(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatCsv(t)).toEqual('1986-07-31 21:16');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatCsv(t)).toEqual('2000-01-01 01:23');
});

test('TimeFormatters.formatDefault()', () => {
  let t = null;
  expect(TimeFormatters.formatDefault(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatDefault(t)).toEqual('7/31/1986');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatDefault(t)).toEqual('1/1/2000');
});

test('TimeFormatters.formatDateTime()', () => {
  let t = null;
  expect(TimeFormatters.formatDateTime(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatDateTime(t)).toEqual('Jul 31, 1986, 9:16 PM');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatDateTime(t)).toEqual('Jan 01, 2000, 1:23 AM');
});

test('TimeFormatters.formatDayOfWeek()', () => {
  let t = null;
  expect(TimeFormatters.formatDayOfWeek(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatDayOfWeek(t)).toEqual('Thu');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatDayOfWeek(t)).toEqual('Sat');
});

test('TimeFormatters.formatDaysOfWeek()', () => {
  let daysOfWeek = [0];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('Sun');

  daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('any day');

  daysOfWeek = [1, 2, 3, 4, 5];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('weekdays');

  daysOfWeek = [0, 6];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('weekends');

  daysOfWeek = [2, 3, 4];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('Tue, Wed, Thu');
});

test('TimeFormatters.formatTimeOfDay()', () => {
  let t = null;
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('21:16');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('01:23');
});

test('TimeFormatters.formatRangeTimeOfDay()', () => {
  const start = DateTime.fromSQL('1986-07-31 21:16:00');
  const end = DateTime.fromSQL('1986-07-31 22:16:00');
  expect(TimeFormatters.formatRangeTimeOfDay({ start, end })).toEqual('21:16\u201322:16');
});

test('TimeFormatters.formatYearMonth()', () => {
  let t = null;
  expect(TimeFormatters.formatYearMonth(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatYearMonth(t)).toEqual('Jul 1986');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatYearMonth(t)).toEqual('Jan 2000');
});

test('TimeFormatters.DAYS_OF_WEEK', () => {
  expect(TimeFormatters.DAYS_OF_WEEK).toEqual([
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
});
