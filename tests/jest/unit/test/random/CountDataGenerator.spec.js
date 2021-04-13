import Random from '@/lib/Random';
import {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateHourOfDayRange,
  generateIndexRange,
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import DateTime from '@/lib/time/DateTime';

function expectCountDataValid(countData) {
  let tPrev = -Infinity;
  let dateFirst = null;
  let keysFirst = null;
  countData.forEach((d) => {
    // all data points must have timestamp `t`
    expect(d).toHaveProperty('t');
    expect(d.t).toBeInstanceOf(DateTime);

    // timestamps must be in ascending order
    const t = d.t.valueOf();
    expect(t).toBeGreaterThanOrEqual(tPrev);
    tPrev = t;

    // timestamps must have same date
    const { year, month, day } = d.t;
    const date = { year, month, day };
    if (dateFirst === null) {
      dateFirst = date;
    } else {
      expect(date).toEqual(dateFirst);
    }

    // all data points must have `data`
    expect(d).toHaveProperty('data');
    expect(d.data).toBeInstanceOf(Object);

    // all `data` values must have same keys
    const keys = Object.keys(d.data);
    if (keysFirst === null) {
      keysFirst = keys;
    } else {
      expect(keys).toEqual(keysFirst);
    }
  });
}

test('CountDataGenerator.generateAtrSpeedVolume [fuzz test]', () => {
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrSpeedVolume();

    // Since these are large, we only test a subrange.
    const n = countData.length;
    const k = 50;
    const lo = Random.range(0, n - k);
    const hi = lo + k;
    expectCountDataValid(countData.slice(lo, hi));
  }
});

test('CountDataGenerator.generateAtrVolume [fuzz test]', () => {
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrVolume();
    expectCountDataValid(countData);
  }
});

test('CountDataGenerator.generateHourOfDayRange [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const { start, end } = generateHourOfDayRange();
    expect(start).toBeGreaterThanOrEqual(0);
    expect(start).toBeLessThanOrEqual(24);
    expect(end).toBeGreaterThanOrEqual(0);
    expect(end).toBeLessThanOrEqual(24);
    expect(start).toBeLessThanOrEqual(end);
  }
});

test('CountDataGenerator.generateIndexRange [fuzz test]', () => {
  const countData = generateWithMissing(generateTmc());
  const n = countData.length;
  for (let i = 0; i < 10; i++) {
    const { lo, hi } = generateIndexRange(countData);
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(lo).toBeLessThanOrEqual(n);
    expect(hi).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(n);
    expect(lo).toBeLessThanOrEqual(hi);
  }
});

test('CountDataGenerator.generateTmc [fuzz test]', () => {
  for (let i = 0; i < 5; i++) {
    const countData = generateTmc();
    expectCountDataValid(countData);
  }
});

test('CountDataGenerator.generateTmc14Hour [fuzz test]', () => {
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc14Hour();
    expectCountDataValid(countData);
  }
});

test('CountDataGenerator.generateWithMissing [empty dataset]', () => {
  expect(generateWithMissing([])).toEqual([]);
});

test('CountDataGenerator.generateWithMissing', () => {
  const countData = generateTmc();
  const countDataWithMissing = generateWithMissing(countData);
  expect(countDataWithMissing.length).toBeLessThan(countData.length);
  expectCountDataValid(countDataWithMissing);
});
