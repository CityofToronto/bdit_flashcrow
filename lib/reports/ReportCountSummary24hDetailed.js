/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Subclass of {@link ReportBaseFlow} for the Detailed 24-Hour Count Summary Report.
 *
 * @see https://www.notion.so/bditto/Detailed-24-Hour-Count-Summary-Report-ccb63a389d2944c7ad172f08c5e65235
 */
class ReportCountSummary24hDetailed extends ReportBaseFlow {
  type() {
    return ReportType.COUNT_SUMMARY_24H_DETAILED;
  }

  static transformCountData(countData) {
    const volumeByBucket = ReportCountSummary24h.volumeByBucket(countData);
    const countDate = countData[0].t;
    const { year, month, day } = countDate;
    return volumeByBucket.map((count, i) => {
      const hour = Math.floor(i / ReportBaseFlow.ROWS_PER_HOUR);
      const minute = (i % ReportBaseFlow.ROWS_PER_HOUR) * ReportBaseFlow.MINUTES_PER_ROW;
      const t = DateTime.fromObject({
        year,
        month,
        day,
        hour,
        minute,
      });
      return { t, count };
    });
  }

  transformData(study, { arteries, counts, studyData }) {
    return counts.map((count) => {
      const { arteryCode, date, id } = count;
      const artery = arteries.get(arteryCode);
      const direction = artery.approachDir;
      const countData = studyData.get(id);

      const volumeByBucket = ReportCountSummary24hDetailed.transformCountData(countData);
      return { date, direction, volumeByBucket };
    });
  }

  generateCsv(study, reportData) {
    const rows = [];
    reportData.forEach(({ direction, volumeByBucket }) => {
      volumeByBucket.forEach(({ t, count }) => {
        const fields = { t, direction, count };
        rows.push(fields);
      });
    });
    const columns = [
      { key: 't', header: 'Time' },
      { key: 'direction', header: 'Direction' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  getTableOptions({ date, direction, volumeByBucket }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const title = `Hourly Volume: ${dateStr} (${dayOfWeekStr}), ${direction.bound}`;
    return {
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        { c: 1 },
        { c: 2 },
        { c: 3 },
        { c: 4 },
      ],
      title,
      header: [
        [
          { value: 'Start Hour', style: { br: true } },
          { value: ':00', style: { br: true } },
          { value: ':15', style: { br: true } },
          { value: ':30', style: { br: true } },
          { value: ':45' },
        ],
      ],
      body: ArrayUtils.range(24).map((h) => {
        const i = h * 4;
        return [
          { value: h, header: true, style: { br: true, shade: h % 2 === 1 } },
          { value: volumeByBucket[i].count, style: { br: true, shade: h % 2 === 1 } },
          { value: volumeByBucket[i + 1].count, style: { br: true, shade: h % 2 === 1 } },
          { value: volumeByBucket[i + 2].count, style: { br: true, shade: h % 2 === 1 } },
          { value: volumeByBucket[i + 3].count, style: { shade: h % 2 === 1 } },
        ];
      }),
    };
  }

  generateLayoutContent(count, reportData) {
    const layout = [];
    reportData.forEach((reportBlock, i) => {
      const tableOptions = this.getTableOptions(reportBlock);
      if (i !== 0) {
        layout.push({ type: ReportBlock.PAGE_BREAK, options: {} });
      }
      layout.push({ type: ReportBlock.TABLE, options: tableOptions });
    });
    return layout;
  }
}

export default ReportCountSummary24hDetailed;
