/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  REPORT_CONSTANTS,
  ReportBlock,
  ReportType,
  TurningMovement,
} from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import {
  indexRangeHourOfDay,
  indexRangeMax,
  indexRangePeakTime,
  indexRangeSum,
} from '@/lib/reports/time/ReportTimeUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';

class ReportPeakHourFactor extends ReportBaseFlow {
  type() {
    return ReportType.PEAK_HOUR_FACTOR;
  }

  static getEmptyPeakData(countData, lo) {
    let timeRange = null;
    if (countData.length > 0) {
      const start = countData[lo].t;
      timeRange = { start, end: start };
    }

    const peakData = {
      timeRange,
      movement: {},
      direction: {},
      total: null,
    };
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      peakData.direction[dir] = null;
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        peakData.movement[`${dir}_${turn}`] = null;
      });
    });
    return peakData;
  }

  static getPeakHourFactor(countData, indexRangePeak, fnVolume) {
    /*
     * This implementation assumes that `countData` contains regular 15-min buckets.
     */
    const volumeTotal = indexRangeSum(countData, indexRangePeak, fnVolume);
    const volumeMax = indexRangeMax(countData, indexRangePeak, fnVolume);
    if (volumeMax === 0) {
      return null;
    }
    return volumeTotal / (4 * volumeMax);
  }

  static getPeakData(countData, indexRange) {
    const indexRangePeak = indexRangePeakTime(
      countData,
      indexRange,
      { hours: 1 },
      ({ VEHICLE_TOTAL }) => VEHICLE_TOTAL,
    );
    const { lo, hi } = indexRangePeak;
    const peakData = ReportPeakHourFactor.getEmptyPeakData(countData, lo);
    if (lo === hi) {
      return peakData;
    }

    const end = countData[hi - 1].t.plus({
      minutes: ReportBaseFlow.MINUTES_PER_ROW,
    });
    peakData.timeRange.end = end;

    peakData.total = ReportPeakHourFactor.getPeakHourFactor(
      countData,
      indexRangePeak,
      ({ VEHICLE_TOTAL }) => VEHICLE_TOTAL,
    );
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      peakData.direction[dir] = ReportPeakHourFactor.getPeakHourFactor(
        countData,
        indexRangePeak,
        data => data[`${dir}_VEHICLE_TOTAL`],
      );
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        peakData.movement[`${dir}_${turn}`] = ReportPeakHourFactor.getPeakHourFactor(
          countData,
          indexRangePeak,
          data => data[`${dir}_VEHICLE_${turn}`],
        );
      });
    });
    return peakData;
  }

  transformData(study, { countLocation, counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }
    const [count] = counts;
    const { date, hours, id } = count;
    const px = ReportCountSummaryTurningMovement.getTrafficSignalId(countLocation);
    const countData = studyData.get(id);

    const totaledData = ReportBaseFlowDirectional.computeAllMovementAndVehicleTotals(
      countData,
    );

    const amIndices = indexRangeHourOfDay(totaledData, REPORT_CONSTANTS.AM_PEAK_WINDOW);
    const amPeak = ReportPeakHourFactor.getPeakData(totaledData, amIndices);

    const pmIndices = indexRangeHourOfDay(totaledData, REPORT_CONSTANTS.PM_PEAK_WINDOW);
    const pmPeak = ReportPeakHourFactor.getPeakData(totaledData, pmIndices);

    return {
      date,
      hours,
      px,
      amPeak,
      pmPeak,
    };
  }

  static getPeakCsvRows(name, peak) {
    const dirs = CardinalDirection.enumValues.map(({ short: dir }) => dir);
    const turns = TurningMovement.enumValues.map(({ short: turn }) => turn);

    return [
      ...Array.prototype.concat.apply([], dirs.map(
        dir => turns.map(turn => ({
          timeRange: name,
          ...peak.timeRange,
          dir,
          turn,
          value: peak.movement[`${dir}_${turn}`],
        })),
      )),
      ...dirs.map(dir => ({
        timeRange: name,
        ...peak.timeRange,
        dir,
        turn: null,
        value: peak.direction[dir],
      })),
      {
        timeRange: name,
        ...peak.timeRange,
        dir: null,
        turn: null,
        value: peak.total,
      },
    ];
  }

  generateCsv(study, { amPeak, pmPeak }) {
    const columns = [
      { key: 'timeRange', header: 'Time Range' },
      { key: 'start', header: 'Start' },
      { key: 'end', header: 'End' },
      { key: 'dir', header: 'Direction' },
      { key: 'turn', header: 'Turn' },
      { key: 'value', header: 'Peak Hour Factor' },
    ];
    const rows = [
      ...ReportPeakHourFactor.getPeakCsvRows('AM', amPeak),
      ...ReportPeakHourFactor.getPeakCsvRows('PM', pmPeak),
    ];
    return { columns, rows };
  }

  // PDF GENERATION

  static getMovementTableOptions(amPeak, pmPeak) {
    const dirs = CardinalDirection.enumValues.map(({ short: dir }) => dir);
    const turns = TurningMovement.enumValues.map(({ short: turn }) => turn);

    return {
      autoWidthTable: true,
      title: 'Peak Hour Factors: By Turning Movement',
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        ...ArrayUtils.range(dirs.length * turns.length).map(i => ({
          c: i + 1,
          style: { width: '2xl' },
        })),
      ],
      header: [
        [
          { value: 'Time Period', rowspan: 3 },
          { value: 'NORTHBOUND', colspan: 3, style: { bl: true } },
          { value: 'EASTBOUND', colspan: 3, style: { bl: true } },
          { value: 'SOUTHBOUND', colspan: 3, style: { bl: true } },
          { value: 'WESTBOUND', colspan: 3, style: { bl: true } },
        ],
        [
          { value: '(SOUTH APPROACH)', colspan: 3, style: { bl: true } },
          { value: '(WEST APPROACH)', colspan: 3, style: { bl: true } },
          { value: '(NORTH APPROACH)', colspan: 3, style: { bl: true } },
          { value: '(EAST APPROACH)', colspan: 3, style: { bl: true } },
        ],
        Array.prototype.concat.apply([], dirs.map(() => [
          { value: 'Left', style: { bl: true } },
          { value: 'Thru' },
          { value: 'Right' },
        ])),
      ],
      body: [
        [
          { value: 'AM', header: true },
          ...Array.prototype.concat.apply([], dirs.map(
            dir => turns.map(turn => ({
              value: amPeak.movement[`${dir}_${turn}`],
              style: { bl: turn === 'L' },
            })),
          )),
        ],
        [
          { value: 'PM', header: true, style: { shade: true } },
          ...Array.prototype.concat.apply([], dirs.map(
            dir => turns.map(turn => ({
              value: pmPeak.movement[`${dir}_${turn}`],
              style: { bl: turn === 'L', shade: true },
            })),
          )),
        ],
      ],
    };
  }

  static getDirectionTableOptions(amPeak, pmPeak) {
    const dirs = CardinalDirection.enumValues.map(({ short: dir }) => dir);

    return {
      autoWidthTable: true,
      title: 'Peak Hour Factors: By Direction',
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        ...ArrayUtils.range(dirs.length).map(i => ({
          c: i + 1,
          style: { width: '3xxl' },
        })),
      ],
      header: [
        [
          { value: 'Time Period', rowspan: 2, style: { br: true } },
          { value: 'NORTHBOUND' },
          { value: 'EASTBOUND' },
          { value: 'SOUTHBOUND' },
          { value: 'WESTBOUND' },
        ],
        [
          { value: '(SOUTH APPROACH)' },
          { value: '(WEST APPROACH)' },
          { value: '(NORTH APPROACH)' },
          { value: '(EAST APPROACH)' },
        ],
      ],
      body: [
        [
          { value: 'AM', header: true, style: { br: true } },
          ...dirs.map(dir => ({
            value: amPeak.direction[dir],
          })),
        ],
        [
          { value: 'PM', header: true, style: { br: true, shade: true } },
          ...dirs.map(dir => ({
            value: pmPeak.direction[dir],
            style: { shade: true },
          })),
        ],
      ],
    };
  }

  static getTotalTableOptions(amPeak, pmPeak) {
    return {
      autoWidthTable: true,
      title: 'Peak Hour Factors: Total',
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        { c: 1, style: { width: '3xl' } },
      ],
      header: [
        [
          { value: 'Time Period', style: { br: true } },
          { value: 'Factor' },
        ],
      ],
      body: [
        [
          { value: 'AM', header: true, style: { br: true } },
          { value: amPeak.total },
        ],
        [
          { value: 'PM', header: true, style: { br: true, shade: true } },
          { value: pmPeak.total, style: { shade: true } },
        ],
      ],
    };
  }

  static getCountMetadataOptions({
    amPeak,
    date,
    hours,
    pmPeak,
    px,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;
    const hourRanges = hours === null ? null : hours.hint;
    const pxStr = px === null ? null : px.toString();
    const amPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(amPeak.timeRange);
    const pmPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(pmPeak.timeRange);

    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      {
        cols: 3, name: 'Study Hours', value: hoursStr, tooltip: hourRanges,
      },
      { cols: 3, name: 'Traffic Signal Number', value: pxStr },
      { cols: 3, name: ' ', value: ' ' },
      { cols: 3, name: 'AM Peak', value: amPeakTimeRangeHuman },
      { cols: 3, name: 'AM Factor', value: amPeak.total },
      { cols: 3, name: 'PM Peak', value: pmPeakTimeRangeHuman },
      { cols: 3, name: 'PM Factor', value: pmPeak.total },
    ];
    return { entries };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataOptions = ReportPeakHourFactor.getCountMetadataOptions(reportData);
    const movementTableOptions = ReportPeakHourFactor.getMovementTableOptions(
      reportData.amPeak,
      reportData.pmPeak,
    );
    const directionTableOptions = ReportPeakHourFactor.getDirectionTableOptions(
      reportData.amPeak,
      reportData.pmPeak,
    );
    const totalTableOptions = ReportPeakHourFactor.getTotalTableOptions(
      reportData.amPeak,
      reportData.pmPeak,
    );
    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
      { type: ReportBlock.TABLE, options: movementTableOptions },
      { type: ReportBlock.TABLE, options: directionTableOptions },
      { type: ReportBlock.TABLE, options: totalTableOptions },
    ];
  }
}

export default ReportPeakHourFactor;
