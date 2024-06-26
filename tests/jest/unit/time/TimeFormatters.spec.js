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

test('TimeFormatters.formatCsvDate()', () => {
  let t = null;
  expect(TimeFormatters.formatCsvDate(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatCsvDate(t)).toEqual('1986-07-31');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatCsvDate(t)).toEqual('2000-01-01');
});

test('TimeFormatters.formatDefault()', () => {
  let t = null;
  expect(TimeFormatters.formatDefault(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatDefault(t)).toEqual('1986-07-31');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatDefault(t)).toEqual('2000-01-01');
});

test('TimeFormatters.formatDateTime()', () => {
  let t = null;
  expect(TimeFormatters.formatDateTime(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatDateTime(t)).toEqual('1986-07-31 21:16');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatDateTime(t)).toEqual('2000-01-01 01:23');
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
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('Any Day');

  daysOfWeek = [1, 2, 3, 4, 5];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('Weekdays');

  daysOfWeek = [0, 6];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('Weekends');

  daysOfWeek = [2, 3, 4];
  expect(TimeFormatters.formatDaysOfWeek(daysOfWeek)).toEqual('Tue, Wed, Thu');
});

test('TimeFormatters.formatTimeOfDay()', () => {
  let t = null;
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('');

  t = DateTime.fromSQL('1986-07-31 21:16:00');
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('21:16');

  t = DateTime.fromSQL('2000-01-01 00:00:00');
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('00:00');

  t = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('01:23');
});

test('TimeFormatters.formatRangeDate()', () => {
  expect(TimeFormatters.formatRangeDate(null)).toBeNull();

  let start = DateTime.fromSQL('1986-07-31 21:16:00');
  let end = DateTime.fromSQL('1986-07-31 22:16:00');
  expect(TimeFormatters.formatRangeDate({ start, end })).toEqual('1986-07-31');

  start = DateTime.fromSQL('1986-07-31 21:16:00');
  end = null;
  expect(TimeFormatters.formatRangeDate({ start, end })).toEqual('Since 1986-07-31');

  start = null;
  end = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatRangeDate({ start, end })).toEqual('Until 2000-01-01');

  start = DateTime.fromSQL('1986-07-31 00:00:00');
  end = DateTime.fromSQL('2000-01-01 01:23:45');
  expect(TimeFormatters.formatRangeDate({ start, end })).toEqual('1986-07-31 to 2000-01-01');
});

test('TimeFormatters.formatRangeTimeOfDay()', () => {
  expect(TimeFormatters.formatRangeTimeOfDay(null)).toBeNull();

  let start = DateTime.fromSQL('1986-07-31 21:16:00');
  let end = DateTime.fromSQL('1986-07-31 22:16:00');
  expect(TimeFormatters.formatRangeTimeOfDay({ start, end })).toEqual('21:16\u201322:16');

  start = DateTime.fromSQL('1986-07-31 21:16:00');
  end = null;
  expect(TimeFormatters.formatRangeTimeOfDay({ start, end })).toEqual('After 21:16');

  start = null;
  end = DateTime.fromSQL('1986-07-31 01:23:45');
  expect(TimeFormatters.formatRangeTimeOfDay({ start, end })).toEqual('Before 01:23');

  start = DateTime.fromSQL('1986-07-31 00:00:00');
  end = DateTime.fromSQL('1986-07-31 01:23:45');
  expect(TimeFormatters.formatRangeTimeOfDay({ start, end })).toEqual('00:00\u201301:23');
});

test('TimeFormatters.convertToLuxonDatetime()', () => {
  const t = '2024-04-09 00:00:00.000';
  expect(TimeFormatters.convertToLuxonDatetime(t))
    .toEqual(DateTime.local(2024, 4, 9, 0, 0, 0, 0));
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
