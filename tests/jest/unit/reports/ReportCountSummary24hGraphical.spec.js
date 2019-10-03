import ReportCountSummary24hGraphical from '@/lib/reports/ReportCountSummary24hGraphical';

function dateWithHour(h) {
  const m = Math.floor(Math.random() * 60);
  const s = Math.floor(Math.random() * 60);
  return new Date(2000, 0, 1, h, m, s);
}

test('ReportCountSummary24hGraphical#transformData', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  let countData = [];
  let volumeByHour = reportInstance.transformData(countData);
  let expected = new Array(24).fill(0);
  expect(volumeByHour).toEqual(expected);

  countData = [
    { t: dateWithHour(11), data: { COUNT: 42 } },
  ];
  volumeByHour = reportInstance.transformData(countData);
  expected = new Array(24).fill(0);
  expected[11] = 42;
  expect(volumeByHour).toEqual(expected);

  countData = [
    { t: dateWithHour(1), data: { COUNT: 6 } },
    { t: dateWithHour(2), data: { COUNT: 17 } },
    { t: dateWithHour(2), data: { COUNT: 2 } },
    { t: dateWithHour(3), data: { COUNT: 73 } },
  ];
  volumeByHour = reportInstance.transformData(countData);
  expected = new Array(24).fill(0);
  expected[1] = 6;
  expected[2] = 19;
  expected[3] = 73;
  expect(volumeByHour).toEqual(expected);
});
