/* eslint-disable class-methods-use-this */
import { format } from 'd3-format';

import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  ReportBlock,
  ReportType,
  SPEED_CLASSES,
} from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

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

  static transformCountData(countData) {
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

  transformData(study, { arteries, counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }

    const countTuples = counts.map((count) => {
      const { arteryCode, id } = count;
      const artery = arteries.get(arteryCode);
      const countData = studyData.get(id);
      return { artery, count, countData };
    });

    const reportData = [];

    let numDirections = 0;
    CardinalDirection.enumValues.forEach((direction) => {
      const groupCounts = countTuples.filter(({ artery }) => artery.approachDir === direction);
      if (groupCounts.length > 0) {
        numDirections += 1;
      }
      groupCounts.forEach(({ count, countData }) => {
        const { date } = count;
        const stats = ReportSpeedPercentile.transformCountData(countData);
        reportData.push({ date, direction, stats });
      });
    });

    if (numDirections > 1) {
      for (let date = study.startDate; date <= study.endDate; date = date.plus({ days: 1 })) {
        const groupCounts = countTuples.filter(({ count }) => count.date.equals(date));
        const groupCountData = Array.prototype.concat.apply(
          [],
          groupCounts.map(({ countData }) => countData),
        );
        const stats = ReportSpeedPercentile.transformCountData(groupCountData);
        reportData.push({ date, direction: null, stats });
      }
    }

    return reportData;
  }

  generateCsv(count, reportData) {
    const speedClassColumns = SPEED_CLASSES.map(([lo, hi]) => {
      const key = `speed_${lo}_${hi}`;
      const header = `${lo + 1}-${hi} kph`;
      return { key, header };
    });

    const rows = [];
    reportData.forEach(({ date, direction, stats }) => {
      const { year, month, day } = date;
      const { countDataByHour } = stats;
      countDataByHour.forEach(({
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
          direction,
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
        rows.push(fields);
      });
    });

    const columns = [
      { key: 'time', header: 'Time' },
      { key: 'direction', header: 'Direction' },
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
      const hStr = h < 10 ? `0${h}:00` : `${h}:00`;
      hoursHuman.push(hStr);
    }
    return hoursHuman;
  }

  static getRowOptions(reportData, date, hoursHuman, {
    volume,
    total,
    pct85,
    pct95,
  }, h) {
    const dateStr = TimeFormatters.formatDefault(date);
    const hourHuman = h === 0 ? dateStr : hoursHuman[h];
    const shade = h % 2 === 1;
    return [
      {
        value: hourHuman,
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

  static getCountMetadataOptions({ date, direction, stats }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const directionStr = direction === null ? 'All Directions' : direction.bound;
    const { totalStats } = stats;
    return {
      entries: [
        { cols: 3, name: 'Date', value: fullDateStr },
        { cols: 3, name: 'Direction', value: directionStr },
        { cols: 3, name: 'Total Vehicles', value: totalStats.total },
        { cols: 3, name: 'Mean Speed', value: totalStats.mu },
        { cols: 3, name: '15th Percentile', value: totalStats.pct15 },
        { cols: 3, name: '50th Percentile', value: totalStats.pct50 },
        { cols: 3, name: '85th Percentile', value: totalStats.pct85 },
        { cols: 3, name: '95th Percentile', value: totalStats.pct95 },
        // { cols: 6, name: 'Notes', value: notes },
      ],
    };
  }

  static getTableOptions({ date, stats: reportData }) {
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
          date,
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
    const layout = [];
    reportData.forEach((reportBlock) => {
      const countMetadataOptions = ReportSpeedPercentile.getCountMetadataOptions(reportBlock);
      const tableOptions = ReportSpeedPercentile.getTableOptions(reportBlock);
      layout.push({ type: ReportBlock.METADATA, options: countMetadataOptions });
      layout.push({ type: ReportBlock.TABLE, options: tableOptions });
    });
    return layout;
  }
}

/**
 * @type {number}
 */
ReportSpeedPercentile.HOURS_PER_DAY = 24;

export default ReportSpeedPercentile;
