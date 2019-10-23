import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';

/**
 * Subclass of {@link ReportBaseFlow} for the Intersection Detailed 15 Minutes Movement Report.
 *
 * @see https://www.notion.so/bditto/Intersection-Detailed-15-Minutes-Movement-Report-a40897bce24546d988c8a3717ccda812
 */
class ReportCountSummaryTurningMovementDetailed extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED;
  }

  transformData(parsedId, countData) {
    return countData.map(({ t, data: rawData }) => {
      const data = ReportBaseFlowDirectional.computeMovements(rawData);
      return { t, data };
    });
  }

  generateCsvLayout(count, totaledData) {
    const dataKeys = Object.keys(totaledData[0].data);
    const dataColumns = dataKeys.map(key => ({ key, header: key }));
    const columns = [
      { key: 'time', header: 'Time' },
      ...dataColumns,
    ];
    const rows = totaledData.map(({ t: time, data }) => ({ time, ...data }));
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

export default ReportCountSummaryTurningMovementDetailed;
