import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  ReportType,
  TurningMovement,
} from '@/lib/Constants';
import ObjectUtils from '@/lib/ObjectUtils';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';

/**
 * Subclass of {@link ReportBaseFlow} for the Intersection Summary Report.
 *
 * @see https://www.notion.so/bditto/Intersection-Summary-Report-6f06d430038c4421b5e727a478af1b34
 */
class ReportIntersectionSummary extends ReportBaseFlowDirectional {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.INTERSECTION_SUMMARY;
  }

  static computeHourlyTotals(rawData, majorDirections, minorDirections) {
    const tmcData = ReportBaseFlowDirectional.computeMovementAndVehicleTotals(rawData);

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
    let { t: start } = countData[indexStart];
    start = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      start.getHours(),
      start.getMinutes() - ReportBaseFlow.MINUTES_PER_ROW,
      start.getSeconds(),
    );
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      start.getHours() + 1,
      start.getMinutes(),
      start.getSeconds(),
    );
    return { start, end };
  }

  transformData({ countData, majorDirections, minorDirections }) {
    /*
     * In the TMC Summary report, we could compute per-bucket totals and then rollup
     * into AM / PM peak, AM / PM 2-hour, etc. aggregations.
     *
     * Here we can't do that, as the Approaches calculation has a conditional branch
     * on hourly volume.  As such, we have to go the other way: rollup, then compute
     * per-hour totals.
     */
    const hourlyData = ReportBaseFlowDirectional.sumHourly(countData);
    const hourlyTotals = hourlyData.map(
      hourData => ReportIntersectionSummary.computeHourlyTotals(
        hourData,
        majorDirections,
        minorDirections,
      ),
    );
    const timeRanges = hourlyTotals.map(
      (_, hour) => ReportIntersectionSummary.timeRange(countData, hour),
    );
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
      timeRanges,
      totals: totalsRounded,
    };
  }

  generateCsvLayout(count, { hourlyTotals, timeRanges }) {
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

  generatePdfLayout(count /* , transformedData */) {
    const metadata = this.getPdfMetadata(count);
    // TODO: content modules
    return {
      layout: 'portrait',
      metadata,
      content: [
        // TODO: content modules
      ],
    };
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
