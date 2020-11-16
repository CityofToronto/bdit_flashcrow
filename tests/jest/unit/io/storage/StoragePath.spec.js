import { ReportFormat, ReportType } from '@/lib/Constants';
import StoragePath from '@/lib/io/storage/StoragePath';

test('StoragePath.forReport', async () => {
  let report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '1/2345',
    format: ReportFormat.CSV,
  };
  await expect(StoragePath.forReport(report)).resolves.toEqual({
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
  await expect(StoragePath.forReport(report)).resolves.toEqual({
    namespace: StoragePath.NAMESPACE_REPORTS,
    key: 'COLLISION_DIRECTORY_s1:AkttmBoXtmB_204c1293209bcf240d71f87d91f3f0eb.pdf',
  });
});

test('StoragePath.forReportZip', async () => {
  const report = {
    type: ReportType.SPEED_PERCENTILE,
    id: '1/2345',
    format: ReportFormat.CSV,
  };
  const storagePath = await StoragePath.forReport(report);
  const { namespace, key } = await StoragePath.forReportZip([report], [storagePath]);
  expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS);
  expect(key).toMatch(/[a-f0-9]+\.zip/);
});
