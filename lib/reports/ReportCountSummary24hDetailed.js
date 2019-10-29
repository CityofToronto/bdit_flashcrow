import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';

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

  transformData(parsedId, countData) {
    const volumeByBucket = ReportCountSummary24h.volumeByBucket(countData);
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

  generateCsv(count, rows) {
    const columns = [
      { key: 't', header: 'Time' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  getTableOptions(reportData) {
    return {
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        { c: 1 },
        { c: 2 },
        { c: 3 },
        { c: 4 },
      ],
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
          { value: h, header: true, style: { br: true } },
          { value: reportData[i].count, style: { br: true } },
          { value: reportData[i + 1].count, style: { br: true } },
          { value: reportData[i + 2].count, style: { br: true } },
          { value: reportData[i + 3].count },
        ];
      }),
    };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataBlock = ReportBaseFlow.getCountMetadataBlock(count);
    const tableOptions = this.getTableOptions(reportData);
    return [
      countMetadataBlock,
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCountSummary24hDetailed;
