import ArrayUtils from '@/lib/ArrayUtils';
import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from './ReportBaseFlow';

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

  static computeMovementAndVehicleTotals(rawData) {
    const data = Object.assign({}, rawData);

    /*
     * Directional totals, by type of vehicle.  Here `N_CARS_R` means "cars entering via the
     * northbound leg, turning right", i.e. cars travelling southbound that then enter the
     * intersection from the north, turn right, and exit the intersection at west travelling
     * westbound.
     *
     * `N_CARS_TOTAL`, then, means "cars entering via the northbound leg" - this is the sum
     * of the three possible turning movements (Right, Thru, Left).
     */
    data.N_CARS_TOTAL = data.N_CARS_R + data.N_CARS_T + data.N_CARS_L;
    data.E_CARS_TOTAL = data.E_CARS_R + data.E_CARS_T + data.E_CARS_L;
    data.S_CARS_TOTAL = data.S_CARS_R + data.S_CARS_T + data.S_CARS_L;
    data.W_CARS_TOTAL = data.W_CARS_R + data.W_CARS_T + data.W_CARS_L;

    data.N_TRUCK_TOTAL = data.N_TRUCK_R + data.N_TRUCK_T + data.N_TRUCK_L;
    data.E_TRUCK_TOTAL = data.E_TRUCK_R + data.E_TRUCK_T + data.E_TRUCK_L;
    data.S_TRUCK_TOTAL = data.S_TRUCK_R + data.S_TRUCK_T + data.S_TRUCK_L;
    data.W_TRUCK_TOTAL = data.W_TRUCK_R + data.W_TRUCK_T + data.W_TRUCK_L;

    data.N_BUS_TOTAL = data.N_BUS_R + data.N_BUS_T + data.N_BUS_L;
    data.E_BUS_TOTAL = data.E_BUS_R + data.E_BUS_T + data.E_BUS_L;
    data.S_BUS_TOTAL = data.S_BUS_R + data.S_BUS_T + data.S_BUS_L;
    data.W_BUS_TOTAL = data.W_BUS_R + data.W_BUS_T + data.W_BUS_L;

    /*
     * Directional exits, by type of vehicle.  Here `N_TRUCK_EXITS` means "trucks exiting
     * via the northbound leg".  Each directional exit is the sum of three turning
     * movements from the other three legs.
     *
     * It is generally assumed that all vehicles entering the intersection then proceed to
     * exit the intersection.  As such, the sum of directional exits should equal the sum
     * of directional totals.
     */
    data.N_CARS_EXITS = data.E_CARS_R + data.S_CARS_T + data.W_CARS_L;
    data.E_CARS_EXITS = data.S_CARS_R + data.W_CARS_T + data.N_CARS_L;
    data.S_CARS_EXITS = data.W_CARS_R + data.N_CARS_T + data.E_CARS_L;
    data.W_CARS_EXITS = data.N_CARS_R + data.E_CARS_T + data.S_CARS_L;

    data.N_TRUCK_EXITS = data.E_TRUCK_R + data.S_TRUCK_T + data.W_TRUCK_L;
    data.E_TRUCK_EXITS = data.S_TRUCK_R + data.W_TRUCK_T + data.N_TRUCK_L;
    data.S_TRUCK_EXITS = data.W_TRUCK_R + data.N_TRUCK_T + data.E_TRUCK_L;
    data.W_TRUCK_EXITS = data.N_TRUCK_R + data.E_TRUCK_T + data.S_TRUCK_L;

    data.N_BUS_EXITS = data.E_BUS_R + data.S_BUS_T + data.W_BUS_L;
    data.E_BUS_EXITS = data.S_BUS_R + data.W_BUS_T + data.N_BUS_L;
    data.S_BUS_EXITS = data.W_BUS_R + data.N_BUS_T + data.E_BUS_L;
    data.W_BUS_EXITS = data.N_BUS_R + data.E_BUS_T + data.S_BUS_L;

    /*
     * Turning movement totals, all vehicles combined.  `N_VEHICLE_R` means "vehicles entering
     * via the northbound leg, turning right", and is the sum of vehicle-type-specific counts
     * (i.e. cars, trucks, busses).
     */
    data.N_VEHICLE_R = data.N_CARS_R + data.N_TRUCK_R + data.N_BUS_R;
    data.E_VEHICLE_R = data.E_CARS_R + data.E_TRUCK_R + data.E_BUS_R;
    data.S_VEHICLE_R = data.S_CARS_R + data.S_TRUCK_R + data.S_BUS_R;
    data.W_VEHICLE_R = data.W_CARS_R + data.W_TRUCK_R + data.W_BUS_R;

    data.N_VEHICLE_T = data.N_CARS_T + data.N_TRUCK_T + data.N_BUS_T;
    data.E_VEHICLE_T = data.E_CARS_T + data.E_TRUCK_T + data.E_BUS_T;
    data.S_VEHICLE_T = data.S_CARS_T + data.S_TRUCK_T + data.S_BUS_T;
    data.W_VEHICLE_T = data.W_CARS_T + data.W_TRUCK_T + data.W_BUS_T;

    data.N_VEHICLE_L = data.N_CARS_L + data.N_TRUCK_L + data.N_BUS_L;
    data.E_VEHICLE_L = data.E_CARS_L + data.E_TRUCK_L + data.E_BUS_L;
    data.S_VEHICLE_L = data.S_CARS_L + data.S_TRUCK_L + data.S_BUS_L;
    data.W_VEHICLE_L = data.W_CARS_L + data.W_TRUCK_L + data.W_BUS_L;

    /*
     * Directional exit totals, all vehicles combined.  `N_VEHICLE_EXITS` means "vehicles exiting
     * via the northbound leg", and is the sum of vehicle-type-specific exits (i.e. cars, trucks,
     * busses).
     */
    data.N_VEHICLE_EXITS = data.N_CARS_EXITS + data.N_TRUCK_EXITS + data.N_BUS_EXITS;
    data.E_VEHICLE_EXITS = data.E_CARS_EXITS + data.E_TRUCK_EXITS + data.E_BUS_EXITS;
    data.S_VEHICLE_EXITS = data.S_CARS_EXITS + data.S_TRUCK_EXITS + data.S_BUS_EXITS;
    data.W_VEHICLE_EXITS = data.W_CARS_EXITS + data.W_TRUCK_EXITS + data.W_BUS_EXITS;

    /*
     * Directional totals, all vehicles combined.  `N_VEHICLE_TOTAL` means "vehicles entering
     * via the northbound leg", and is the sum of vehicle-type-specific directional totals.
     */
    data.N_VEHICLE_TOTAL = data.N_CARS_TOTAL + data.N_TRUCK_TOTAL + data.N_BUS_TOTAL;
    data.E_VEHICLE_TOTAL = data.E_CARS_TOTAL + data.E_TRUCK_TOTAL + data.E_BUS_TOTAL;
    data.S_VEHICLE_TOTAL = data.S_CARS_TOTAL + data.S_TRUCK_TOTAL + data.S_BUS_TOTAL;
    data.W_VEHICLE_TOTAL = data.W_CARS_TOTAL + data.W_TRUCK_TOTAL + data.W_BUS_TOTAL;

    /*
     * Modal totals, including peds / bikes.  `VEHICLE_TOTAL` means "total number of vehicles
     * entering via any leg".
     *
     * For peds, bikes, and other, we do not have turning movement or other direction-of-travel
     * information.  `N_PEDS` means "pedestrians crossing the northbound leg in either direction".
     *
     * It is unclear how a cyclist turning in lane would be counted.
     */
    data.VEHICLE_TOTAL = data.N_VEHICLE_TOTAL
      + data.E_VEHICLE_TOTAL
      + data.S_VEHICLE_TOTAL
      + data.W_VEHICLE_TOTAL;
    data.PEDS_TOTAL = data.N_PEDS + data.E_PEDS + data.S_PEDS + data.W_PEDS;
    data.BIKE_TOTAL = data.N_BIKE + data.E_BIKE + data.S_BIKE + data.W_BIKE;
    data.OTHER_TOTAL = data.N_OTHER + data.E_OTHER + data.S_OTHER + data.W_OTHER;

    /*
     * Overall total.
     *
     * TODO: do we also need a vehicles + bikes total?
     */
    data.TOTAL = data.VEHICLE_TOTAL + data.PEDS_TOTAL + data.BIKE_TOTAL + data.OTHER_TOTAL;

    return data;
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

  static computeAllMovementAndVehicleTotals(countData) {
    return countData.map(({
      id,
      countId,
      t,
      data: rawData,
    }) => {
      const data = ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals(rawData);
      return {
        id,
        countId,
        t,
        data,
      };
    });
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

  transformData(countData) {
    const totaledData = ReportCountSummaryTurningMovement.computeAllMovementAndVehicleTotals(
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

  generateCsvLayout(count, {
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
