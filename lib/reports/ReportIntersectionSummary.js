/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  ReportBlock,
  ReportType,
  TurningMovement,
} from '@/lib/Constants';
import ObjectUtils from '@/lib/ObjectUtils';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Subclass of {@link ReportBaseFlow} for the Intersection Summary Report.
 *
 * @see https://www.notion.so/bditto/Intersection-Summary-Report-6f06d430038c4421b5e727a478af1b34
 */
class ReportIntersectionSummary extends ReportBaseFlowDirectional {
  type() {
    return ReportType.INTERSECTION_SUMMARY;
  }

  static computeHourlyTotals(tmcData, majorDirections, minorDirections) {
    const data = {};

    /*
     * Directional totals.  Here `N_R` means "vehicles travelling northbound, turning right".
     * The "thru" totals (e.g. `N_T`) include bikes from the crossing where vehicles travelling
     * in that direction would enter (e.g. `S_BIKE`).
     */
    CardinalDirection.enumValues.forEach(({
      short: dir,
      opposing: { short: dirOpposing },
    }) => {
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        data[`${dir}_${turn}`] = tmcData[`${dir}_VEHICLE_${turn}`];
      });
      data[`${dir}_T`] += tmcData[`${dirOpposing}_BIKE`];
    });

    /*
     * Copy over bike and other totals, as these are included in the report.
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      data[`${dir}_BIKE`] = tmcData[`${dir}_BIKE`];
      data[`${dir}_OTHER`] = tmcData[`${dir}_OTHER`];
    });

    /*
     * Major street crossings.  This is easily the most complicated computation in this
     * entire report, so it's been documented step-by-step.
     */
    data.MAJOR_CROSSING_PEDS = ArrayStats.sum(
      majorDirections.map(({ short: majorDir }) => tmcData[`${majorDir}_PEDS`]),
    );
    /*
     * Note: Volume of All Crossing Major Street (2B) is defined as:
     * (i) Left Turns From Both Minor Street Approaches
     */
    const crossingTotalStep1 = ArrayStats.sum(
      minorDirections.map(({ short: minorDir }) => data[`${minorDir}_L`]),
    );
    // (ii) The Heaviest Through Volume From The Minor Street
    const crossingTotalStep2 = Math.max(
      ...minorDirections.map(({ short: minorDir }) => data[`${minorDir}_T`]),
    );
    /*
     * (iii) 50% Of The Heavier Left Turn Movement From Major Street When...
     * (a) The Left Turn Volume > 120 vph, and
     * (b) The Left Turn Volume Plus The Opposing (Thru) Volume > 720 vph
     */
    let crossingTotalStep3 = 0;
    const majorLeftMaxDirection = ArrayUtils.getMaxBy(
      majorDirections,
      ({ short: majorDir }) => data[`${majorDir}_L`],
    );
    const majorLeftMax = data[`${majorLeftMaxDirection.short}_L`];
    if (majorLeftMax > ReportIntersectionSummary.THRESHOLD_MAJOR_LEFT_MAX) {
      const opposingDirection = majorLeftMaxDirection.opposing;
      const opposing = data[`${opposingDirection.short}_T`];
      if (majorLeftMax + opposing > ReportIntersectionSummary.THRESHOLD_MAJOR_LEFT_TOTAL) {
        crossingTotalStep3 = 0.5 * majorLeftMax;
      }
    }
    // (iv) Pedestrians Crossing The Major Street
    const crossingTotalStep4 = data.MAJOR_CROSSING_PEDS;
    // ...and now, we add it all up:
    data.MAJOR_CROSSING_TOTAL = crossingTotalStep1
      + crossingTotalStep2
      + crossingTotalStep3
      + crossingTotalStep4;

    /*
     * Major and minor street approaches.  We first compute total directional approaches,
     * then sum those across `majorDirections` and `minorDirections` respectively.
     */
    const approaches = {};
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      approaches[dir] = ArrayStats.sum(
        TurningMovement.enumValues.map(
          ({ short: turn }) => data[`${dir}_${turn}`],
        ),
      );
    });

    data.MAJOR_APPROACHES = ArrayStats.sum(
      majorDirections.map(({ short: majorDir }) => approaches[majorDir]),
    );
    data.MINOR_APPROACHES = ArrayStats.sum(
      minorDirections.map(({ short: minorDir }) => approaches[minorDir]),
    );

    /*
     * Overall total, as sum of major and minor street approaches.
     */
    data.TOTAL = data.MAJOR_APPROACHES + data.MINOR_APPROACHES;

    return data;
  }

  static timeRange(countData, hour) {
    const indexStart = hour * ReportBaseFlow.ROWS_PER_HOUR;
    const { t: start } = countData[indexStart];
    const end = start.plus({
      hours: 1,
    });
    return { start, end };
  }

  static getRoundedTotals(hourlyTotals) {
    if (hourlyTotals.length === 0) {
      let data = ReportBaseFlowDirectional.emptyTmcRecord();
      data = ReportBaseFlowDirectional.computeMovementAndVehicleTotals(data);
      data = ReportIntersectionSummary.computeHourlyTotals(
        data,
        [CardinalDirection.NORTH, CardinalDirection.SOUTH],
        [CardinalDirection.EAST, CardinalDirection.WEST],
      );
      return {
        hourlyTotals: [],
        totals: data,
      };
    }

    const totals = ArrayUtils.sumObjects(hourlyTotals);
    const hourlyTotalsRounded = hourlyTotals.map(
      hourTotals => ObjectUtils.map(
        hourTotals,
        value => Math.round(value),
      ),
    );
    const totalsRounded = ObjectUtils.map(totals, value => Math.round(value));
    return {
      hourlyTotals: hourlyTotalsRounded,
      totals: totalsRounded,
    };
  }

  transformData(study, {
    count,
    countData: rawData,
    intersection,
    segments,
  }) {
    const {
      countData,
      hourlyData,
      hourlyMajorDirections,
      hourlyMinorDirections,
    } = ReportBaseFlowDirectional.getDirectionalStats(study, {
      countData: rawData,
      intersection,
      segments,
    });

    /*
     * In the TMC Summary report, we could compute per-bucket totals and then rollup
     * into AM / PM peak, AM / PM 2-hour, etc. aggregations.
     *
     * Here we can't do that, as the Approaches calculation has a conditional branch
     * on hourly volume.  As such, we have to go the other way: rollup, then compute
     * per-hour totals.
     */
    const hourlyTotals = hourlyData.map(
      (hourData, i) => ReportIntersectionSummary.computeHourlyTotals(
        hourData,
        hourlyMajorDirections[i],
        hourlyMinorDirections[i],
      ),
    );
    const timeRanges = hourlyTotals.map(
      (_, hour) => ReportIntersectionSummary.timeRange(countData, hour),
    );
    const totalsRounded = ReportIntersectionSummary.getRoundedTotals(hourlyTotals);

    const { date, hours } = count;
    const px = ReportCountSummaryTurningMovement.getTrafficSignalId(intersection);
    return {
      date,
      hours,
      px,
      timeRanges,
      ...totalsRounded,
    };
  }

  generateCsv(count, { hourlyTotals, timeRanges }) {
    const dataKeys = Object.keys(hourlyTotals[0]);
    const dataColumns = dataKeys.map(key => ({ key, header: key }));
    const columns = [
      { key: 'start', header: 'Start' },
      { key: 'end', header: 'End' },
      ...dataColumns,
    ];
    const rows = hourlyTotals.map((hourTotals, hour) => {
      const timeRange = timeRanges[hour];
      return {
        ...timeRange,
        ...hourTotals,
      };
    });
    return { columns, rows };
  }

  // PDF GENERATION

  static getTableOptions(reportData) {
    const dirs = ['N', 'E', 'S', 'W'];
    const turns = ['L', 'T', 'R'];
    return {
      tableStyle: { fontSize: 'xs' },
      columnStyles: [
        { c: 0, style: { width: '2xxl' } },
      ],
      header: [
        [
          { value: 'Time Period', rowspan: 3, style: { br: true } },
          { value: 'NORTHBOUND', colspan: 3, style: { br: true } },
          { value: 'EASTBOUND', colspan: 3, style: { br: true } },
          { value: 'SOUTHBOUND', colspan: 3, style: { br: true } },
          { value: 'WESTBOUND', colspan: 3, style: { br: true } },
          {
            value: 'BICYCLES APPROACH', colspan: 4, rowspan: 2, style: { br: true },
          },
          {
            value: 'OTHER', colspan: 4, rowspan: 2, style: { br: true },
          },
          {
            value: 'MAJOR CROSSINGS', colspan: 2, rowspan: 2, style: { br: true },
          },
          {
            value: 'APPROACHES', colspan: 2, rowspan: 2, style: { br: true },
          },
          { value: 'TOTAL', rowspan: 3 },
        ],
        [
          { value: '(SOUTH APPROACH)', colspan: 3, style: { br: true } },
          { value: '(WEST APPROACH)', colspan: 3, style: { br: true } },
          { value: '(NORTH APPROACH)', colspan: 3, style: { br: true } },
          { value: '(EAST APPROACH)', colspan: 3, style: { br: true } },
        ],
        [
          ...Array.prototype.concat.apply([], dirs.map(() => [
            { value: 'Left' },
            { value: 'Thru' },
            { value: 'Right', style: { br: true } },
          ])),
          ...dirs.map(dir => ({ value: dir, style: { br: dir === 'W' } })),
          ...dirs.map(dir => ({ value: dir, style: { br: dir === 'W' } })),
          { value: 'Peds' },
          { value: 'All', style: { br: true } },
          { value: 'Major' },
          { value: 'Minor', style: { br: true } },
        ],
      ],
      body: [
        ...reportData.hourlyTotals.map((hourTotals, hour) => {
          const timeRange = reportData.timeRanges[hour];
          const timeRangeHuman = TimeFormatters.formatRangeTimeOfDay(timeRange);
          const shade = hour % 2 === 1;
          return [
            { value: timeRangeHuman, header: true, style: { br: true, shade } },
            ...Array.prototype.concat.apply([], dirs.map(
              dir => turns.map(turn => ({
                value: hourTotals[`${dir}_${turn}`],
                style: { br: turn === 'R', shade },
              })),
            )),
            ...dirs.map(dir => ({
              value: hourTotals[`${dir}_BIKE`],
              style: { br: dir === 'W', shade },
            })),
            ...dirs.map(dir => ({
              value: hourTotals[`${dir}_OTHER`],
              style: { br: dir === 'W', shade },
            })),
            { value: hourTotals.MAJOR_CROSSING_PEDS, style: { shade } },
            { value: hourTotals.MAJOR_CROSSING_TOTAL, style: { br: true, shade } },
            { value: hourTotals.MAJOR_APPROACHES, style: { shade } },
            { value: hourTotals.MINOR_APPROACHES, style: { br: true, shade } },
            { value: hourTotals.TOTAL, style: { shade } },
          ];
        }),
        [
          { value: '8 Hour Total', header: true, style: { br: true, bt: true } },
          ...Array.prototype.concat.apply([], dirs.map(
            dir => turns.map(turn => ({
              value: reportData.totals[`${dir}_${turn}`],
              style: { br: turn === 'R', bt: true },
            })),
          )),
          ...dirs.map(dir => ({
            value: reportData.totals[`${dir}_BIKE`],
            style: { br: dir === 'W', bt: true },
          })),
          ...dirs.map(dir => ({
            value: reportData.totals[`${dir}_OTHER`],
            style: { br: dir === 'W', bt: true },
          })),
          { value: reportData.totals.MAJOR_CROSSING_PEDS, style: { bt: true } },
          { value: reportData.totals.MAJOR_CROSSING_TOTAL, style: { br: true, bt: true } },
          { value: reportData.totals.MAJOR_APPROACHES, style: { bt: true } },
          { value: reportData.totals.MINOR_APPROACHES, style: { br: true, bt: true } },
          { value: reportData.totals.TOTAL, style: { bt: true } },
        ],
      ],
    };
  }

  static getCountMetadataOptions({
    date,
    hours,
    px,
    totals,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;
    const hourRanges = hours === null ? null : hours.hint;
    const pxStr = px === null ? null : px.toString();
    const {
      MAJOR_APPROACHES,
      MAJOR_CROSSING_TOTAL,
      MINOR_APPROACHES,
      TOTAL,
    } = totals;
    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      {
        cols: 3, name: 'Study Hours', value: hoursStr, tooltip: hourRanges,
      },
      { cols: 6, name: 'Traffic Signal Number', value: pxStr },
      { cols: 3, name: 'Total Approaches', value: TOTAL },
      { cols: 3, name: 'Total Major Approaches', value: MAJOR_APPROACHES },
      { cols: 3, name: 'Total Minor Approaches', value: MINOR_APPROACHES },
      { cols: 3, name: 'Total Major Crossings', value: MAJOR_CROSSING_TOTAL },
    ];
    return { entries };
  }

  generateLayoutContent(count, reportData) {
    if (reportData === null) {
      return [];
    }

    const countMetadataOptions = ReportIntersectionSummary.getCountMetadataOptions(
      reportData,
    );
    const tableOptions = ReportIntersectionSummary.getTableOptions(reportData);
    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

/**
 * See (iii) (a) on the criteria listed at bottom-left on older Intersection Warrant Summary
 * Reports.
 *
 * @type {number}
 */
ReportIntersectionSummary.THRESHOLD_MAJOR_LEFT_MAX = 120;

/**
 * See (iii) (b) on the criteria listed at bottom-left on older Intersection Warrant Summary
 * Reports.
 *
 * @type {number}
 */
ReportIntersectionSummary.THRESHOLD_MAJOR_LEFT_TOTAL = 720;

export default ReportIntersectionSummary;
