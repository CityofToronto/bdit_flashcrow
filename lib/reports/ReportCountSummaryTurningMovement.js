/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { REPORT_CONSTANTS, ReportBlock, ReportType } from '@/lib/Constants';
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

  static AM_2_HOUR_PERIOD = REPORT_CONSTANTS.AM_PEAK_WINDOW;

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
    let intervalsInPeriod;
    const startIndex = intervals.findIndex(interval => interval.t.valueOf()
      >= period.startTime.valueOf());

    if (startIndex !== -1) {
      const postStartIntervals = intervals.slice(startIndex);
      const endIndex = this.findLastIntervalIndexForPeriod(postStartIntervals, period.endTime);

      if (endIndex === -1) {
        intervalsInPeriod = [];
      } else {
        intervalsInPeriod = postStartIntervals.slice(0, endIndex + 1);
      }
    } else {
      intervalsInPeriod = [];
    }
    return intervalsInPeriod;
  }

  static findLastIntervalIndexForPeriod(countIntervals, periodEndTime) {
    let periodEndIndex = -1;
    for (let n = 0; n < countIntervals.length; n++) {
      const nIntervalEndTime = countIntervals[n].t.plus(REPORT_CONSTANTS.COUNT_INTERVAL_DURATION);
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

  static getCandidatesForPeak(countIntervals,
    peakWindow,
    peakDuration = REPORT_CONSTANTS.PEAK_DURATION) {
    const candidates = [];

    let candidateStartTime = peakWindow.startTime;

    while (candidateStartTime.plus(peakDuration) <= peakWindow.endTime.valueOf()) {
      const candidatePeriod = {
        startTime: candidateStartTime,
        endTime: candidateStartTime.plus(peakDuration),
      };
      const candidateTotals = this.totalsForPeriod(countIntervals, candidatePeriod);
      candidates.push(candidateTotals);
      candidateStartTime = candidateStartTime.plus(REPORT_CONSTANTS.COUNT_INTERVAL_DURATION);
    }
    return candidates;
  }

  static statSubTotalsForNullCount() {
    const emptyTMC = ReportBaseFlowDirectional.emptyTmcRecord();
    return ReportBaseFlowDirectional.computeMovementAndVehicleTotals(emptyTMC);
  }

  static statSummaryForNullCount() {
    return {
      sum: this.statSubTotalsForNullCount(),
      timeRange: null,
    };
  }

  static totalsForPeak(intervalTotals, peakWindow) {
    let peakTotalsSummary = this.statSummaryForNullCount();
    const peakCandidates = this.getCandidatesForPeak(intervalTotals, peakWindow);

    if (peakCandidates.length > 0) {
      const candiatesSortedByTotal = peakCandidates.sort(
        (candidateA, candidateB) => candidateB.sum.VEHICLE_TOTAL - candidateA.sum.VEHICLE_TOTAL,
      );
      [peakTotalsSummary] = candiatesSortedByTotal;
    }
    return peakTotalsSummary;
  }

  static totalsForPeriod(intervalTotals, period = null) {
    const totalsSummary = this.statSummaryForNullCount();

    let intervalsInPeriod;
    let nIntervalsInPeriod;
    let validPeriod;

    if (period === null) {
      intervalsInPeriod = intervalTotals;
      nIntervalsInPeriod = intervalTotals.length;
      validPeriod = {
        startTime: intervalTotals[0].t,
        endTime: intervalTotals[nIntervalsInPeriod - 1].t.plus(
          REPORT_CONSTANTS.COUNT_INTERVAL_DURATION,
        ),
      };
    } else {
      validPeriod = period;
      intervalsInPeriod = this.getIntervalsWithinPeriod(intervalTotals, validPeriod);
      nIntervalsInPeriod = intervalsInPeriod.length;
    }

    if (nIntervalsInPeriod > 0) {
      totalsSummary.sum = ArrayUtils.sumObjects(intervalsInPeriod.map(interval => interval.data));
      totalsSummary.timeRange = {
        start: validPeriod.startTime,
        end: validPeriod.endTime,
        nIntervals: nIntervalsInPeriod,
      };
    }

    return totalsSummary;
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

  static transformCountData(countData) {
    const allZeroSummary = this.statSummaryForNullCount();
    const allZeroAverageSummary = { avg: allZeroSummary.sum, timeRange: allZeroSummary.timeRange };

    const statSummaries = {
      amPeak: allZeroSummary,
      pmPeak: allZeroSummary,
      offHours: allZeroAverageSummary,
      am: allZeroSummary,
      pm: allZeroSummary,
      all: allZeroSummary,
    };

    if (countData.length > 0) {
      const RBFD = ReportBaseFlowDirectional;
      const totaledData = RBFD.computeAllMovementAndVehicleTotals(countData);
      const studyDate = countData[0].t;

      const amPeakWindow = this.dateTimePeriodFromObject(
        REPORT_CONSTANTS.AM_PEAK_WINDOW, studyDate,
      );
      statSummaries.amPeak = this.totalsForPeak(totaledData, amPeakWindow);

      const pmPeakWindow = this.dateTimePeriodFromObject(
        REPORT_CONSTANTS.PM_PEAK_WINDOW, studyDate,
      );
      statSummaries.pmPeak = this.totalsForPeak(totaledData, pmPeakWindow);

      const am2HourPeriod = this.dateTimePeriodFromObject(this.AM_2_HOUR_PERIOD, studyDate);
      statSummaries.am = this.totalsForPeriod(totaledData, am2HourPeriod);

      const pm2HourPeriod = this.dateTimePeriodFromObject(
        REPORT_CONSTANTS.PM_2_HOUR_PERIOD, studyDate,
      );
      statSummaries.pm = this.totalsForPeriod(totaledData, pm2HourPeriod);

      const offHoursPeriod = this.dateTimePeriodFromObject(
        REPORT_CONSTANTS.OFF_HOUR_PERIOD, studyDate,
      );
      const offHoursTotals = this.totalsForPeriod(totaledData, offHoursPeriod);
      statSummaries.offHours = this.averagesForPeriod(offHoursTotals);

      statSummaries.all = this.totalsForPeriod(totaledData);
    }

    return statSummaries;
  }

  static getTrafficSignalId(countLocation) {
    if (countLocation === null) {
      return null;
    }
    if ('trafficSignalpx' in countLocation) {
      return `PX ${countLocation.trafficSignalpx}`;
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
    const stats = ReportCountSummaryTurningMovement.transformCountData(countData);

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
        name: '8H SUM',
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
          rowspan: 3,
          style: { br: true },
        },
        {
          value: 'Vehicle Type',
          rowspan: 3,
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
          colspan: 5,
          style: { bl: true },
        },
        {
          value: '(WEST APPROACH)',
          colspan: 5,
          style: { bl: true },
        },
        {
          value: '(NORTH APPROACH)',
          colspan: 5,
          style: { bl: true },
        },
        {
          value: '(EAST APPROACH)',
          colspan: 5,
          style: { bl: true },
        },
        {
          value: 'APPROACH',
          colspan: 4,
        },
        { value: null },
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
        '8H SUM',
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
    const hourRanges = hours === null ? null : hours.hint;
    const pxStr = px === null ? null : px.toString();
    const {
      BIKE_TOTAL,
      PEDS_TOTAL,
      TOTAL,
      VEHICLE_TOTAL,
    } = stats.all.sum;
    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      {
        cols: 3, name: 'Study Hours', value: hoursStr, subtext: hourRanges,
      },
      { cols: 3, name: 'Traffic Signal Number', value: pxStr },
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
