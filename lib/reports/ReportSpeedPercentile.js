import ArrayUtils from '@/lib/ArrayUtils';
import { ReportType, SPEED_CLASSES } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/../lib/reports/ReportBaseFlow';

/**
 * Subclass of {@link ReportBaseFlow} for the Speed Percentile Report, as per the TraxPro
 * reference layouts.
 *
 * @see https://www.notion.so/bditto/Speed-Percentile-Report-Traxpro-3775545a80e34f568df1f082b626f35e
 */
class ReportSpeedPercentile extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.SPEED_PERCENTILE;
  }

  static getArrayStats(xs) {
    const total = ArrayStats.sum(xs);
    if (total === 0) {
      return { total };
    }
    const pct15 = Math.floor(ArrayStats.histogramPercentile(
      SPEED_CLASSES,
      xs,
      0.15,
    ));
    const pct50 = Math.floor(ArrayStats.histogramPercentile(
      SPEED_CLASSES,
      xs,
      0.5,
    ));
    const pct85 = Math.floor(ArrayStats.histogramPercentile(
      SPEED_CLASSES,
      xs,
      0.85,
    ));
    const pct95 = Math.floor(ArrayStats.histogramPercentile(
      SPEED_CLASSES,
      xs,
      0.95,
    ));
    const mu = Math.floor(ArrayStats.histogramMean(
      SPEED_CLASSES,
      xs,
    ));
    return {
      total,
      pct15,
      pct50,
      pct85,
      pct95,
      mu,
    };
  }

  static getCountDataByHour(countData) {
    const countDataByHour = [];
    for (let h = 0; h < ReportSpeedPercentile.HOURS_PER_DAY; h++) {
      const volume = new Array(SPEED_CLASSES.length).fill(0);
      countDataByHour.push(volume);
    }
    countData.forEach(({ t, data: { COUNT, SPEED_CLASS: s } }) => {
      if (s <= 0 || s > SPEED_CLASSES.length) {
        /*
         * In our full dataset, we have some rows with `"SPEED_CLASS" = 0`.  For now, we
         * ignore out-of-bounds rows to prevent invalid access on `countDataByHour`.
         *
         * TODO: log these rows
         */
        return;
      }
      const h = t.getHours();
      countDataByHour[h][s - 1] += COUNT;
    });
    return countDataByHour.map((volume) => {
      const stats = ReportSpeedPercentile.getArrayStats(volume);
      return {
        volume,
        ...stats,
      };
    });
  }

  static getHoursPeak(countDataByHour, lo, hi) {
    const countDataByHourSlice = countDataByHour.slice(lo, hi);
    const volume = SPEED_CLASSES.map((_, s) => {
      let h = ArrayUtils.getMaxIndexBy(
        countDataByHourSlice,
        ({ volume: v }) => v[s],
      );
      h += lo;
      if (countDataByHour[h].volume[s] === 0) {
        /*
         * In the report, we don't show a peak hour for speed classes that have no
         * traffic.  Since all counts are non-negative, this condition implies there
         * is no traffic for this speed class.
         */
        return null;
      }
      return h;
    });
    let total = ArrayUtils.getMaxIndexBy(
      countDataByHourSlice,
      ({ total: t }) => t,
    );
    total += lo;
    if (countDataByHour[total].total === 0) {
      /*
       * In the report, we don't show a peak hour for total volume if there is no traffic.
       * Since all counts are non-negative, this condition implies there is no traffic.
       */
      total = null;
    }
    return { volume, total };
  }

  static getHoursPeakAm(countDataByHour) {
    return ReportSpeedPercentile.getHoursPeak(
      countDataByHour,
      0,
      ReportSpeedPercentile.HOURS_PER_DAY / 2,
    );
  }

  static getHoursPeakPm(countDataByHour) {
    return ReportSpeedPercentile.getHoursPeak(
      countDataByHour,
      ReportSpeedPercentile.HOURS_PER_DAY / 2,
      ReportSpeedPercentile.HOURS_PER_DAY,
    );
  }

  static getSpeedClassPercents(speedClassTotals, total) {
    return speedClassTotals
      .map(speedClassTotal => speedClassTotal / total);
  }

  static getSpeedClassTotals(countDataByHour) {
    return SPEED_CLASSES.map((_, s) => {
      const speedClassVolumes = countDataByHour
        .map(({ volume }) => volume[s]);
      return ArrayStats.sum(speedClassVolumes);
    });
  }

  static getTotalStats(speedClassTotals) {
    return ReportSpeedPercentile.getArrayStats(speedClassTotals);
  }

  transformData(countData) {
    const countDataByHour = ReportSpeedPercentile.getCountDataByHour(countData);
    const hoursPeakAm = ReportSpeedPercentile.getHoursPeakAm(countDataByHour);
    const hoursPeakPm = ReportSpeedPercentile.getHoursPeakPm(countDataByHour);
    const speedClassTotals = ReportSpeedPercentile.getSpeedClassTotals(countDataByHour);
    const totalStats = ReportSpeedPercentile.getTotalStats(speedClassTotals);
    const { total } = totalStats;
    const speedClassPercents = ReportSpeedPercentile.getSpeedClassPercents(
      speedClassTotals,
      total,
    );

    return {
      countDataByHour,
      hoursPeakAm,
      hoursPeakPm,
      speedClassPercents,
      speedClassTotals,
      totalStats,
    };
  }

  generateCsvLayout(count, { countDataByHour }) {
    const { date: countDate } = count;
    const year = countDate.getFullYear();
    const month = countDate.getMonth();
    const date = countDate.getDate();

    const speedClassColumns = SPEED_CLASSES.map(([lo, hi]) => {
      const key = `speed_${lo}_${hi}`;
      const header = `${lo + 1}-${hi} kph`;
      return { key, header };
    });

    const rows = countDataByHour.map(({
      volume,
      total,
      pct15,
      pct50,
      pct85,
      pct95,
      mu,
    }, hour) => {
      const time = new Date(year, month, date, hour);
      const fields = {
        time,
        count: total,
        pct15,
        pct50,
        pct85,
        pct95,
        mu,
      };
      speedClassColumns.forEach(({ key }, s) => {
        fields[key] = volume[s];
      });
      return fields;
    });
    const columns = [
      { key: 'time', header: 'Time' },
      ...speedClassColumns,
      { key: 'count', header: 'Count' },
      { key: 'pct15', header: 'p15' },
      { key: 'pct50', header: 'p50' },
      { key: 'pct85', header: 'p85' },
      { key: 'pct95', header: 'p95' },
      { key: 'mu', header: 'Mean' },
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

/**
 * @type {number}
 */
ReportSpeedPercentile.HOURS_PER_DAY = 24;

export default ReportSpeedPercentile;
