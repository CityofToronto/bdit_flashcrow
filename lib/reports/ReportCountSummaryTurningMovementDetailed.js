import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import TimeFormatters from '@/lib/time/TimeFormatters';

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

  generateCsv(count, totaledData) {
    const dataKeys = Object.keys(totaledData[0].data);
    const dataColumns = dataKeys.map(key => ({ key, header: key }));
    const columns = [
      { key: 'time', header: 'Time' },
      ...dataColumns,
    ];
    const rows = totaledData.map(({ t: time, data }) => ({ time, ...data }));
    return { columns, rows };
  }

  // PDF GENERATION

  static getTableHeader() {
    const dirs = [
      { value: 'Left', style: { bl: true } },
      { value: 'Thru' },
      { value: 'Right' },
    ];
    return [
      [
        {
          value: 'Time Period',
          rowspan: 2,
          style: { br: true },
        },
        {
          value: 'Vehicle Type',
          rowspan: 2,
        },
        {
          value: 'NORTHBOUND',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: 'EASTBOUND',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: 'SOUTHBOUND',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: 'WESTBOUND',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: null,
          rowspan: 2,
          style: { bl: true },
        },
        {
          value: null,
          colspan: 3,
        },
      ],
      [
        ...dirs,
        ...dirs,
        ...dirs,
        ...dirs,
        { value: 'Peds' },
        { value: 'Bike' },
        { value: 'Other' },
      ],
    ];
  }

  static getTableSectionLayout({ t, data: sectionData }, shade) {
    const dirs = ['N', 'E', 'S', 'W'];
    const turns = ['L', 'T', 'R'];
    const timeHuman = TimeFormatters.formatTimeOfDay(t);
    return [
      [
        {
          value: timeHuman,
          header: true,
          rowspan: 4,
          style: { br: true, shade },
        },
        { value: 'CAR', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          ...turns.map(turn => ({
            value: sectionData[`${dir}_CARS_${turn}`],
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'N', header: true, style: { bl: true, shade } },
        { value: sectionData.N_PEDS, style: { shade } },
        { value: sectionData.N_BIKE, style: { shade } },
        { value: sectionData.N_OTHER, style: { shade } },
      ],
      [
        { value: 'TRUCK', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          ...turns.map(turn => ({
            value: sectionData[`${dir}_TRUCK_${turn}`],
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'S', header: true, style: { bl: true, shade } },
        { value: sectionData.S_PEDS, style: { shade } },
        { value: sectionData.S_BIKE, style: { shade } },
        { value: sectionData.S_OTHER, style: { shade } },
      ],
      [
        { value: 'BUS', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          ...turns.map(turn => ({
            value: sectionData[`${dir}_BUS_${turn}`],
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'E', header: true, style: { bl: true, shade } },
        { value: sectionData.E_PEDS, style: { shade } },
        { value: sectionData.E_BIKE, style: { shade } },
        { value: sectionData.E_OTHER, style: { shade } },
      ],
      [
        { value: null, header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(() => [
          ...turns.map(turn => ({
            value: null,
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'W', header: true, style: { bl: true, shade } },
        { value: sectionData.W_PEDS, style: { shade } },
        { value: sectionData.W_BIKE, style: { shade } },
        { value: sectionData.W_OTHER, style: { shade } },
      ],
    ];
  }

  static getTableOptions(reportData) {
    const header = ReportCountSummaryTurningMovementDetailed.getTableHeader();
    const body = Array.prototype.concat.apply([], reportData.map(
      (section, i) => ReportCountSummaryTurningMovementDetailed.getTableSectionLayout(
        section,
        i % 2 === 1,
      ),
    ));
    return {
      tableStyle: { fontSize: 'xs' },
      columnStyles: [
        { c: 0 },
      ],
      header,
      body,
    };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataBlock = ReportBaseFlow.getCountMetadataBlock(count);
    const tableOptions = ReportCountSummaryTurningMovementDetailed.getTableOptions(reportData);
    return [
      countMetadataBlock,
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCountSummaryTurningMovementDetailed;
