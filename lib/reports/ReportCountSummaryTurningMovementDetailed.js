/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Subclass of {@link ReportBaseFlow} for the Intersection Detailed 15 Minutes Movement Report.
 *
 * @see https://www.notion.so/bditto/Intersection-Detailed-15-Minutes-Movement-Report-a40897bce24546d988c8a3717ccda812
 */
class ReportCountSummaryTurningMovementDetailed extends ReportBaseFlow {
  type() {
    return ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED;
  }

  transformData(study, { countLocation, counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }
    const [count] = counts;
    const { date, hours, id } = count;
    const px = ReportCountSummaryTurningMovement.getTrafficSignalId(countLocation);
    const countData = studyData.get(id);

    const rawData = countData.map(({ data }) => data);
    let all = ArrayUtils.sumObjects(rawData);
    all = ReportBaseFlowDirectional.computeMovementAndVehicleTotals(all);

    const raw = countData.map(({ t }, i) => {
      const data = ReportBaseFlowDirectional.computeMovements(rawData[i]);
      return { t, data };
    });

    return {
      all,
      date,
      hours,
      px,
      raw,
    };
  }

  generateCsv(count, { raw: totaledData }) {
    const dataKeys = Object.keys(totaledData[0].data);
    const dataColumns = dataKeys.map(key => ({
      key,
      // eslint-disable-next-line no-nested-ternary
      header: (['_PEDS', '_BIKE', '_OTHER'].some(element => key.includes(element)) ? `${key.slice(0, 1)}A${key.slice(1)}`
        : ['BUS', 'TRUCK', 'CAR'].some(element => key.includes(element)) ? `${key.slice(0, 1)}B${key.slice(1)}` : key),
    }));
    const columns = [
      { key: 'start', header: 'Start' },
      { key: 'end', header: 'End' },
      ...dataColumns,
    ];
    const rows = totaledData.map(({ t: start, data }) => {
      const end = start.plus({
        minutes: ReportBaseFlow.MINUTES_PER_ROW,
      });
      return { start, end, ...data };
    });
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
          rowspan: 3,
          style: { br: true },
        },
        {
          value: 'Vehicle Type',
          rowspan: 3,
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
          rowspan: 3,
          style: { bl: true },
        },
        {
          value: null,
          colspan: 5,
        },
      ],
      [
        {
          value: '(SOUTH APPROACH)',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: '(WEST APPROACH)',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: '(NORTH APPROACH)',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: '(EAST APPROACH)',
          colspan: 3,
          style: { bl: true },
        },
        {
          value: 'APPROACH',
          colspan: 5,
        },
      ],
      [
        ...dirs,
        ...dirs,
        ...dirs,
        ...dirs,
        { value: 'N' },
        { value: 'E' },
        { value: 'S' },
        { value: 'W' },
        { value: null },
      ],
    ];
  }

  static getTableSectionLayout({ t, data: sectionData }, shade) {
    const dirs = ['N', 'E', 'S', 'W'];
    const turns = ['L', 'T', 'R'];
    const start = t;
    const end = t.plus({ minutes: ReportBaseFlow.MINUTES_PER_ROW });
    const timeRange = { start, end };
    const timeRangeHuman = TimeFormatters.formatRangeTimeOfDay(timeRange);
    return [
      [
        {
          value: timeRangeHuman,
          header: true,
          style: { br: true, shade },
        },
        { value: 'CAR', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          ...turns.map(turn => ({
            value: sectionData[`${dir}_CARS_${turn}`],
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'PED', header: true, style: { bl: true, br: true, shade } },
        ...dirs.map(dir => ({
          value: sectionData[`${dir}_PEDS`],
          style: { shade },
        })),
        { value: null },
      ],
      [
        {
          value: null,
          style: { br: true, shade },
        },
        { value: 'TRUCK', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          ...turns.map(turn => ({
            value: sectionData[`${dir}_TRUCK_${turn}`],
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'BIKE', header: true, style: { bl: true, br: true, shade } },
        ...dirs.map(dir => ({
          value: sectionData[`${dir}_BIKE`],
          style: { shade },
        })),
        { value: null },
      ],
      [
        {
          value: null,
          style: { br: true, shade },
        },
        { value: 'BUS', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          ...turns.map(turn => ({
            value: sectionData[`${dir}_BUS_${turn}`],
            style: { bl: turn === 'L', shade },
          })),
        ])),
        { value: 'OTHER', header: true, style: { bl: true, br: true, shade } },
        ...dirs.map(dir => ({
          value: sectionData[`${dir}_OTHER`],
          style: { shade },
        })),
        { value: null },
      ],
      [
        { value: null, colspan: 20 },
      ],
    ];
  }

  static getTableOptions({ raw: reportData }) {
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
        { c: 0, style: { width: '2xxl' } },
      ],
      header,
      body,
    };
  }

  static getCountMetadataOptions({
    all,
    date,
    hours,
    px,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;
    const hourRanges = hours === null ? null : hours.hint;
    const pxStr = px === null ? null : px.toString();
    const {
      BIKE_TOTAL,
      PEDS_TOTAL,
      TOTAL,
      VEHICLE_TOTAL,
    } = all;
    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      {
        cols: 3, name: 'Study Hours', value: hoursStr, tooltip: hourRanges,
      },
      { cols: 3, name: 'Traffic Signal Number', value: pxStr },
      { cols: 3, name: ' ', value: ' ' },
      { cols: 3, name: 'Total Volume', value: TOTAL },
      { cols: 3, name: 'Total Vehicles', value: VEHICLE_TOTAL },
      { cols: 3, name: 'Total Cyclists', value: BIKE_TOTAL },
      { cols: 3, name: 'Total Pedestrians', value: PEDS_TOTAL },
    ];
    return { entries };
  }

  generateLayoutContent(study, reportData) {
    const countMetadataOptions = ReportCountSummaryTurningMovementDetailed.getCountMetadataOptions(
      reportData,
    );
    const tableOptions = ReportCountSummaryTurningMovementDetailed.getTableOptions(reportData);
    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCountSummaryTurningMovementDetailed;
