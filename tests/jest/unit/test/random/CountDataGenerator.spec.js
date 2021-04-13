import Random from '@/lib/Random';
import { toBeValidCountData, toBeValidIndexRangeFor } from '@/lib/test/ExpectMatchers';
import {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateHourOfDayRange,
  generateIndexRange,
  generateRandomCountData,
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';

expect.extend({
  toBeValidCountData,
  toBeValidIndexRangeFor,
});

test('CountDataGenerator.generateAtrSpeedVolume [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateAtrSpeedVolume();

    // Since these are large, we only test a subrange.
    const n = countData.length;
    const k = 50;
    const lo = Random.range(0, n - k);
    const hi = lo + k;
    expect(countData.slice(lo, hi)).toBeValidCountData();
  }
});

test('CountDataGenerator.generateAtrVolume [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateAtrVolume();
    expect(countData).toBeValidCountData();
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
  for (let i = 0; i < 10; i++) {
    const indexRange = generateIndexRange(countData);
    expect(indexRange).toBeValidIndexRangeFor(countData);
  }
});

test('CountDataGenerator.generateRandomCountData [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateRandomCountData({
      FOO: [42, 1729],
      BAR: [1000, 10000],
    });
    expect(countData).toBeValidCountData();
  }
});

test('CountDataGenerator.generateTmc [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateTmc();
    expect(countData).toBeValidCountData();
  }
});

test('CountDataGenerator.generateTmc14Hour [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateTmc14Hour();
    expect(countData).toBeValidCountData();
  }
});

test('CountDataGenerator.generateWithMissing [empty dataset]', () => {
  expect(generateWithMissing([])).toEqual([]);
});

test('CountDataGenerator.generateWithMissing', () => {
  const countData = generateTmc();
  const countDataWithMissing = generateWithMissing(countData);
  expect(countDataWithMissing.length).toBeLessThan(countData.length);
  expect(countData).toBeValidCountData();
});
