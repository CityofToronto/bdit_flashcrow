import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from './ReportBaseFlow';

/**
 * Subclass of {@link ReportBase} for the Detailed 24-Hour Count Summary Report.
 */
class ReportCountSummary24hDetailed extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_24H_DETAILED;
  }

  transformData(countData) {
    return countData.map(({
      t,
      data: { COUNT: value },
    }) => ({
      time: t,
      count: value,
    }));
  }

  generateCsvLayout(count, rows) {
    const columns = [
      { key: 'time', header: 'Time' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  generatePdfLayout(count /* , transformedData */) {
    const metadata = this.getPdfMetadata(count);
    // TODO: content modules
    return {
      layout: 'portrait',
      metadata,
      content: [
        // TODO: content modules
      ],
    };
  }
}

export default ReportCountSummary24hDetailed;
