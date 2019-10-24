import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

/**
 * Subclass of {@link ReportBaseFlow} for the Illustrated Turning Movement Count
 * Summary Report.
 *
 * @see https://www.notion.so/bditto/Illustrated-Turning-Movement-Count-Summary-Report-6f9d2e01a64a4642ba93ada45900e68b
 */
class ReportCountSummaryTurningMovementIllustrated extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED;
  }

  transformData(/* countData */) {
    // TODO: perform computations
  }

  generateCsv(/* count, transformedData */) {
    const columns = [
      // TODO: columns
    ];
    return { columns, rows: [] };
  }

  generateLayoutContent(count /* , transformedData */) {
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

export default ReportCountSummaryTurningMovementIllustrated;
