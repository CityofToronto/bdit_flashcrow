import ArrayUtils from '@/lib/ArrayUtils';
import { ReportType } from '@/lib/Constants';
import { getDirectionCandidatesFrom } from '@/lib/geo/GeometryUtils';
import ArrayStats from '@/lib/math/ArrayStats';
import CentrelineDAO from '@/../lib/db/CentrelineDAO';
import ReportBaseFlow from './ReportBaseFlow';
import ReportCountSummaryTurningMovement from './ReportCountSummaryTurningMovement';

/**
 * Subclass of {@link ReportBaseFlow} for the Intersection Warrant Summary Report.
 *
 * @see https://www.notion.so/bditto/Intersection-Warrant-Summary-Report-6f06d430038c4421b5e727a478af1b34
 */
class ReportIntersectionWarrantSummary extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.INTERSECTION_WARRANT_SUMMARY;
  }

  async fetchRawData(count) {
    const countData = await super.fetchRawData(count);

    /*
     * Determine major and minor directions.  Ideally we would push this heavy lifting to the
     * backend or database layer, but that will take some work.
     */
    const { centrelineId, centrelineType } = count;
    const [intersection, segments] = await Promise.all([
      CentrelineDAO.byIdAndType(centrelineId, centrelineType),
      CentrelineDAO.featuresIncidentTo(centrelineType, centrelineId),
    ]);
    const segmentLineStrings = segments.map(({ geom: { coordinates } }) => coordinates);
    const intersectionPoint = intersection.geom.coordinates;
    const directionCandidates = getDirectionCandidatesFrom(segmentLineStrings, intersectionPoint);
    const minFeatureCodeIndex = ArrayUtils.getMinBy(
      Array.from(directionCandidates.values()),
      i => segments[i].featureCode,
    );
    const minFeatureCode = segments[minFeatureCodeIndex].featureCode;
    const majorDirections = [];
    const minorDirections = [];
    directionCandidates.forEach((i, direction) => {
      if (segments[i].featureCode === minFeatureCode) {
        majorDirections.push(direction);
      } else {
        minorDirections.push(direction);
      }
    });
    return {
      countData,
      majorDirections,
      minorDirections,
    };
  }

  static sumHourly(countData) {
    const n = countData.length;
    const hourlyData = [];
    for (let i = 0; i < n; i += ReportBaseFlow.ROWS_PER_HOUR) {
      const hourRows = countData.slice(i, i + ReportBaseFlow.ROWS_PER_HOUR);
      const rawHourData = hourRows.map(({ data }) => data);
      const hourData = ArrayUtils.sumObjects(rawHourData);
      hourlyData.push(hourData);
    }
    return hourlyData;
  }

  static computeHourlyTotals(rawData, majorDirections, minorDirections) {
    const tmcData = ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals(rawData);

    const data = {};

    /*
     * Directional totals.  Here `N_R` means "vehicles travelling northbound, turning right".
     * The "thru" totals (e.g. `N_T`) include bikes.
     *
     * Note that `tmcData` understands directions a bit differently: `tmcData.N_VEHICLE_R`,
     * for instance, is "vehicles entering via the northbound leg, turning right" - these
     * vehicles would be travelling *southbound*, and would show up in `S_R` below.
     */
    data.N_R = tmcData.S_VEHICLE_R;
    data.N_T = tmcData.S_VEHICLE_T + tmcData.S_BIKE;
    data.N_L = tmcData.S_VEHICLE_L;

    data.E_R = tmcData.W_VEHICLE_R;
    data.E_T = tmcData.W_VEHICLE_T + tmcData.W_BIKE;
    data.E_L = tmcData.W_VEHICLE_L;

    data.S_R = tmcData.N_VEHICLE_R;
    data.S_T = tmcData.N_VEHICLE_T + tmcData.N_BIKE;
    data.S_L = tmcData.N_VEHICLE_L;

    data.W_R = tmcData.E_VEHICLE_R;
    data.W_T = tmcData.E_VEHICLE_T + tmcData.E_BIKE;
    data.W_L = tmcData.E_VEHICLE_L;

    /*
     * Copy over bike and other totals, as these are included in the report.
     */
    data.N_BIKE = tmcData.N_BIKE;
    data.E_BIKE = tmcData.E_BIKE;
    data.S_BIKE = tmcData.S_BIKE;
    data.W_BIKE = tmcData.W_BIKE;

    data.N_OTHER = tmcData.N_OTHER;
    data.E_OTHER = tmcData.E_OTHER;
    data.S_OTHER = tmcData.S_OTHER;
    data.W_OTHER = tmcData.W_OTHER;

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
     * (b) The Left Turn Volume Plus The Opposing Volume > 720 vph
     */
    let crossingTotalStep3 = 0;
    const majorLeftMovements = majorDirections.map(
      ({ short: majorDir }) => data[`${majorDir}_L`],
    );
    const majorLeftTotal = ArrayStats.sum(majorLeftMovements);
    const majorLeftMax = Math.max(...majorLeftMovements);
    if (majorLeftMax > ReportIntersectionWarrantSummary.THRESHOLD_MAJOR_LEFT_MAX
        && majorLeftTotal > ReportIntersectionWarrantSummary.THRESHOLD_MAJOR_LEFT_TOTAL) {
      crossingTotalStep3 = 0.5 * majorLeftMax;
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
    const approaches = {
      N: data.N_R + data.N_T + data.N_L,
      E: data.E_R + data.E_T + data.E_L,
      S: data.S_R + data.S_T + data.S_L,
      W: data.W_R + data.W_T + data.W_L,
    };


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
    const hourlyData = ReportIntersectionWarrantSummary.sumHourly(countData);
    const hourlyTotals = hourlyData.map(
      hourData => ReportIntersectionWarrantSummary.computeHourlyTotals(
        hourData,
        majorDirections,
        minorDirections,
      ),
    );
    const timeRanges = hourlyTotals.map(
      (_, hour) => ReportIntersectionWarrantSummary.timeRange(countData, hour),
    );
    const totals = ArrayUtils.sumObjects(hourlyTotals);
    return {
      hourlyTotals,
      timeRanges,
      totals,
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
ReportIntersectionWarrantSummary.THRESHOLD_MAJOR_LEFT_MAX = 120;

/**
 * See (iii) (b) on the criteria listed at bottom-left on older Intersection Warrant Summary
 * Reports.
 *
 * @type {number}
 */
ReportIntersectionWarrantSummary.THRESHOLD_MAJOR_LEFT_TOTAL = 720;

export default ReportIntersectionWarrantSummary;
