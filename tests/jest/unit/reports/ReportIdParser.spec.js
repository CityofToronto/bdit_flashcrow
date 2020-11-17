import {
  CentrelineType,
  LocationSelectionType,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import { parseCollisionReportId, parseStudyReportId } from '@/lib/reports/ReportIdParser';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/StudyDAO');

test('ReportIdParser.parseCollisionReportId [invalid]', async () => {
  expect(parseCollisionReportId('')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('/')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('abc')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('s1:AkttmBoXtmB')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('s1:AkttmBoXtmB/')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('/CORRIDOR')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseCollisionReportId('s1:AkttmBoXtmB/blargl'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('s1:/POINTS')).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(parseCollisionReportId('5/36853')).rejects.toBeInstanceOf(InvalidReportIdError);
});

test('ReportIdParser.parseCollisionReportId', async () => {
  const resolvedValue = [{ a: 42 }, { b: 'foo' }];
  CentrelineDAO.byFeatures.mockResolvedValue(resolvedValue);
  expect(parseCollisionReportId('s1:AkttmBoXtmB/POINTS')).resolves.toEqual({
    features: [
      { centrelineId: 13462962, centrelineType: CentrelineType.SEGMENT },
      { centrelineId: 13462260, centrelineType: CentrelineType.SEGMENT },
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
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, ''),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '/'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 'abc'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5/'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '/36583'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5/blargl'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 'foo/36583'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseStudyReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, 's1:AkttmBoXtmB/POINTS'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
});

test('ReportIdParser.parseStudyReportId [speed-related]', async () => {
  let resolvedValue = {
    type: { studyType: StudyType.ATR_SPEED_VOLUME },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(resolvedValue);
  expect(
    parseCollisionReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5/36583'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseCollisionReportId(ReportType.SPEED_PERCENTILE, '4/1234'),
  ).resolves.toEqual({
    categoryId: 4,
    countGroupId: 1234,
    study: resolvedValue,
  });

  resolvedValue = {
    type: { studyType: StudyType.ATR_VOLUME },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(resolvedValue);
  expect(
    parseCollisionReportId(ReportType.SPEED_PERCENTILE, '4/1234'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
});

test('ReportIdParser.parseStudyReportId [TMC-related]', async () => {
  const resolvedValue = {
    type: { studyType: StudyType.TMC },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(resolvedValue);
  expect(
    parseCollisionReportId(ReportType.SPEED_PERCENTILE, '4/1234'),
  ).rejects.toBeInstanceOf(InvalidReportIdError);
  expect(
    parseCollisionReportId(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT, '5/36583'),
  ).resolves.toEqual({
    categoryId: 5,
    countGroupId: 36853,
    study: resolvedValue,
  });
});

test('ReportIdParser.parseStudyReportId [neither speed- nor TMC-related]', async () => {
  const resolvedValue = {
    type: { studyType: StudyType.ATR_VOLUME },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(resolvedValue);
  expect(
    parseCollisionReportId(ReportType.COUNT_SUMMARY_24H_GRAPHICAL, '1/5678'),
  ).resolves.toEqual({
    categoryId: 1,
    countGroupId: 5678,
    study: resolvedValue,
  });
});
