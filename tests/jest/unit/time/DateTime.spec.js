import { Settings } from 'luxon';

import Random from '@/lib/Random';
import DateTime from '@/lib/time/DateTime';

const TIME_MIN = 0;
const TIME_MAX = 1500000000000;
const TIME_DST_TRANSITION = 719990241967;

test('DateTime.local', () => {
  const dt = DateTime.local();
  expect(dt.zone).toEqual({
    valid: true,
    zoneName: Settings.defaultZoneName,
  });
});

test('DateTime.fromLocaleString', () => {
  const actual = DateTime.fromLocaleString('2/18/2020');
  const expected = DateTime.fromObject({
    year: 2020,
    month: 2,
    day: 18,
  });
  expect(actual.equals(expected)).toBe(true);
});

test('DateTime.fromJSDate', () => {
  const dt = DateTime.fromJSDate(new Date());
  expect(dt.zone).toEqual({
    valid: true,
    zoneName: Settings.defaultZoneName,
  });
});

test('DateTime#weekday', () => {
  let dt = DateTime.fromObject({
    year: 2019,
    month: 11,
    day: 3,
  });
  expect(dt.weekday).toBe(0);
  for (let i = 1; i < 7; i += 1) {
    dt = dt.plus({ days: 1 });
    expect(dt.weekday).toBe(i);
  }
});

test('DateTime [SQL parsing, DST transition]', () => {
  const t = TIME_DST_TRANSITION;
  const dt = DateTime.fromMillis(t);
  const dtSql = dt.toSQL();
  const dt2 = DateTime.fromSQL(dtSql);
  expect(dt2.toSQL()).toEqual(dtSql);
});

test('DateTime [SQL parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTime.fromMillis(t);
    const dtSql = dt.toSQL();
    const dt2 = DateTime.fromSQL(dtSql);
    expect(dt2.toSQL()).toEqual(dtSql);
  }
});

test('DateTime [JSON parsing, DST transition]', () => {
  const t = TIME_DST_TRANSITION;
  const dt = DateTime.fromMillis(t);
  const dtJson = dt.toSQL();
  const dt2 = DateTime.fromSQL(dtJson);
  expect(dt2.toJSON()).toEqual(dtJson);
});

test('DateTime [JSON parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTime.fromMillis(t);
    const dtJson = dt.toSQL();
    const dt2 = DateTime.fromSQL(dtJson);
    expect(dt2.toJSON()).toEqual(dtJson);
  }
});

test('DateTime [string parsing, DST transition]', () => {
  const t = TIME_DST_TRANSITION;
  const dt = DateTime.fromMillis(t);
  const dtStr = dt.toString();
  const dt2 = DateTime.fromString(dtStr);
  expect(dt2.toString()).toEqual(dtStr);
});

test('DateTime [string parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTime.fromMillis(t);
    const dtStr = dt.toString();
    const dt2 = DateTime.fromString(dtStr);
    expect(dt2.toString()).toEqual(dtStr);
  }
});
