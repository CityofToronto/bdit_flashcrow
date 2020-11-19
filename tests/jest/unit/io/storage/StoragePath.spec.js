import {
  CardinalDirection,
  CentrelineType,
  LocationSelectionType,
  ReportExportMode,
  ReportFormat,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import ArteryDAO from '@/lib/db/ArteryDAO';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CountDAO from '@/lib/db/CountDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import StoragePath from '@/lib/io/storage/StoragePath';
import DateTime from '@/lib/time/DateTime';

jest.mock('@/lib/db/ArteryDAO');
jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/CountDAO');
jest.mock('@/lib/db/StudyDAO');

test('StoragePath.truncateDescription', () => {
  expect(StoragePath.truncateDescription('a / b / c', 10)).toEqual('a / b / c');
  expect(StoragePath.truncateDescription('a / b / c', 5)).toEqual('a / b');
  expect(StoragePath.truncateDescription('a / b / c', 4)).toEqual('a');
  expect(StoragePath.truncateDescription('a / b / c', 0)).toEqual('');
  expect(StoragePath.truncateDescription('abcdef', 5)).toEqual('abcde');
  expect(StoragePath.truncateDescription('abcdef', 6)).toEqual('abcdef');
  expect(StoragePath.truncateDescription('abcdef', 7)).toEqual('abcdef');
});

test('StoragePath.sanitizeLocationDescription', () => {
  expect(StoragePath.sanitizeLocationDescription(
    'St Clair Ave W / Hounslow Heath Rd / Silverthorn Ave',
    80,
  )).toEqual('ST_CLAIR_AVE_W_HOUNSLOW_HEATH_RD_SILVERTHORN_AVE');
  expect(StoragePath.sanitizeLocationDescription(
    'St Clair Ave W / Hounslow Heath Rd / Silverthorn Ave',
    40,
  )).toEqual('ST_CLAIR_AVE_W_HOUNSLOW_HEATH_RD');
  expect(StoragePath.sanitizeLocationDescription(
    'St Clair Ave W / Hounslow Heath Rd / Silverthorn Ave + 1 location',
    80,
  )).toEqual('ST_CLAIR_AVE_W_HOUNSLOW_HEATH_RD_SILVERTHORN_AVE_PLUS_1_LOCATION');
});

test('StoragePath.forReport [collision]', async () => {
  CentrelineDAO.byFeatures.mockResolvedValue([
    { description: 'St Clair Ave W / Hounslow Heath Rd / Silverthorn Ave' },
    { description: 'Old Weston Rd / Turnberry Ave' },
  ]);

  const report = {
    type: ReportType.COLLISION_DIRECTORY,
    id: 's1:AkttmBoXtmB/POINTS',
    format: ReportFormat.PDF,
    // options
    foo: 1,
    bar: 'baz',
  };
  await expect(StoragePath.forReport(report)).resolves.toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS_COLLISION,
    key: 'COLLISION_DIRECTORY_ST_CLAIR_AVE_W_HOUNSLOW_HEATH_RD_SILVERTHORN_AVE_PLUS_1_LOCATION_s1_AkttmBoXtmB_POINTS_204c1293.pdf',
  });
});

test('StoragePath.forReport [study, intersection]', async () => {
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineType: CentrelineType.INTERSECTION,
    description: 'Caledonia Rd / Rogers Rd',
  });
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue({
    startDate: DateTime.fromObject({ year: 2018, month: 3, day: 24 }),
    type: { studyType: StudyType.TMC },
  });

  const report = {
    type: ReportType.COUNT_SUMMARY_TURNING_MOVEMENT,
    id: '5/36853',
    format: ReportFormat.CSV,
  };
  await expect(StoragePath.forReport(report)).resolves.toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS_STUDY,
    key: 'COUNT_SUMMARY_TURNING_MOVEMENT_CALEDONIA_RD_ROGERS_RD_2018-03-24_5_36853.csv',
  });
});

test('StoragePath.forReport [study, midblock]', async () => {
  // /reporter/reports?type=SPEED_PERCENTILE&id=4%2F1349804&format=WEB
  ArteryDAO.byStudy.mockResolvedValue([
    { arteryCode: 11744, approachDir: CardinalDirection.SOUTH },
    { arteryCode: 37691, approachDir: CardinalDirection.NORTH },
  ]);
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineType: CentrelineType.SEGMENT,
    description: 'Silverthorn Ave: Rockwell Ave \u2013 Turnberry Ave',
  });
  CountDAO.byStudy.mockResolvedValue([
    { arteryCode: 11744 },
  ]);
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue({
    startDate: DateTime.fromObject({ year: 2011, month: 3, day: 1 }),
    type: { studyType: StudyType.ATR_SPEED_VOLUME },
  });

  const report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '4/1349804',
    format: ReportFormat.PDF,
  };
  await expect(StoragePath.forReport(report)).resolves.toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS_STUDY,
    key: 'SPEED_PERCENTILE_SILVERTHORN_AVE_ROCKWELL_AVE-TURNBERRY_AVE_SB_2011-03-01_4_1349804.pdf',
  });
});

test('StoragePath.forReportZip [collision]', async () => {
  CentrelineDAO.byFeatures.mockResolvedValue([
    { description: 'St Clair Ave W / Hounslow Heath Rd / Silverthorn Ave' },
    { description: 'Old Weston Rd / Turnberry Ave' },
  ]);

  const report = {
    type: ReportType.COLLISION_DIRECTORY,
    id: 's1:AkttmBoXtmB/POINTS',
    format: ReportFormat.PDF,
    // options
    foo: 1,
    bar: 'baz',
  };
  const storagePath = {
    namespace: StoragePath.NAMESPACE_REPORTS_COLLISION,
    key: 'COLLISION_DIRECTORY_ST_CLAIR_AVE_W_HOUNSLOW_HEATH_RD_SILVERTHORN_AVE_PLUS_1_LOCATION_s1_AkttmBoXtmB_POINTS_204c1293.pdf',
  };
  await expect(StoragePath.forReportZip({
    reportExportMode: ReportExportMode.COLLISIONS,
    reports: [report],
    s1: 's1:AkttmBoXtmB',
    selectionType: LocationSelectionType.POINTS,
  }, [storagePath])).resolves.toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS_COLLISION,
    key: 'COLLISION_s1_AkttmBoXtmB_POINTS_b45aaa7b.zip',
  });
});

test('StoragePath.forReportZip [study]', async () => {
  CentrelineDAO.byFeatures.mockResolvedValue([{
    centrelineType: CentrelineType.SEGMENT,
    description: 'Silverthorn Ave: Rockwell Ave \u2013 Turnberry Ave',
  }]);

  const report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '4/1349804',
    format: ReportFormat.PDF,
  };
  const storagePath = {
    namespace: StoragePath.NAMESPACE_REPORTS_STUDY,
    key: 'SPEED_PERCENTILE_SILVERTHORN_AVE_ROCKWELL_AVE-TURNBERRY_AVE_SB_2011-03-01_4_1349804.pdf',
  };
  await expect(StoragePath.forReportZip({
    reportExportMode: ReportExportMode.STUDIES,
    reports: [report],
    s1: 's1:ANHtIA',
    selectionType: LocationSelectionType.POINTS,
  }, [storagePath])).resolves.toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS_STUDY,
    key: 'STUDY_s1_ANHtIA_POINTS_76976bae.zip',
  });
});
