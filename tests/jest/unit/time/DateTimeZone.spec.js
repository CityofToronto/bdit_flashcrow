import Random from '@/lib/Random';
import DateTimeZone from '@/lib/time/DateTimeZone';

const TIME_MIN = 0;
const TIME_MAX = 1500000000000;

test('DateTimeZone.utc', () => {
  const dtz = DateTimeZone.utc();
  expect(dtz.dt.zone).toEqual({ fixed: 0 });
});

test('DateTimeZone [SQL parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dtz = DateTimeZone.fromMillis(t);
    const dtz2 = DateTimeZone.fromSQL(dtz.toSQL());
    expect(dtz.equals(dtz2)).toBe(true);
  }
});

test('DateTimeZone [JSON parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dtz = DateTimeZone.fromMillis(t);
    const dtz2 = DateTimeZone.fromJSON(dtz.toJSON());
    expect(dtz.equals(dtz2)).toBe(true);
  }
});

test('DateTimeZone [string parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dtz = DateTimeZone.fromMillis(t);
    const dtz2 = DateTimeZone.fromString(dtz.toString());
    expect(dtz.equals(dtz2)).toBe(true);
  }
});
