import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

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

  transformData(parsedId, countData) {
    const volumeByHour = new Array(24).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.getHours();
      volumeByHour[h] += COUNT;
    });
    return volumeByHour;
  }

  generateCsv(count, volumeByHour) {
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

  getTableOptions(reportData) {
    return {
      title: 'Volume by Start Hour',
      columnStyles: reportData.map((_, h) => ({ c: h })),
      header: [
        reportData.map((_, h) => ({
          value: h,
          style: { bb: true, fontSize: 's' },
        })),
      ],
      body: [
        reportData.map(n => ({
          value: n,
          style: { fontSize: 's' },
        })),
      ],
    };
  }

  generateLayoutContent(count, reportData) {
    const barChartOptions = {
      chartData: reportData,
    };
    const blockFlowMetadata = ReportBaseFlow.getBlockFlowMetadata(count);
    const tableOptions = this.getTableOptions(reportData);
    return [
      blockFlowMetadata,
      { type: ReportBlock.BAR_CHART, options: barChartOptions },
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCountSummary24hGraphical;
