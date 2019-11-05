import { ReportType } from '@/lib/Constants';
import ReportFactory from '@/lib/reports/ReportFactory';

test('ReportFactory [coverage]', () => {
  ReportType.enumValues.forEach((reportType) => {
    if (reportType.disabled) {
      expect(() => {
        ReportFactory.getInstance(reportType);
      }).toThrow();
    } else {
      expect(() => {
        ReportFactory.getInstance(reportType);
      }).not.toThrow();
    }
  });
});
