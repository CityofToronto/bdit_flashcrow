import ArrayStats from '@/lib/math/ArrayStats';
import {
  indexRangeHourOfDay,
  indexRangeMax,
  indexRangePeakTime,
  indexRangeSum,
  indexRangesConsecutiveHours,
  sumByTime,
} from '@/lib/reports/time/ReportTimeUtils';
import { toBeValidCountData, toBeValidIndexRangeFor } from '@/lib/test/ExpectMatchers';
import {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateRandomCountData,
  generateTimeOfDayRange,
  generateIndexRange,
  generateTmc,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';

expect.extend({
  toBeValidCountData,
  toBeValidIndexRangeFor,
});

test('ReportTimeUtils.indexRangeHourOfDay [empty dataset]', () => {
  const countData = [];
  const timeWindow = generateTimeOfDayRange();
  const indexRange = indexRangeHourOfDay(countData, timeWindow);
  expect(indexRange).toEqual({ lo: 0, hi: 0 });
});

test('ReportTimeUtils.indexRangeHourOfDay [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateRandomCountData({
      COUNT: [1000, 10000],
    });
    const timeWindow = generateTimeOfDayRange();

    const { lo, hi } = indexRangeHourOfDay(countData, timeWindow);
    countData.forEach(({ t }, j) => {
      expect(t >= timeWindow.startTime && t < timeWindow.endTime).toEqual(j >= lo && j < hi);
    });
  }
});

test('ReportTimeUtils.indexRangeMax [empty dataset]', () => {
  const max = indexRangeMax([], { lo: 0, hi: 0 }, ({ COUNT }) => COUNT);
  expect(max).toEqual(0);
});

test('ReportTimeUtils.indexRangeMax [empty range]', () => {
  const countData = generateAtrVolume();
  const max = indexRangeMax(countData, { lo: 0, hi: 0 }, ({ COUNT }) => COUNT);
  expect(max).toEqual(0);
});

test('ReportTimeUtils.indexRangeMax [fuzz test]', () => {
  const countData = generateAtrVolume();
  for (let i = 0; i < 10; i++) {
    const indexRange = generateIndexRange(countData);
    const max = indexRangeMax(countData, indexRange, ({ COUNT }) => COUNT);

    // all values in range should be at most `max`
    const { lo, hi } = indexRange;
    for (let j = lo; j < hi; j++) {
      const { data } = countData[j];
      expect(data.COUNT).toBeLessThanOrEqual(max);
    }
  }
});

test('ReportTimeUtils.indexRangePeakTime [empty dataset]', () => {
  const indexRangePeak = indexRangePeakTime(
    [],
    { lo: 0, hi: 0 },
    { hours: 1 },
    ({ COUNT }) => COUNT,
  );
  expect(indexRangePeak).toBeValidIndexRangeFor([]);
});

test('ReportTimeUtils.indexRangePeakTime [empty range]', () => {
  const countData = generateAtrVolume();
  const indexRangePeak = indexRangePeakTime(
    countData,
    { lo: 0, hi: 0 },
    { hours: 1 },
    ({ COUNT }) => COUNT,
  );
  expect(indexRangePeak).toBeValidIndexRangeFor([]);
});

test('ReportTimeUtils.indexRangePeakTime [fuzz test]', () => {
  const countData = generateAtrVolume();
  for (let i = 0; i < 10; i++) {
    const indexRange = generateIndexRange(countData);
    const indexRangePeak = indexRangePeakTime(
      countData,
      indexRange,
      { hours: 1 },
      ({ COUNT }) => COUNT,
    );

    expect(indexRangePeak).toBeValidIndexRangeFor(countData);

    // peak index range should be sub-range of `indexRange`
    const { lo, hi } = indexRange;
    const { lo: loPeak, hi: hiPeak } = indexRangePeak;
    expect(loPeak).toBeGreaterThanOrEqual(lo);
    expect(hiPeak).toBeLessThanOrEqual(hi);

    if (lo !== hi) {
      // peak index range should span less than `timeSpan` (i.e. 1 hour)
      const start = countData[loPeak].t;
      const end = countData[hiPeak - 1].t;
      const { hours } = end.diff(start, 'hours').toObject();
      expect(hours).toBeLessThan(1);
    }
  }
});

test('ReportTimeUtils.indexRangeSum [empty dataset]', () => {
  const max = indexRangeSum([], { lo: 0, hi: 0 }, ({ COUNT }) => COUNT);
  expect(max).toEqual(0);
});

test('ReportTimeUtils.indexRangeSum [empty range]', () => {
  const countData = generateAtrVolume();
  const max = indexRangeSum(countData, { lo: 0, hi: 0 }, ({ COUNT }) => COUNT);
  expect(max).toEqual(0);
});

test('ReportTimeUtils.indexRangeSum [fuzz test]', () => {
  const countData = generateAtrVolume();
  const total = ArrayStats.sum(countData.map(({ data }) => data.COUNT));

  for (let i = 0; i < 10; i++) {
    const indexRange = generateIndexRange(countData);
    const sum = indexRangeSum(countData, indexRange, ({ COUNT }) => COUNT);
    expect(sum).toBeGreaterThanOrEqual(0);
    expect(sum).toBeLessThanOrEqual(total);
  }
});

test('ReportTimeUtils.indexRangesConsecutiveHours [empty dataset]', () => {
  const countData = [];
  const indexRanges = indexRangesConsecutiveHours(countData);
  expect(indexRanges).toEqual([]);
});

test('ReportTimeUtils.indexRangesConsecutiveHours [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateWithMissing(generateTmc());
    const n = countData.length;

    const indexRanges = indexRangesConsecutiveHours(countData);
    const k = indexRanges.length;
    expect(k).toBeGreaterThan(0);
    expect(indexRanges[0].lo).toBe(0);
    expect(indexRanges[k - 1].hi).toBe(n);

    let hiLast = 0;
    indexRanges.forEach((indexRange) => {
      expect(indexRange).toBeValidIndexRangeFor(countData);

      // index ranges are consecutive
      const { lo, hi } = indexRange;
      expect(lo).toEqual(hiLast);
      hiLast = hi;

      // index ranges span less than 1 hour
      const start = countData[lo].t;
      const end = countData[hi - 1].t;
      const { hours } = end.diff(start, 'hours').toObject();
      expect(hours).toBeLessThan(1);
    });
  }
});

test('ReportTimeUtils.sumByTime [empty dataset]', () => {
  const countData = sumByTime([]);
  expect(countData).toBeValidCountData();
});

test('ReportTimeUtils.sumByTime [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateAtrSpeedVolume();
    expect(sumByTime(countData)).toBeValidCountData();
  }
});
