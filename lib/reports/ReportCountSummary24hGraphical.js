/* eslint-disable class-methods-use-this */
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

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

  static getVolumeByHour(countData) {
    const volumeByHour = new Array(24).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.hour;
      volumeByHour[h] += COUNT;
    });
    return volumeByHour;
  }

  transformData(study, { counts, studyData }) {
    return counts.map((count) => {
      const { date, direction, id } = count;
      const countData = studyData.get(id);

      const volumeByHour = ReportCountSummary24hGraphical.getVolumeByHour(countData);
      return { date, direction, volumeByHour };
    });
  }

  generateCsv(count, reportData) {
    const rows = [];
    reportData.forEach(({ date, direction, volumeByHour }) => {
      const { year, month, day } = date;
      volumeByHour.forEach((value, hour) => {
        const time = DateTime.fromObject({
          year,
          month,
          day,
          hour,
        });
        const fields = { time, direction, count: value };
        rows.push(fields);
      });
    });
    const columns = [
      { key: 'time', header: 'Time' },
      { key: 'direction', header: 'Direction' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  getBarChartOptions({ date, direction, volumeByHour }) {
    const data = volumeByHour.map((value, i) => ({ tick: i, value }));
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const title = `Hourly Volume: ${dateStr} (${dayOfWeekStr}), ${direction.bound}`;
    return {
      data,
      labelAxisX: 'Start Hour',
      labelAxisY: 'Number of Vehicles',
      title,
    };
  }

  getTableOptions({ volumeByHour }) {
    return {
      columnStyles: volumeByHour.map((_, h) => ({ c: h })),
      extraPadding: true,
      header: [
        volumeByHour.map((_, h) => ({
          value: h,
          style: { bb: true, fontSize: 'xs' },
        })),
      ],
      body: [
        volumeByHour.map(n => ({
          value: n,
          style: { alignment: 'center', fontSize: 'xs' },
        })),
      ],
    };
  }

  generateLayoutContent(count, reportData) {
    const layout = [];
    reportData.forEach((reportBlock) => {
      const barChartOptions = this.getBarChartOptions(reportBlock);
      const tableOptions = this.getTableOptions(reportBlock);
      layout.push({ type: ReportBlock.BAR_CHART, options: barChartOptions });
      layout.push({ type: ReportBlock.TABLE, options: tableOptions });
    });
    return layout;
  }
}

export default ReportCountSummary24hGraphical;
