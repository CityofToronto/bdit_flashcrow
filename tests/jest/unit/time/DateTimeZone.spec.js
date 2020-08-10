import Random from '@/lib/Random';
import DateTimeZone from '@/lib/time/DateTimeZone';

const TIME_MIN = 0;
const TIME_MAX = 1500000000000;

test('DateTimeZone.utc', () => {
  const dt = DateTimeZone.utc();
  expect(dt.dt.zone).toEqual({ fixed: 0 });
});

test('DateTimeZone [SQL parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTimeZone.fromMillis(t);
    const dt2 = DateTimeZone.fromSQL(dt.toSQL());
    expect(dt.equals(dt2)).toBe(true);
  }
});

test('DateTime [JSON parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTimeZone.fromMillis(t);
    const dt2 = DateTimeZone.fromJSON(dt.toJSON());
    expect(dt.equals(dt2)).toBe(true);
  }
});

test('DateTime [string parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTimeZone.fromMillis(t);
    const dt2 = DateTimeZone.fromString(dt.toString());
    expect(dt.equals(dt2)).toBe(true);
  }
});
