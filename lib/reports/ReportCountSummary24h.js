import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

/**
 * Subclass of {@link ReportBaseFlow} for the 24-Hour Count Summary Report.
 *
 * @see https://www.notion.so/bditto/24-Hour-Count-Summary-Report-573e17ae544749dab66c25f019281654
 */
class ReportCountSummary24h extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_24H;
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

export default ReportCountSummary24h;
