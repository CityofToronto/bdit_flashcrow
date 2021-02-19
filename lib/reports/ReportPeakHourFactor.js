/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

class ReportPeakHourFactor extends ReportBaseFlow {
  type() {
    return ReportType.PEAK_HOUR_FACTOR;
  }

  // TODO: actually implement this
  static getPeakData() {
    const dirs = ['N', 'E', 'S', 'W'];
    const turns = ['L', 'T', 'R'];
    const now = DateTime.local();
    const peakData = {
      timeRange: { start: now, end: now.plus({ hours: 1 }) },
      movement: {},
      direction: {},
      total: Math.random(),
    };
    dirs.forEach((dir) => {
      peakData.direction[dir] = Math.random();
      turns.forEach((turn) => {
        peakData.movement[`${dir}_${turn}`] = Math.random();
      });
    });
    return peakData;
  }

  transformData(study, { counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }
    const [count] = counts;
    const { date, hours, id } = count;
    const px = ReportCountSummaryTurningMovement.getTrafficSignalId(count);
    const countData = studyData.get(id);

    // TODO: actually implement this
    const amPeak = ReportPeakHourFactor.getPeakData();
    const pmPeak = ReportPeakHourFactor.getPeakData();

    return {
      date,
      hours,
      px,
      amPeak,
      pmPeak,
      countData,
    };
  }

  static getMovementTableOptions(amPeak, pmPeak) {
    const dirs = ['N', 'E', 'S', 'W'];
    const turns = ['L', 'T', 'R'];

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
          { value: 'Time Period', rowspan: 2 },
          { value: 'NORTHBOUND', colspan: 3, style: { bl: true } },
          { value: 'EASTBOUND', colspan: 3, style: { bl: true } },
          { value: 'SOUTHBOUND', colspan: 3, style: { bl: true } },
          { value: 'WESTBOUND', colspan: 3, style: { bl: true } },
        ],
        Array.prototype.concat.apply([], dirs.map(() => [
          { value: 'Left', style: { bl: true } },
          { value: 'Thru' },
          { value: 'Right' },
        ])),
      ],
      body: [
        [
          { value: 'AM ', header: true },
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
    const dirs = ['N', 'E', 'S', 'W'];

    return {
      autoWidthTable: true,
      title: 'Peak Hour Factors: By Direction',
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        ...ArrayUtils.range(dirs.length).map(i => ({
          c: i + 1,
          style: { width: '3xl' },
        })),
      ],
      header: [
        [
          { value: 'Time Period', style: { br: true } },
          { value: 'NORTHBOUND' },
          { value: 'EASTBOUND' },
          { value: 'SOUTHBOUND' },
          { value: 'WESTBOUND' },
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
    const pxStr = px === null ? null : px.toString();
    const amPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(amPeak.timeRange);
    const pmPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(pmPeak.timeRange);

    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      { cols: 3, name: 'Study Hours', value: hoursStr },
      { cols: 6, name: 'Traffic Signal Number', value: pxStr },
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
