/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
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

  static COUNT_INTERVAL_DURATION = { minutes: 15 };

  static PEAK_DURATION = { hours: 1 };

  static AM_PEAK_WINDOW = {
    startTime: { hour: 7, minute: 30 },
    endTime: { hour: 9, minute: 30 },
  }

  static AM_2_HOUR_PERIOD = this.AM_PEAK_WINDOW;

  static PM_PEAK_WINDOW = {
    startTime: { hour: 14, minute: 15 },
    endTime: { hour: 18, minute: 0 },
  }

  static PM_2_HOUR_PERIOD = {
    startTime: { hour: 16, minute: 0 },
    endTime: { hour: 18, minute: 0 },
  }

  static OFF_HOUR_PERIOD = {
    startTime: { hour: 10, minute: 0 },
    endTime: { hour: 15, minute: 0 },
  }

  static dateTimePeriodFromObject({ startTime, endTime }, dateTime) {
    const startTimeObject = { ...dateTime.toObject(), ...startTime };
    const endTimeObject = { ...dateTime.toObject(), ...endTime };
    const dateTimePeriod = {
      startTime: DateTime.fromObject(startTimeObject),
      endTime: DateTime.fromObject(endTimeObject),
    };
    return dateTimePeriod;
  }

  static getIntervalsWithinPeriod(intervals, period) {
    const startIndex = intervals.findIndex(interval => interval.t.valueOf()
      >= period.startTime.valueOf());
    const postStartIntervals = intervals.slice(startIndex);
    const endIndex = this.findLastIntervalIndexForPeriod(postStartIntervals, period.endTime);

    const inertvalsInPeriod = postStartIntervals.slice(0, endIndex + 1);
    return inertvalsInPeriod;
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

  static getIntervalsAtPeak(countIntervals) {
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

  static nullCount() {
    const emptyTMC = ReportBaseFlowDirectional.emptyTmcRecord();
    return ReportBaseFlowDirectional.computeMovementAndVehicleTotals(emptyTMC);
  }

  static totalsForPeak(intervalTotals, window) {
    const intervalsInPeakWindow = this.getIntervalsWithinPeriod(intervalTotals, window);
    const intervalsAtPeak = this.getIntervalsAtPeak(intervalsInPeakWindow);

    let peakSums = this.nullCount();
    let peakTimeRange = null;

    if (intervalTotals.length > 0 && intervalsAtPeak !== null) {
      peakSums = ArrayUtils.sumObjects(intervalsAtPeak.map(interval => interval.data));
      peakTimeRange = {
        start: intervalsAtPeak[0].t,
        end: intervalsAtPeak[intervalsAtPeak.length - 1].t.plus(this.COUNT_INTERVAL_DURATION),
      };
    }
    return { sum: peakSums, timeRange: peakTimeRange };
  }

  static totalsForPeriod(intervalTotals, period) {
    const nIntervals = intervalTotals.length;
    let sum = this.nullCount();
    let timeRange = null;

    if (nIntervals > 0) {
      let validPeriod;
      if (period === undefined) {
        validPeriod = {
          startTime: intervalTotals[0].t,
          endTime: intervalTotals[nIntervals - 1].t.plus(this.COUNT_INTERVAL_DURATION),
          nIntervals,
        };
      } else {
        validPeriod = period;
      }
      const intervalsInPeriod = this.getIntervalsWithinPeriod(intervalTotals, validPeriod);
      const nIntervalsInPeriod = intervalsInPeriod.length;
      sum = ArrayUtils.sumObjects(intervalsInPeriod.map(interval => interval.data));
      timeRange = {
        start: intervalsInPeriod[0].t,
        end: intervalsInPeriod[nIntervalsInPeriod - 1].t.plus(this.COUNT_INTERVAL_DURATION),
        nIntervals: nIntervalsInPeriod,
      };
    }
    return { sum, timeRange };
  }

  static averagesForPeriod(periodTotals) {
    const { sum, timeRange } = periodTotals;
    if (timeRange === null) return { avg: sum, timeRange };

    const timeRangeInHours = timeRange.nIntervals / 4;
    const averages = {};
    Object.entries(sum).forEach(([key, value]) => {
      averages[key] = Math.round(value / timeRangeInHours);
    });
    return { avg: averages, timeRange };
  }

  static transformCountData(countData, studyDate) {
    const RBFD = ReportBaseFlowDirectional;
    const totaledData = RBFD.computeAllMovementAndVehicleTotals(countData);

    const amPeakWindow = this.dateTimePeriodFromObject(this.AM_PEAK_WINDOW, studyDate);
    const amPeak = this.totalsForPeak(totaledData, amPeakWindow);

    const pmPeakWindow = this.dateTimePeriodFromObject(this.PM_PEAK_WINDOW, studyDate);
    const pmPeak = this.totalsForPeak(totaledData, pmPeakWindow);

    const am2HourPeriod = this.dateTimePeriodFromObject(this.AM_2_HOUR_PERIOD, studyDate);
    const am2Hour = this.totalsForPeriod(totaledData, am2HourPeriod);

    const pm2HourPeriod = this.dateTimePeriodFromObject(this.PM_2_HOUR_PERIOD, studyDate);
    const pm2Hour = this.totalsForPeriod(totaledData, pm2HourPeriod);

    const offHoursPeriod = this.dateTimePeriodFromObject(this.OFF_HOUR_PERIOD, studyDate);
    const offHoursTotals = this.totalsForPeriod(totaledData, offHoursPeriod);
    const offHours = this.averagesForPeriod(offHoursTotals);

    const studyCountSummary = this.totalsForPeriod(totaledData);

    return {
      amPeak,
      pmPeak,
      offHours,
      am: am2Hour,
      pm: pm2Hour,
      all: studyCountSummary,
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
