import {
  indexRangeHourOfDay,
  indexRangesConsecutiveHours,
} from '@/lib/reports/time/ReportTimeUtils';
import {
  generateRandomCountData,
  generateHourOfDayRange,
} from '@/lib/test/random/CountDataGenerator';

test('ReportTimeUtils.indexRangeHourOfDay [empty dataset]', () => {
  const countData = [];
  const indexRange = indexRangeHourOfDay(countData, 9, 17);
  expect(indexRange).toEqual({ lo: 0, hi: 0 });
});

test('ReportTimeUtils.indexRangeHourOfDay [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = generateRandomCountData();
    const { start, end } = generateHourOfDayRange();
    const { lo, hi } = indexRangeHourOfDay(countData, start, end);
    countData.forEach(({ t }, j) => {
      expect(t.hour >= start && t.hour < end).toEqual(j >= lo && j < hi);
    });
  }
});

test('ReportTimeUtils.indexRangesConsecutiveHours [empty dataset]', () => {
  const countData = [];
  const indexRanges = indexRangesConsecutiveHours(countData);
  expect(indexRanges).toEqual([]);
});
