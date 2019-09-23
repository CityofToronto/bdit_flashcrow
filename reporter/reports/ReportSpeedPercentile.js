import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from './ReportBaseFlow';

/**
 * Subclass of {@link ReportBase} for the Illustrated Turning Movement Count
 * Summary Report.
 */
class ReportSpeedPercentile extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.SPEED_PERCENTILE;
  }

  transformData(/* countData */) {
    // TODO: perform computations
  }

  generateCsvLayout(/* count, transformedData */) {
    const columns = [
      // TODO: columns
    ];
    return { columns, rows: [] };
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

export default ReportSpeedPercentile;
