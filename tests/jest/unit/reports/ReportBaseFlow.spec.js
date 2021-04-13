/* eslint-disable camelcase */
import { StudyType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';
import { sumByTime } from '@/lib/reports/time/ReportTimeUtils';
import DateTime from '@/lib/time/DateTime';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

jest.mock('@/lib/db/StudyDAO');

test('ReportBaseFlow#parseId', async () => {
  const reportInstance = new ReportSpeedPercentile();
  let rawId;

  rawId = '';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  rawId = '42';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  rawId = 'foo/bar';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  rawId = '6/bar';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(null);
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  let study = {
    type: { studyType: StudyType.TMC },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(study);
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  study = {
    type: { studyType: StudyType.ATR_SPEED_VOLUME },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(study);
  rawId = '4/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(study);
});

test('ReportCountSummary24h.timeRange', () => {
  const { studyData } = setup_4_2156283();
  const countData = studyData.get(17);
  const totaledData = sumByTime(countData);

  expect(ReportBaseFlow.timeRange(totaledData, { lo: 0, hi: 4 })).toEqual({
    start: DateTime.fromSQL('2019-03-07 00:00'),
    end: DateTime.fromSQL('2019-03-07 01:00'),
  });

  expect(ReportBaseFlow.timeRange(totaledData, { lo: 13, hi: 22 })).toEqual({
    start: DateTime.fromSQL('2019-03-07 03:15'),
    end: DateTime.fromSQL('2019-03-07 05:30'),
  });
});
