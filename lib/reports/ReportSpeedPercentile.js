/* eslint-disable class-methods-use-this */
import { format } from 'd3-format';

import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType, SPEED_CLASSES } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';

const FORMAT_PERCENT = format('.1%');

/**
 * Subclass of {@link ReportBaseFlow} for the Speed Percentile Report, as per the TraxPro
 * reference layouts.
 *
 * @see https://www.notion.so/bditto/Speed-Percentile-Report-Traxpro-3775545a80e34f568df1f082b626f35e
 */
class ReportSpeedPercentile extends ReportBaseFlow {
  type() {
    return ReportType.SPEED_PERCENTILE;
  }

  static getArrayStats(xs) {
    const total = ArrayStats.sum(xs);
    let pct15 = null;
    let pct50 = null;
    let pct85 = null;
    let pct95 = null;
    let mu = null;
    if (total > 0) {
      pct15 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        xs,
        0.15,
      ));
      pct50 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        xs,
        0.5,
      ));
      pct85 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        xs,
        0.85,
      ));
      pct95 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        xs,
        0.95,
      ));
      mu = Math.floor(ArrayStats.histogramMean(
        SPEED_CLASSES,
        xs,
      ));
    }
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
      const h = t.hour;
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

  transformData(parsedId, countData) {
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

  generateCsv(count, { countDataByHour }) {
    const { date: { year, month, day } } = count;

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
      const time = DateTime.fromObject({
        year,
        month,
        day,
        hour,
      });
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

  static getHoursHuman() {
    const hoursHuman = [];
    for (let h = 0; h < 24; h++) {
      const time = h < 10 ? `0${h}:00` : `${h}:00`;
      hoursHuman.push(time);
    }
    return hoursHuman;
  }

  static getRowOptions(reportData, hoursHuman, {
    volume,
    total,
    pct85,
    pct95,
  }, h) {
    const shade = h % 2 === 1;
    return [
      {
        value: hoursHuman[h],
        header: true,
        style: { bt: h === 12, br: true, shade },
      },
      ...volume.map((n, s) => ({
        value: n,
        style: {
          bt: h === 12,
          peak: h === reportData.hoursPeakAm.volume[s]
            || h === reportData.hoursPeakPm.volume[s],
          shade,
        },
      })),
      {
        value: total,
        style: {
          bt: h === 12,
          bl: true,
          peak: h === reportData.hoursPeakAm.total
            || h === reportData.hoursPeakPm.total,
          shade,
        },
      },
      {
        value: pct85 === null ? 'N/A' : pct85,
        style: {
          bt: h === 12,
          bl: true,
          muted: pct85 === null,
          shade,
        },
      },
      {
        value: pct95 === null ? 'N/A' : pct95,
        style: {
          bt: h === 12,
          bl: true,
          muted: pct95 === null,
          shade,
        },
      },
    ];
  }

  static getTableOptions(reportData) {
    const hoursHuman = ReportSpeedPercentile.getHoursHuman();
    return {
      tableStyle: { fontSize: 'xs' },
      columnStyles: SPEED_CLASSES.map((_, i) => ({ c: i + 1 })),
      header: [
        [
          { value: 'Start', style: { br: true } },
          ...SPEED_CLASSES.map(speedClass => ({ value: speedClass[0] + 1 })),
          { value: null, style: { bl: true } },
          { value: '85th', style: { bl: true } },
          { value: '95th', style: { bl: true } },
        ],
        [
          { value: 'Time', style: { bb: true, br: true } },
          ...SPEED_CLASSES.map((speedClass, s) => ({
            value: s === SPEED_CLASSES.length - 1 ? 9999 : speedClass[1],
            style: { bb: true },
          })),
          { value: 'Total', style: { bb: true, bl: true } },
          { value: 'Percent', style: { bb: true, bl: true } },
          { value: 'Percent', style: { bb: true, bl: true } },
        ],
      ],
      body: [
        ...reportData.countDataByHour.map((section, h) => ReportSpeedPercentile.getRowOptions(
          reportData,
          hoursHuman,
          section,
          h,
        )),
        [
          { value: 'Total', header: true, style: { br: true, bt: true } },
          ...reportData.speedClassTotals.map(n => ({
            value: n,
            style: { bt: true },
          })),
          { value: reportData.totalStats.total, style: { bl: true, bt: true } },
          { value: null, colspan: 2, style: { bt: true } },
        ],
        [
          { value: 'Percent', header: true, style: { br: true, bt: true } },
          ...reportData.speedClassPercents.map(pct => ({
            value: FORMAT_PERCENT(pct),
            style: { bt: true },
          })),
          { value: '100.0%', style: { bl: true, bt: true } },
          { value: null, colspan: 2, style: { bt: true } },
        ],
        [
          { value: 'AM Peak', header: true, style: { br: true, bt: true } },
          ...reportData.hoursPeakAm.volume.map(h => ({
            value: h === null ? 'N/A' : hoursHuman[h],
            style: { bt: true, muted: h === null },
          })),
          {
            value: reportData.hoursPeakAm.total === null
              ? 'N/A'
              : hoursHuman[reportData.hoursPeakAm.total],
            style: { bl: true, bt: true, muted: reportData.hoursPeakAm.total === null },
          },
          { value: null, colspan: 2, style: { bt: true } },
        ],
        [
          { value: 'Vol.', header: true, style: { br: true } },
          ...reportData.hoursPeakAm.volume.map((h, s) => ({
            value: h === null
              ? 'N/A'
              : reportData.countDataByHour[h].volume[s],
            style: { muted: h === null },
          })),
          {
            value: reportData.hoursPeakAm.total === null
              ? 'N/A'
              : reportData.countDataByHour[reportData.hoursPeakAm.total].total,
            style: { bl: true, muted: reportData.hoursPeakAm.total === null },
          },
          { value: null, colspan: 2 },
        ],
        [
          { value: 'PM Peak', header: true, style: { br: true, bt: true } },
          ...reportData.hoursPeakPm.volume.map(h => ({
            value: h === null ? 'N/A' : hoursHuman[h],
            style: { bt: true, muted: h === null },
          })),
          {
            value: reportData.hoursPeakPm.total === null
              ? 'N/A'
              : hoursHuman[reportData.hoursPeakPm.total],
            style: { bl: true, bt: true, muted: reportData.hoursPeakPm.total === null },
          },
          { value: null, colspan: 2, style: { bt: true } },
        ],
        [
          { value: 'Vol.', header: true, style: { br: true } },
          ...reportData.hoursPeakPm.volume.map((h, s) => ({
            value: h === null
              ? 'N/A'
              : reportData.countDataByHour[h].volume[s],
            style: { muted: h === null },
          })),
          {
            value: reportData.hoursPeakPm.total === null
              ? 'N/A'
              : reportData.countDataByHour[reportData.hoursPeakPm.total].total,
            style: { bl: true, muted: reportData.hoursPeakPm.total === null },
          },
          { value: null, colspan: 2 },
        ],
      ],
    };
  }

  generateLayoutContent(count, reportData) {
    const countMetadataBlock = ReportBaseFlow.getCountMetadataBlock(count);
    const tableOptions = ReportSpeedPercentile.getTableOptions(reportData);
    return [
      countMetadataBlock,
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

/**
 * @type {number}
 */
ReportSpeedPercentile.HOURS_PER_DAY = 24;

export default ReportSpeedPercentile;
