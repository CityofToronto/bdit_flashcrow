import {
  CentrelineType,
  LocationSelectionType,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import {
  parseCollisionReportId,
  parseStudyReportId,
} from '@/lib/reports/ReportIdParser';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/StudyDAO');

test('ReportIdParser.parseCollisionReportId [invalid]', async () => {
  await expect(parseCollisionReportId('')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('/')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('abc')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('s1:AkttmBoXtmB')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('s1:AkttmBoXtmB/')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('/CORRIDOR')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseCollisionReportId('s1:AkttmBoXtmB/blargl'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('s1:/POINTS')).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(parseCollisionReportId('5/36853')).rejects.toBeInstanceOf(InvalidReportIdError);
});

test('ReportIdParser.parseCollisionReportId', async () => {
  const resolvedValue = [{ a: 42 }, { b: 'foo' }];
  CentrelineDAO.byFeatures.mockResolvedValue(resolvedValue);
  await expect(parseCollisionReportId('s1:AkttmBoXtmB/POINTS')).resolves.toEqual({
    features: [
      { centrelineId: 13462962, centrelineType: CentrelineType.INTERSECTION },
      { centrelineId: 13462260, centrelineType: CentrelineType.INTERSECTION },
    ],
    locationsSelection: {
      locations: resolvedValue,
      selectionType: LocationSelectionType.POINTS,
    },
    s1: 's1:AkttmBoXtmB',
    selectionType: LocationSelectionType.POINTS,
  });
});

test('ReportIdParser.parseStudyReportId [invalid]', async () => {
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, ''),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '/'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 'abc'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5/'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '/36583'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5/blargl'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 'foo/36583'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 's1:AkttmBoXtmB/POINTS'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
});

test('ReportIdParser.parseStudyReportId [speed-related]', async () => {
  let resolvedValue = {
    studyType: StudyType.ATR_SPEED_VOLUME,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(resolvedValue);
  await expect(
    parseStudyReportId(ReportType.SPEED_PERCENTILE, 'TMC/36583'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.SPEED_PERCENTILE, 'ATR_SPEED_VOLUME/1234'),
  ).resolves.toEqual({
    countGroupId: 1234,
    study: resolvedValue,
    studyType: StudyType.ATR_SPEED_VOLUME,
  });

  resolvedValue = {
    studyType: StudyType.ATR_VOLUME,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(resolvedValue);
  await expect(
    parseStudyReportId(ReportType.SPEED_PERCENTILE, 'ATR_SPEED_VOLUME/1234'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
});

test('ReportIdParser.parseStudyReportId [TMC-related]', async () => {
  const resolvedValue = {
    studyType: StudyType.TMC,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(resolvedValue);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 'ATR_SPEED_VOLUME/1234'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 'TMC/36583'),
  ).resolves.toEqual({
    countGroupId: 36583,
    study: resolvedValue,
    studyType: StudyType.TMC,
  });
});

test('ReportIdParser.parseStudyReportId [neither speed- nor TMC-related]', async () => {
  const resolvedValue = {
    studyType: StudyType.ATR_VOLUME,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(resolvedValue);
  await expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_24H_GRAPHICAL, 'ATR_VOLUME/5678'),
  ).resolves.toEqual({
    countGroupId: 5678,
    study: resolvedValue,
    studyType: StudyType.ATR_VOLUME,
  });
});
