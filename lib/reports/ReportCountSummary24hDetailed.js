import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

/**
 * Subclass of {@link ReportBaseFlow} for the Detailed 24-Hour Count Summary Report.
 *
 * @see https://www.notion.so/bditto/Detailed-24-Hour-Count-Summary-Report-ccb63a389d2944c7ad172f08c5e65235
 */
class ReportCountSummary24hDetailed extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_24H_DETAILED;
  }

  transformData(countData) {
    const n = 24 * ReportBaseFlow.ROWS_PER_HOUR;
    const volumeByBucket = new Array(n).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.getHours();
      const m = t.getMinutes();
      const i = h * ReportBaseFlow.ROWS_PER_HOUR + Math.floor(m / ReportBaseFlow.MINUTES_PER_ROW);
      volumeByBucket[i] += COUNT;
    });

    const countDate = countData[0].t;
    const year = countDate.getFullYear();
    const month = countDate.getMonth();
    const date = countDate.getDate();
    return volumeByBucket.map((count, i) => {
      const hour = Math.floor(i / ReportBaseFlow.ROWS_PER_HOUR);
      const minute = (i % ReportBaseFlow.ROWS_PER_HOUR) * ReportBaseFlow.MINUTES_PER_ROW;
      const t = new Date(year, month, date, hour, minute);
      return { t, count };
    });
  }

  generateCsvLayout(count, rows) {
    const columns = [
      { key: 't', header: 'Time' },
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
