import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  ReportType,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
} from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

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
    const data = {};

    /*
     * Swap directions from `rawData`.
     *
     * Note that `rawData` understands directions a bit differently: `rawData.N_CARS_R`,
     * for instance, is "cars entering via the northbound leg, turning right" - these
     * vehicles would be travelling *southbound*, and would show up in `S_CARS_R` below.
     */
    CardinalDirection.enumValues.forEach(({
      short: dir,
      opposing: { short: dirOpposing },
    }) => {
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        TMC_MODES_VEHICLE.forEach((mode) => {
          data[`${dir}_${mode}_${turn}`] = rawData[`${dirOpposing}_${mode}_${turn}`];
        });
      });
      TMC_MODES_NON_VEHICLE.forEach((mode) => {
        data[`${dir}_${mode}`] = rawData[`${dir}_${mode}`];
      });
    });

    /*
     * Directional totals, by type of vehicle.
     *
     * After swapping directions `N_CARS_R` means "cars travelling northbound,
     * turning right", i.e. cars that enter the intersection from the south,
     * turn right, and exit the intersection at east travelling eastbound.
     *
     * `N_CARS_TOTAL`, then, means "cars travelling northbound" - this is the sum
     * of the three possible turning movements (Right, Thru, Left).
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      TMC_MODES_VEHICLE.forEach((mode) => {
        data[`${dir}_${mode}_TOTAL`] = ArrayStats.sum(
          TurningMovement.enumValues.map(
            ({ short: turn }) => data[`${dir}_${mode}_${turn}`],
          ),
        );
      });
    });

    /*
     * Directional exits, by type of vehicle.  Here `N_TRUCK_EXITS` means "trucks exiting
     * northbound".  Each directional exit is the sum of three turning movements from the
     * other three legs.
     *
     * It is generally assumed that all vehicles entering the intersection then proceed to
     * exit the intersection.  As such, the sum of directional exits should equal the sum
     * of directional totals.
     */
    TMC_MODES_VEHICLE.forEach((mode) => {
      data[`N_${mode}_EXITS`] = data[`W_${mode}_R`] + data[`N_${mode}_T`] + data[`E_${mode}_L`];
      data[`E_${mode}_EXITS`] = data[`N_${mode}_R`] + data[`E_${mode}_T`] + data[`S_${mode}_L`];
      data[`S_${mode}_EXITS`] = data[`E_${mode}_R`] + data[`S_${mode}_T`] + data[`W_${mode}_L`];
      data[`W_${mode}_EXITS`] = data[`S_${mode}_R`] + data[`W_${mode}_T`] + data[`N_${mode}_L`];
    });

    /*
     * Turning movement totals, all vehicles combined.  `N_VEHICLE_R` means "vehicles entering
     * via the northbound leg, turning right", and is the sum of vehicle-type-specific counts
     * (i.e. cars, trucks, busses).
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        data[`${dir}_VEHICLE_${turn}`] = ArrayStats.sum(
          TMC_MODES_VEHICLE.map(
            mode => data[`${dir}_${mode}_${turn}`],
          ),
        );
      });
    });

    /*
     * Directional exit totals, all vehicles combined.  `N_VEHICLE_EXITS` means "vehicles exiting
     * via the northbound leg", and is the sum of vehicle-type-specific exits (i.e. cars, trucks,
     * busses).
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      data[`${dir}_VEHICLE_EXITS`] = ArrayStats.sum(
        TMC_MODES_VEHICLE.map(
          mode => data[`${dir}_${mode}_EXITS`],
        ),
      );
    });

    /*
     * Directional totals, all vehicles combined.  `N_VEHICLE_TOTAL` means "vehicles entering
     * via the northbound leg", and is the sum of vehicle-type-specific directional totals.
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      data[`${dir}_VEHICLE_TOTAL`] = ArrayStats.sum(
        TMC_MODES_VEHICLE.map(
          mode => data[`${dir}_${mode}_TOTAL`],
        ),
      );
    });

    /*
     * Modal totals, including peds / bikes.  `VEHICLE_TOTAL` means "total number of vehicles
     * entering via any leg".
     *
     * For peds, bikes, and other, we do not have turning movement or other direction-of-travel
     * information.  `N_PEDS` means "pedestrians crossing the northbound leg in either direction".
     *
     * It is unclear how a cyclist turning in lane would be counted.
     */
    data.VEHICLE_TOTAL = ArrayStats.sum(
      CardinalDirection.enumValues.map(
        ({ short: dir }) => data[`${dir}_VEHICLE_TOTAL`],
      ),
    );
    TMC_MODES_NON_VEHICLE.forEach((mode) => {
      data[`${mode}_TOTAL`] = ArrayStats.sum(
        CardinalDirection.enumValues.map(
          ({ short: dir }) => data[`${dir}_${mode}`],
        ),
      );
    });

    /*
     * Overall total.
     */
    data.TOTAL = data.VEHICLE_TOTAL + ArrayStats.sum(
      TMC_MODES_NON_VEHICLE.map(
        mode => data[`${mode}_TOTAL`],
      ),
    );

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
      debugger;
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
