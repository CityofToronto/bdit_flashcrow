/* eslint-disable camelcase */
import { StudyType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';
import { sumByTime } from '@/lib/reports/time/ReportTimeUtils';
import DateTime from '@/lib/time/DateTime';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

jest.mock('@/lib/db/StudyDAO');

test('ReportBaseFlow#parseId [invalid]', async () => {
  const reportInstance = new ReportSpeedPercentile();
  let rawId;

  // expect non-empty
  rawId = '';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  // expect `${studyType}/${countGroupId}`
  rawId = '42';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  // expect valid studyType
  rawId = 'foo/bar';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  // expect numeric countGroupId
  rawId = 'ATR_VOLUME/bar';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  // expect studyType, not CATEGORY_ID
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);
});

test('ReportBaseFlow#parseId [study not found]', async () => {
  const reportInstance = new ReportSpeedPercentile();

  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(null);
  const rawId = 'ATR_SPEED_VOLUME/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);
});

test('ReportBaseFlow#parseId [study type mismatch]', async () => {
  const reportInstance = new ReportSpeedPercentile();

  const study = {
    studyType: StudyType.TMC,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  const rawId = 'ATR_SPEED_VOLUME/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);
});

test('ReportBaseFlow#parseId [speed-related]', async () => {
  const reportInstance = new ReportSpeedPercentile();
  let rawId;

  // speed percentile report requires speed / volume data!
  let study = {
    studyType: StudyType.TMC,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'TMC/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  study = {
    studyType: StudyType.ATR_SPEED_VOLUME,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'ATR_SPEED_VOLUME/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(study);
});

test('ReportBaseFlow#parseId [TMC-related]', async () => {
  const reportInstance = new ReportCountSummaryTurningMovement();
  let rawId;

  // TMC summary report requires TMC data!
  let study = {
    studyType: StudyType.RESCU,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'RESCU/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  study = {
    studyType: StudyType.TMC,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'TMC/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(study);
});

test('ReportBaseFlow#parseId [other]', async () => {
  const reportInstance = new ReportCountSummary24h();
  let rawId;

  // non-TMC report cannot have TMC data!
  let study = {
    studyType: StudyType.TMC,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'TMC/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  // non-TMC report can have speed / volume data
  study = {
    studyType: StudyType.ATR_SPEED_VOLUME,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'ATR_SPEED_VOLUME/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(study);

  // non-TMC report can have volume data
  study = {
    studyType: StudyType.ATR_VOLUME,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);
  rawId = 'ATR_VOLUME/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(study);
});

test('ReportCountSummary24h.timeRange', () => {
  const { studyData } = setup_4_2156283();
  const countData = studyData.get(2156283);
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
