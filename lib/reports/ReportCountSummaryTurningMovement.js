/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import {
  indexRangeHourOfDay,
  indexRangePeakTime,
} from '@/lib/reports/time/ReportTimeUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';
import DateTime from '@/lib/time/DateTime';

const REGEX_PX = /PX (\d+)/;

/**
 * Subclass of {@link ReportBaseFlow} for the Turning Movement Count Summary Report.
 *
 * @see https://www.notion.so/bditto/Turning-Movement-Count-Summary-Report-d9bc143ed7e14acc894a4c0c0135c8a4
 */
class ReportCountSummaryTurningMovement extends ReportBaseFlow {
  type() {
    return ReportType.COUNT_SUMMARY_TURNING_MOVEMENT;
  }

  static sumIndexRange(countData, indexRange) {
    const { lo, hi } = indexRange;
    if (lo === hi) {
      const data = ReportBaseFlowDirectional.emptyTmcRecord();
      return ReportBaseFlowDirectional.computeMovementAndVehicleTotals(data);
    }
    const countDataPoints = countData
      .slice(lo, hi)
      .map(({ data }) => data);
    return ArrayUtils.sumObjects(countDataPoints);
  }

  static avgPerHourIndexRange(countData, indexRange) {
    const { lo, hi } = indexRange;
    if (lo === hi) {
      const data = ReportBaseFlowDirectional.emptyTmcRecord();
      return ReportBaseFlowDirectional.computeMovementAndVehicleTotals(data);
    }

    const sum = ReportCountSummaryTurningMovement.sumIndexRange(countData, indexRange);
    const avg = {};
    const n = hi - lo;
    Object.entries(sum).forEach(([key, value]) => {
      avg[key] = Math.round(ReportBaseFlow.ROWS_PER_HOUR * value / n);
    });
    return ReportBaseFlowDirectional.computeMovementAndVehicleTotals(avg);
  }

  static sumSection(totaledData, indexRange) {
    const sum = ReportCountSummaryTurningMovement.sumIndexRange(
      totaledData,
      indexRange,
    );
    const timeRange = ReportCountSummaryTurningMovement.timeRange(
      totaledData,
      indexRange,
    );
    return {
      sum,
      timeRange,
    };
  }

  static avgSection(countData, indexRange) {
    const avg = ReportCountSummaryTurningMovement.avgPerHourIndexRange(
      countData,
      indexRange,
    );
    const timeRange = ReportCountSummaryTurningMovement.timeRange(
      countData,
      indexRange,
    );
    return {
      avg,
      timeRange,
    };
  }

  static COUNT_INTERVAL_DURATION = { minutes: 15 };

  static PEAK_DURATION = { hours: 1 };

  static AM_PEAK_WINDOW = {
    start: { hour: 7, minute: 30 },
    end: { hour: 9, minute: 30 },
  }

  static getAmPeakWindwCountIntervals(intervals, date) {
    const startTimeObj = { ...date.toObject(), ...this.AM_PEAK_WINDOW.start };
    const startTime = DateTime.fromObject(startTimeObj);
    const startIndex = intervals.findIndex(interval => interval.t.valueOf() >= startTime.valueOf());
    const laterIntervals = intervals.slice(startIndex);

    const endTimeObj = { ...date.toObject(), ...this.AM_PEAK_WINDOW.end };
    const endTime = DateTime.fromObject(endTimeObj);
    const endIndex = this.findLastIntervalIndexForPeriod(laterIntervals, endTime);

    const amPeakWindowIntervals = laterIntervals.slice(0, endIndex + 1);
    return amPeakWindowIntervals;
  }

  static findLastIntervalIndexForPeriod(countIntervals, periodEndTime) {
    let periodEndIndex;
    for (let n = 0; n < countIntervals.length; n++) {
      const nIntervalEndTime = countIntervals[n].t.plus(this.COUNT_INTERVAL_DURATION);
      if (nIntervalEndTime.valueOf() === periodEndTime.valueOf()) {
        periodEndIndex = n;
        break;
      } else if (nIntervalEndTime.valueOf() > periodEndTime.valueOf()) {
        periodEndIndex = n - 1;
        break;
      }
    }
    return periodEndIndex;
  }

  static peakCandidates(countIntervals, peakDuration = this.PEAK_DURATION) {
    const candidates = [];

    countIntervals.forEach((periodStartCount, periodStartIndex) => {
      const laterIntervals = countIntervals.slice(periodStartIndex);
      const periodEndTime = periodStartCount.t.plus(peakDuration);
      const periodEndIndex = this.findLastIntervalIndexForPeriod(laterIntervals, periodEndTime);
      if (periodEndIndex) {
        const periodCountIntervals = laterIntervals.slice(0, periodEndIndex + 1);
        candidates.push({
          startIndex: periodStartIndex,
          endIndex: periodEndIndex,
          startIntervalTime: periodStartCount.t.toISOTime(),
          endIntervalTime: periodCountIntervals[periodEndIndex].t.toISOTime(),
          countIntervals: periodCountIntervals,
          totalVehicles: periodCountIntervals.reduce((p, n) => p + n.data.VEHICLE_TOTAL, 0),
        });
      }
    });
    return candidates;
  }

  static getPeakCountIntervals(countIntervals) {
    const peakCandidates = this.peakCandidates(countIntervals);
    let peakCountIntervals = null;

    if (peakCandidates.length > 0) {
      const candiatesSortedByTotal = peakCandidates.sort(
        (periodA, periodB) => periodB.totalVehicles - periodA.totalVehicles,
      );
      const peak = candiatesSortedByTotal[0];
      peakCountIntervals = peak.countIntervals;
    }
    return peakCountIntervals;
  }

  static amPeak(intervalTotals, date) {
    let amPeakSums;
    let amPeakTimeRange;
    const amPeakWindowIntervals = this.getAmPeakWindwCountIntervals(intervalTotals, date);
    const amPeakIntervals = this.getPeakCountIntervals(amPeakWindowIntervals);
    if (intervalTotals.length > 0 && amPeakIntervals !== null) {
      amPeakSums = ArrayUtils.sumObjects(amPeakIntervals.map(c => c.data));
      amPeakTimeRange = {
        start: amPeakIntervals[0].t,
        end: amPeakIntervals[amPeakIntervals.length - 1].t.plus(this.COUNT_INTERVAL_DURATION),
      };
    } else {
      const emptyTMC = ReportBaseFlowDirectional.emptyTmcRecord();
      amPeakSums = ReportBaseFlowDirectional.computeMovementAndVehicleTotals(emptyTMC);
      amPeakTimeRange = null;
    }
    return { sum: amPeakSums, timeRange: amPeakTimeRange };
  }

  static transformCountData(countData, date) {
    const totaledData = ReportBaseFlowDirectional.computeAllMovementAndVehicleTotals(
      countData,
    );

    const amPeak = this.amPeak(totaledData, date);

    const indicesAm = indexRangeHourOfDay(totaledData, 0, 12);
    const indicesAm2Hour = indexRangePeakTime(
      totaledData,
      indicesAm,
      { hours: 2 },
      ({ VEHICLE_TOTAL }) => VEHICLE_TOTAL,
    );
    const am = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesAm2Hour,
    );

    const indicesPm = indexRangeHourOfDay(totaledData, 12, 24);
    const indicesPmPeak = indexRangePeakTime(
      totaledData,
      indicesPm,
      { hours: 1 },
      ({ VEHICLE_TOTAL }) => VEHICLE_TOTAL,
    );
    const pmPeak = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesPmPeak,
    );

    const indicesPm2Hour = indexRangePeakTime(
      totaledData,
      indicesPm,
      { hours: 2 },
      ({ VEHICLE_TOTAL }) => VEHICLE_TOTAL,
    );
    const pm = ReportCountSummaryTurningMovement.sumSection(
      totaledData,
      indicesPm2Hour,
    );

    /*
     * If we total, average, round in that order, totaled values will appear off, even though it's
     * more correct from a statistical / analytical perspective to do it that way.  As such, we
     * average, round, and then total at the end, to ensure sums look right.
     *
     * The assumption is that the error introduced by this process is acceptable.  (In any case,
     * we're not adding *that* many numbers together, so it is at the very least small in an
     * absolute sense.)
     */
    const indicesOffHours = { lo: indicesAm2Hour.hi, hi: indicesPm2Hour.lo };
    const offHours = ReportCountSummaryTurningMovement.avgSection(
      countData,
      indicesOffHours,
    );

    const indicesAll = { lo: 0, hi: totaledData.length };
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

  static getTrafficSignalId(countLocation) {
    if (countLocation === null) {
      return null;
    }
    const { description } = countLocation;
    const match = REGEX_PX.exec(description);
    if (match === null) {
      return null;
    }
    const px = parseInt(match[1], 10);
    if (Number.isNaN(px)) {
      return null;
    }
    return px;
  }

  transformData(study, { countLocation, counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }
    const [count] = counts;
    const { date, hours, id } = count;
    const px = ReportCountSummaryTurningMovement.getTrafficSignalId(countLocation);
    const countData = studyData.get(id);
    const stats = ReportCountSummaryTurningMovement.transformCountData(countData, date);

    return {
      date,
      hours,
      px,
      stats,
    };
  }

  generateCsv(count, { stats }) {
    const {
      amPeak,
      pmPeak,
      offHours,
      am,
      pm,
      all,
    } = stats;
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
        name: 'OFF HOUR AVG',
        ...offHours.timeRange,
        ...offHours.avg,
      }, {
        name: '2 HOUR AM',
        ...am.timeRange,
        ...am.sum,
      }, {
        name: '2 HOUR PM',
        ...pm.timeRange,
        ...pm.sum,
      }, {
        name: 'TOTAL SUM',
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
        { value: 'Total' },
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
        { value: 'PED', header: true, style: { bl: true, br: true, shade } },
        ...dirs.map(dir => ({
          value: sectionData[`${dir}_PEDS`],
          style: { shade },
        })),
        { value: sectionData.PEDS_TOTAL, style: { bl: true, shade } },
      ],
      [
        {
          value: title,
          header: true,
          rowspan: 2,
          style: { br: true, shade },
        },
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
        { value: 'BIKE', header: true, style: { bl: true, br: true, shade } },
        ...dirs.map(dir => ({
          value: sectionData[`${dir}_BIKE`],
          style: { shade },
        })),
        { value: sectionData.BIKE_TOTAL, style: { bl: true, shade } },
      ],
      [
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
        { value: 'OTHER', header: true, style: { bl: true, br: true, shade } },
        ...dirs.map(dir => ({
          value: sectionData[`${dir}_OTHER`],
          style: { shade },
        })),
        { value: sectionData.OTHER_TOTAL, style: { bl: true, shade } },
      ],
      [
        {
          value: sectionData.TOTAL,
          header: true,
          style: { br: true, shade },
        },
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
        {
          value: sectionData.VEHICLE_TOTAL,
          style: {
            bl: true,
            bt: true,
            br: true,
            bb: true,
            shade,
          },
        },
        {
          value: null,
          colspan: 5,
          style: { shade },
        },
      ],
      [
        { value: null, colspan: 28 },
      ],
    ];
  }

  static getTableOptions(reportData) {
    const header = ReportCountSummaryTurningMovement.getTableHeader();
    const body = [
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.all.sum,
        reportData.all.timeRange,
        'TOTAL SUM',
        false,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.amPeak.sum,
        reportData.amPeak.timeRange,
        'AM PEAK',
        true,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.pmPeak.sum,
        reportData.pmPeak.timeRange,
        'PM PEAK',
        false,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.offHours.avg,
        reportData.offHours.timeRange,
        'OFF HOUR AVG',
        true,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.am.sum,
        reportData.am.timeRange,
        '2 HOUR AM',
        false,
      ),
      ...ReportCountSummaryTurningMovement.getTableSectionLayout(
        reportData.pm.sum,
        reportData.pm.timeRange,
        '2 HOUR PM',
        true,
      ),
    ];
    return {
      tableStyle: { fontSize: '2xs' },
      columnStyles: [
        { c: 0 },
        { c: 1 },
        { c: 22 },
      ],
      header,
      body,
    };
  }

  static getCountMetadataOptions({
    date,
    hours,
    px,
    stats,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;
    const pxStr = px === null ? null : px.toString();
    const {
      BIKE_TOTAL,
      PEDS_TOTAL,
      TOTAL,
      VEHICLE_TOTAL,
    } = stats.all.sum;
    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      { cols: 3, name: 'Study Hours', value: hoursStr },
      { cols: 6, name: 'Traffic Signal Number', value: pxStr },
      { cols: 3, name: 'Total Volume', value: TOTAL },
      { cols: 3, name: 'Total Vehicles', value: VEHICLE_TOTAL },
      { cols: 3, name: 'Total Cyclists', value: BIKE_TOTAL },
      { cols: 3, name: 'Total Pedestrians', value: PEDS_TOTAL },
    ];
    return { entries };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataOptions = ReportCountSummaryTurningMovement.getCountMetadataOptions(
      reportData,
    );
    const { stats } = reportData;
    const tableOptions = ReportCountSummaryTurningMovement.getTableOptions(stats);
    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCountSummaryTurningMovement;
