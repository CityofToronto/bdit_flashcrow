import ArrayUtils from '@/lib/ArrayUtils';
import { ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';

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

  transformData(parsedId, countData) {
    const totaledData = ReportBaseFlowDirectional.computeAllMovementAndVehicleTotals(
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
