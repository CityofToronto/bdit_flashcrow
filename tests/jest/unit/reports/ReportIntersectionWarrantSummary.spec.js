import ReportIntersectionWarrantSummary from '@/lib/reports/ReportIntersectionWarrantSummary';
import {
  generateMajorAndMinorDirections,
  generateTmc,
} from '@/lib/test/random/CountDataGenerator';

test('ReportIntersectionWarrantSummary#transformData', () => {
  const reportInstance = new ReportIntersectionWarrantSummary();

  // fuzz test
  for (let i = 0; i < 25; i++) {
    const countData = generateTmc();
    const { majorDirections, minorDirections } = generateMajorAndMinorDirections();
    expect(() => {
      reportInstance.transformData({
        countData,
        majorDirections,
        minorDirections,
      });
    }).not.toThrow();
  }
});
