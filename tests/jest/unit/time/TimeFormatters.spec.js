import { zonedTimeToUtc } from 'date-fns-tz';

import { TZ_TORONTO } from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

test('TimeFormatters.formatDefault()', () => {
  let t = null;
  expect(TimeFormatters.formatDefault(t)).toEqual('');

  t = zonedTimeToUtc('1986-07-31 21:16:00', TZ_TORONTO);
  expect(TimeFormatters.formatDefault(t)).toEqual('7/31/1986');

  t = zonedTimeToUtc('2000-01-01 01:23:45', TZ_TORONTO);
  expect(TimeFormatters.formatDefault(t)).toEqual('1/1/2000');
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
