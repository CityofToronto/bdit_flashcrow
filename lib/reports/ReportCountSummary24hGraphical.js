/* eslint-disable class-methods-use-this */
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';

/**
 * Subclass of {@link ReportBaseFlow} for the Graphical 24-Hour Count Summary
 * Report.
 *
 * @see https://www.notion.so/bditto/Graphical-24-Hour-Count-Summary-Report-9ae5570bc6eb4dcbbd99182f2aa7f2c8
 */
class ReportCountSummary24hGraphical extends ReportBaseFlow {
  type() {
    return ReportType.COUNT_SUMMARY_24H_GRAPHICAL;
  }

  transformData(parsedId, countData) {
    const volumeByHour = new Array(24).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.hour;
      volumeByHour[h] += COUNT;
    });
    return volumeByHour;
  }

  generateCsv(count, volumeByHour) {
    const { date: { year, month, day } } = count;
    const rows = volumeByHour.map((value, hour) => {
      const time = DateTime.fromObject({
        year,
        month,
        day,
        hour,
      });
      return { time, count: value };
    });
    const columns = [
      { key: 'time', header: 'Time' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  getBarChartOptions(reportData) {
    return {
      data: reportData,
      labelAxisX: 'Start Hour',
      labelAxisY: 'Number of Vehicles',
      title: 'Volume by Hour of Day',
    };
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
          style: { alignment: 'center', fontSize: 's' },
        })),
      ],
    };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataBlock = ReportBaseFlow.getCountMetadataBlock(count);
    const barChartOptions = this.getBarChartOptions(reportData);
    const tableOptions = this.getTableOptions(reportData);
    return [
      countMetadataBlock,
      { type: ReportBlock.BAR_CHART, options: barChartOptions },
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCountSummary24hGraphical;
