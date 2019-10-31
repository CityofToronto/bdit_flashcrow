import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Subclass of {@link ReportBaseFlow} for the Turning Movement Count Summary Report.
 *
 * @see https://www.notion.so/bditto/Turning-Movement-Count-Summary-Report-d9bc143ed7e14acc894a4c0c0135c8a4
 */
class ReportCountSummaryTurningMovement extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_TURNING_MOVEMENT;
  }

  static sumIndices(totaledData, indices) {
    const totaledDataRows = ArrayUtils.selectIndices(totaledData, indices);
    const totaledDataPoints = totaledDataRows.map(({ data }) => data);
    return ArrayUtils.sumObjects(totaledDataPoints);
  }

  static avgPerHourIndices(totaledData, indices) {
    const sum = ReportCountSummaryTurningMovement.sumIndices(totaledData, indices);
    const n = indices.length;
    const avg = {};
    Object.entries(sum).forEach(([key, value]) => {
      avg[key] = Math.round(ReportBaseFlow.ROWS_PER_HOUR * value / n);
    });
    return avg;
  }

  static timeRange(totaledData, indices) {
    const n = indices.length;
    const indexStart = indices[0];
    const indexEnd = indices[n - 1];
    let { t: start } = totaledData[indexStart];
    const { t: end } = totaledData[indexEnd];
    start = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      start.getHours(),
      start.getMinutes() - ReportBaseFlow.MINUTES_PER_ROW,
      start.getSeconds(),
    );
    return { start, end };
  }

  static peakIndices(totaledData, lo, hi, len) {
    let peakVolume = -Infinity;
    let peak = null;
    for (let i = lo; i < hi - len; i += 1) {
      const indices = ArrayUtils.range(i, i + len);
      const sum = ReportCountSummaryTurningMovement.sumIndices(totaledData, indices);
      if (sum.TOTAL > peakVolume) {
        peakVolume = sum.TOTAL;
        peak = indices;
      }
    }
    return peak;
  }

  static sumSection(totaledData, indices) {
    const sum = ReportCountSummaryTurningMovement.sumIndices(
      totaledData,
      indices,
    );
    const timeRange = ReportCountSummaryTurningMovement.timeRange(
      totaledData,
      indices,
    );
    return {
      indices,
      sum,
      timeRange,
    };
  }

  static avgSection(totaledData, indices) {
    const avg = ReportCountSummaryTurningMovement.avgPerHourIndices(
      totaledData,
      indices,
    );
    const timeRange = ReportCountSummaryTurningMovement.timeRange(
      totaledData,
      indices,
    );
    return {
      indices,
      avg,
      timeRange,
    };
  }

  transformData(parsedId, countData) {
    const totaledData = ReportBaseFlowDirectional.computeAllMovementAndVehicleTotals(
      countData,
    );

    const indicesAmPeak = ReportCountSummaryTurningMovement.peakIndices(
      totaledData,
      ReportCountSummaryTurningMovement.INDEX_AM_PEAK_START,
      ReportCountSummaryTurningMovement.INDEX_AM_PEAK_END,
      ReportBaseFlow.ROWS_PER_HOUR,
    );
    const amPeak = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesAmPeak,
    );

    const indicesPmPeak = ReportCountSummaryTurningMovement.peakIndices(
      totaledData,
      ReportCountSummaryTurningMovement.INDEX_PM_PEAK_START,
      ReportCountSummaryTurningMovement.INDEX_PM_PEAK_END,
      ReportBaseFlow.ROWS_PER_HOUR,
    );
    const pmPeak = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesPmPeak,
    );

    const indicesOffHours = ArrayUtils.range(
      ReportCountSummaryTurningMovement.INDEX_AM_PEAK_END,
      ReportCountSummaryTurningMovement.INDEX_PM_PEAK_START,
    );
    const offHours = ReportCountSummaryTurningMovement.avgSection(
      totaledData,
      indicesOffHours,
    );

    const indicesAm = ArrayUtils.range(
      ReportCountSummaryTurningMovement.INDEX_AM_PEAK_START,
      ReportCountSummaryTurningMovement.INDEX_AM_PEAK_END,
    );
    const am = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesAm,
    );

    const indicesPm = ArrayUtils.range(
      ReportCountSummaryTurningMovement.INDEX_PM_PEAK_START,
      ReportCountSummaryTurningMovement.INDEX_PM_PEAK_END,
    );
    const pm = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesPm,
    );

    const indicesAll = ArrayUtils.range(0, totaledData.length);
    const all = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesAll,
    );

    return {
      amPeak,
      pmPeak,
      offHours,
      am,
      pm,
      all,
    };
  }

  generateCsv(count, {
    amPeak,
    pmPeak,
    offHours,
    am,
    pm,
    all,
  }) {
    const dataKeys = Object.keys(amPeak.sum);
    const dataColumns = dataKeys.map(key => ({ key, header: key }));
    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'start', header: 'Start' },
      { key: 'end', header: 'End' },
      ...dataColumns,
    ];
    const rows = [
      {
        name: 'AM PEAK',
        ...amPeak.timeRange,
        ...amPeak.sum,
      }, {
        name: 'PM PEAK',
        ...pmPeak.timeRange,
        ...pmPeak.sum,
      }, {
        name: 'OFF HR AVG',
        ...offHours.timeRange,
        ...offHours.avg,
      }, {
        name: '2 HR AM',
        ...am.timeRange,
        ...am.sum,
      }, {
        name: '2 HR PM',
        ...pm.timeRange,
        ...pm.sum,
      }, {
        name: '8 HR SUM',
        ...all.timeRange,
        ...all.sum,
      },
    ];
    return { columns, rows };
  }

  // PDF GENERATION

  static getTableHeader() {
    const dirs = [
      { value: 'Exits', style: { bl: true } },
      { value: 'Left' },
      { value: 'Thru' },
      { value: 'Right' },
      { value: 'Total' },
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
          colspan: 5,
          style: { bl: true },
        },
        {
          value: 'EASTBOUND',
          colspan: 5,
          style: { bl: true },
        },
        {
          value: 'SOUTHBOUND',
          colspan: 5,
          style: { bl: true },
        },
        {
          value: 'WESTBOUND',
          colspan: 5,
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

  static getTableSectionLayout(sectionData, timeRange, title, shade) {
    const timeRangeHuman = TimeFormatters.formatRangeTimeOfDay(timeRange);
    const dirs = ['N', 'E', 'S', 'W'];
    const turns = ['L', 'T', 'R', 'TOTAL'];
    return [
      [
        {
          value: timeRangeHuman,
          header: true,
          rowspan: 2,
          style: { br: true, shade },
        },
        { value: 'CAR', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          {
            value: sectionData[`${dir}_CARS_EXITS`],
            style: { bl: true, shade },
          },
          ...turns.map(turn => ({
            value: sectionData[`${dir}_CARS_${turn}`],
            style: { shade },
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
          {
            value: sectionData[`${dir}_TRUCK_EXITS`],
            style: { bl: true, shade },
          },
          ...turns.map(turn => ({
            value: sectionData[`${dir}_TRUCK_${turn}`],
            style: { shade },
          })),
        ])),
        { value: 'S', header: true, style: { bl: true, shade } },
        { value: sectionData.S_PEDS, style: { shade } },
        { value: sectionData.S_BIKE, style: { shade } },
        { value: sectionData.S_OTHER, style: { shade } },
      ],
      [
        {
          value: title,
          header: true,
          rowspan: 2,
          style: { br: true, shade },
        },
        { value: 'BUS', header: true, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          {
            value: sectionData[`${dir}_BUS_EXITS`],
            style: { bl: true, shade },
          },
          ...turns.map(turn => ({
            value: sectionData[`${dir}_BUS_${turn}`],
            style: { shade },
          })),
        ])),
        { value: 'E', header: true, style: { bl: true, shade } },
        { value: sectionData.E_PEDS, style: { shade } },
        { value: sectionData.E_BIKE, style: { shade } },
        { value: sectionData.E_OTHER, style: { shade } },
      ],
      [
        { value: null, style: { shade } },
        ...Array.prototype.concat.apply([], dirs.map(() => [
          { value: null, style: { bl: true, shade } },
          ...turns.map(() => ({ value: null, style: { shade } })),
        ])),
        { value: 'W', header: true, style: { bl: true, shade } },
        { value: sectionData.W_PEDS, style: { shade } },
        { value: sectionData.W_BIKE, style: { shade } },
        { value: sectionData.W_OTHER, style: { shade } },
      ],
      [
        { value: null, header: true, style: { br: true, shade } },
        { value: 'TOTAL', header: true, style: { bt: true, shade } },
        ...Array.prototype.concat.apply([], dirs.map(dir => [
          {
            value: sectionData[`${dir}_VEHICLE_EXITS`],
            style: { bt: true, bl: true, shade },
          },
          ...turns.map(turn => ({
            value: sectionData[`${dir}_VEHICLE_${turn}`],
            style: { bt: true, shade },
          })),
        ])),
        { value: null, header: true, style: { bt: true, bl: true, shade } },
        { value: sectionData.PEDS_TOTAL, style: { bt: true, shade } },
        { value: sectionData.BIKE_TOTAL, style: { bt: true, shade } },
        { value: sectionData.OTHER_TOTAL, style: { bt: true, shade } },
      ],
    ];
  }

  static getTableOptions(reportData) {
    const header = ReportCountSummaryTurningMovement.getTableHeader();
    const body = [
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.amPeak.sum,
        reportData.amPeak.timeRange,
        'AM PEAK',
        false,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.pmPeak.sum,
        reportData.pmPeak.timeRange,
        'PM PEAK',
        true,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.offHours.avg,
        reportData.offHours.timeRange,
        'OFF HR AVG',
        false,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.am.sum,
        reportData.am.timeRange,
        '2 HR AM',
        true,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.pm.sum,
        reportData.pm.timeRange,
        '2 HR PM',
        false,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.all.sum,
        reportData.all.timeRange,
        '8 HR SUM',
        true,
      ),
    ];
    return {
      tableStyle: { fontSize: 'xs' },
      header,
      body,
    };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataBlock = ReportBaseFlow.getCountMetadataBlock(count);
    const tableOptions = ReportCountSummaryTurningMovement.getTableOptions(reportData);
    return [
      countMetadataBlock,
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

// TODO: configurable AM / PM peaks?

/**
 * @type {number}
 */
ReportCountSummaryTurningMovement.INDEX_AM_PEAK_START = 0;

/**
 * @type {number}
 */
ReportCountSummaryTurningMovement.INDEX_AM_PEAK_END = 8;

/**
 * @type {number}
 */
ReportCountSummaryTurningMovement.INDEX_PM_PEAK_START = 24;

/**
 * @type {number}
 */
ReportCountSummaryTurningMovement.INDEX_PM_PEAK_END = 32;


export default ReportCountSummaryTurningMovement;
