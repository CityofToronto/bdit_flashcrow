import { zonedTimeToUtc } from 'date-fns-tz';

import { TZ_TORONTO } from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

test('TimeFormatters.formatCsv()', () => {
  let t = null;
  expect(TimeFormatters.formatCsv(t)).toEqual('');

  t = new Date('1986-07-31 21:16:00');
  expect(TimeFormatters.formatCsv(t)).toEqual('1986-07-31 21:16');

  t = new Date('2000-01-01 01:23:45');
  expect(TimeFormatters.formatCsv(t)).toEqual('2000-01-01 01:23');
});

test('TimeFormatters.formatDefault()', () => {
  let t = null;
  expect(TimeFormatters.formatDefault(t)).toEqual('');

  t = zonedTimeToUtc('1986-07-31 21:16:00', TZ_TORONTO);
  expect(TimeFormatters.formatDefault(t)).toEqual('7/31/1986');

  t = zonedTimeToUtc('2000-01-01 01:23:45', TZ_TORONTO);
  expect(TimeFormatters.formatDefault(t)).toEqual('1/1/2000');
});

test('TimeFormatters.formatDateTime()', () => {
  let t = null;
  expect(TimeFormatters.formatDateTime(t)).toEqual('');

  t = zonedTimeToUtc('1986-07-31 21:16:00', TZ_TORONTO);
  expect(TimeFormatters.formatDateTime(t)).toEqual('Jul 31, 1986, 9:16 PM');

  t = zonedTimeToUtc('2000-01-01 01:23:45', TZ_TORONTO);
  expect(TimeFormatters.formatDateTime(t)).toEqual('Jan 01, 2000, 1:23 AM');
});

test('TimeFormatters.formatDayOfWeek()', () => {
  let t = null;
  expect(TimeFormatters.formatDayOfWeek(t)).toEqual('');

  t = zonedTimeToUtc('1986-07-31 21:16:00', TZ_TORONTO);
  expect(TimeFormatters.formatDayOfWeek(t)).toEqual('Thu');

  t = zonedTimeToUtc('2000-01-01 01:23:45', TZ_TORONTO);
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

  t = zonedTimeToUtc('1986-07-31 21:16:00', TZ_TORONTO);
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('21:16');

  t = zonedTimeToUtc('2000-01-01 01:23:45', TZ_TORONTO);
  expect(TimeFormatters.formatTimeOfDay(t)).toEqual('01:23');
});

test('TimeFormatters.formatYearMonth()', () => {
  let t = null;
  expect(TimeFormatters.formatYearMonth(t)).toEqual('');

  t = zonedTimeToUtc('1986-07-31 21:16:00', TZ_TORONTO);
  expect(TimeFormatters.formatYearMonth(t)).toEqual('Jul 1986');

  t = zonedTimeToUtc('2000-01-01 01:23:45', TZ_TORONTO);
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
