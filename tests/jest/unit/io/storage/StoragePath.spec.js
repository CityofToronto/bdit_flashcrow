import { ReportFormat, ReportType } from '@/lib/Constants';
import StoragePath from '@/lib/io/storage/StoragePath';

test('StoragePath.forReport', () => {
  let report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '1/2345',
    format: ReportFormat.CSV,
  };
  expect(StoragePath.forReport(report)).toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS,
    key: 'SPEED_PERCENTILE_1_2345.csv',
  });

  report = {
    type: ReportType.COLLISION_DIRECTORY,
    id: 's1:AkttmBoXtmB',
    format: ReportFormat.PDF,
    // options
    foo: 1,
    bar: 'baz',
  };
  expect(StoragePath.forReport(report)).toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS,
    key: 'COLLISION_DIRECTORY_s1:AkttmBoXtmB_204c1293.pdf',
  });
});

test('StoragePath.forReportZip', () => {
  const report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '1/2345',
    format: ReportFormat.CSV,
  };
  const { namespace, key } = StoragePath.forReportZip([report]);
  expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS);
  expect(key).toMatch(/[a-f0-9]+\.zip/);
});
