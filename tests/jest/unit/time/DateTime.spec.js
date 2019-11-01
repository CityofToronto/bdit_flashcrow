import Random from '@/lib/Random';
import DateTime from '@/lib/time/DateTime';

const TIME_MIN = 0;
const TIME_MAX = 1500000000000;

test('DateTime [SQL parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTime.fromMillis(t);
    const dt2 = DateTime.fromSQL(dt.toSQL());
    expect(dt.equals(dt2)).toBe(true);
  }
});

test('DateTime [JSON parsing]', () => {
  for (let i = 0; i < 100; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTime.fromMillis(t);
    const dt2 = DateTime.fromSQL(dt.toSQL());
    expect(dt.equals(dt2)).toBe(true);
  }
});
