/* eslint-disable camelcase */
import { zonedTimeToUtc } from 'date-fns-tz';

import { CardinalDirection, TZ_TORONTO } from '@/lib/Constants';
import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';

import countData_4_2156283 from './data/countData_4_2156283.json';
import transformedData_COUNT_SUMMARY_24H_4_2156283 from
  './data/transformedData_COUNT_SUMMARY_24H_4_2156283.json';

function fixTimeRange(timeRange) {
  let { start, end } = timeRange;
  start = new Date(start.slice(0, -1));
  end = new Date(end.slice(0, -1));
  return { start, end };
}

test('ReportCountSummary24h#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24h();

  const parsedId = {
    artery: {
      approachDir: CardinalDirection.NORTH,
      arteryCode: 2946,
      stationCode: 2946,
      street1: 'MORNINGSIDE AVE',
    },
    count: {
      date: zonedTimeToUtc('2019-03-07 00:00:00', TZ_TORONTO),
      locationDesc: 'MORNINGSIDE AVE N/B S OF LAWRENCE AVE',
      type: { name: 'SPEED' },
    },
  };

  const countData = countData_4_2156283.map(({
    id,
    countId,
    t,
    data,
  }) => ({
    id,
    countId,
    t: new Date(t.slice(0, -1)),
    data,
  }));

  const expectedData = transformedData_COUNT_SUMMARY_24H_4_2156283;
  expectedData.forEach(({ directionGroups }) => {
    directionGroups.forEach(({ counts }) => {
      counts.forEach((count) => {
        /* eslint-disable no-param-reassign */
        count.date = new Date(count.date);
        count.amPeak.timeRange = fixTimeRange(count.amPeak.timeRange);
        count.pmPeak.timeRange = fixTimeRange(count.pmPeak.timeRange);
        count.offPeak.timeRange = fixTimeRange(count.offPeak.timeRange);
      });
    });
  });

  const transformedData = reportInstance.transformData(parsedId, countData);
  expect(transformedData).toEqual(expectedData);
});
