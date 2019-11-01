/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection } from '@/lib/Constants';
import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

const countData_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283.json'),
);

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
      date: DateTime.fromSQL('2019-03-07 00:00:00'),
      locationDesc: 'MORNINGSIDE AVE N/B S OF LAWRENCE AVE',
      type: { name: 'SPEED' },
    },
  };

  const transformedData = reportInstance.transformData(parsedId, countData_4_2156283);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_4_2156283);
});
