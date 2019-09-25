import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from './ReportBaseFlow';

/**
 * Subclass of {@link ReportBaseFlow} for the Graphical 24-Hour Count Summary
 * Report.
 *
 * @see https://www.notion.so/bditto/Graphical-24-Hour-Count-Summary-Report-9ae5570bc6eb4dcbbd99182f2aa7f2c8
 */
class ReportCountSummary24hGraphical extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_24H_GRAPHICAL;
  }

  transformData(countData) {
    const volumeByHour = new Array(24).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.getHours();
      volumeByHour[h] += COUNT;
    });
    return volumeByHour;
  }

  generateCsvLayout(count, volumeByHour) {
    const { date: countDate } = count;
    const year = countDate.getFullYear();
    const month = countDate.getMonth();
    const date = countDate.getDate();
    const rows = volumeByHour.map((value, hour) => {
      const time = new Date(year, month, date, hour);
      return { time, count: value };
    });
    const columns = [
      { key: 'time', header: 'Time' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  generatePdfLayout(count, volumeByHour) {
    const chartOptions = {
      chartData: volumeByHour,
    };

    const metadata = this.getPdfMetadata(count);
    const headers = volumeByHour.map((_, hour) => ({ key: hour, text: hour }));
    const tableOptions = {
      table: {
        headers,
        rows: [volumeByHour],
      },
    };
    return {
      layout: 'portrait',
      metadata,
      content: [
        { type: 'chart', options: chartOptions },
        { type: 'table', options: tableOptions },
      ],
    };
  }
}

export default ReportCountSummary24hGraphical;
