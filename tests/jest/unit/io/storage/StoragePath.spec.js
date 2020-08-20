import { ReportFormat, ReportType } from '@/lib/Constants';
import StoragePath from '@/lib/io/storage/StoragePath';

test('StoragePath.forReport', () => {
  const report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '1/2345',
    format: ReportFormat.CSV,
  };
  expect(StoragePath.forReport(report)).toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS,
    key: 'SPEED_PERCENTILE_1_2345.csv',
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
