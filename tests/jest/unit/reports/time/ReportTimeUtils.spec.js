import Random from '@/lib/Random';
import { indexRangeHourOfDay } from '@/lib/reports/time/ReportTimeUtils';
import DateTime from '@/lib/time/DateTime';

test('ReportTimeUtils.indexRangeHourOfDay [empty test]', () => {
  const countData = [];
  expect(indexRangeHourOfDay(countData, 7, 10)).toEqual({ lo: 0, hi: 0 });
});

function getRandomCountData() {
  const countData = [];
  const k = Random.range(10, 20);
  for (let i = 0; i < k; i++) {
    const t = DateTime.fromObject({
      year: 2012,
      month: 4,
      day: 1,
      hour: Random.range(0, 24),
      minute: Random.range(0, 60),
    });
    countData.push({ t });
  }
  countData.sort(({ t: ta }, { t: tb }) => ta.valueOf() - tb.valueOf());
  return countData;
}

function getRandomHourOfDayRange() {
  const a = Random.range(0, 24);
  const b = Random.range(0, 24);
  if (a < b) {
    return { start: a, end: b };
  }
  return { start: b, end: a };
}

test('ReportTimeUtils.indexRangeHourOfDay [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const countData = getRandomCountData();
    const { start, end } = getRandomHourOfDayRange();
    const { lo, hi } = indexRangeHourOfDay(countData, start, end);
    countData.forEach(({ t }, j) => {
      expect(t.hour >= start && t.hour < end).toEqual(j >= lo && j < hi);
    });
  }
});
