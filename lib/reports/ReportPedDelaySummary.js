/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { Enum } from '@/lib/ClassUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import TimeFormatters from '@/lib/time/TimeFormatters';

class PedClass extends Enum {}
PedClass.init({
  ASSISTED_CHILDREN: {
    description: 'Assisted Children',
    factor: 2,
    short: 'ac',
  },
  UNASSISTED_CHILDREN: {
    description: 'Unassisted Children',
    factor: 2,
    short: 'uc',
  },
  YOUTH_ADULTS: {
    description: 'Youth and Adults',
    factor: 2,
    short: 'ya',
  },
  SENIOR_CITIZENS: {
    description: 'Senior Citizens',
    factor: 2,
    short: 'sc',
  },
  PERSONS_WITH_DISABILITIES: {
    description: 'Persons with Disabilities',
    factor: 2,
    short: 'pwd',
  },
});

class PedDelay extends Enum {}
PedDelay.init({
  NOT_DELAYED: {
    description: '<=10sec',
    short: 'nd',
  },
  DELAYED: {
    description: '>10sec',
    short: 'd',
  },
});

/**
 * Subclass of {@link ReportBaseFlow} for the Pedestrian Delay Summary Report.
 *
 * @see https://www.notion.so/bditto/Feature-Ped-Delays-781abf0b60c446b4a41e14d5e072dda9
 * @see https://www.figma.com/file/j4jDx0GDT5OZ3udmOVHZmO/(DC)-Ped-Delay-Summary-Report
 */
class ReportPedDelaySummary extends ReportBaseFlow {
  type() {
    return ReportType.PED_DELAY_SUMMARY;
  }

  static computePedDelayTotals(rawData) {
    const data = {
      crossings: rawData.crossings,
      total: 0,
      total_f: 0,
    };
    PedDelay.enumValues.forEach((pedDelay) => {
      const keyDelay = pedDelay.short;
      data[keyDelay] = 0;

      const keyDelayFactored = `${keyDelay}_f`;
      data[keyDelayFactored] = 0;
    });
    PedClass.enumValues.forEach((pedClass) => {
      PedDelay.enumValues.forEach((pedDelay) => {
        const key = `${pedClass.short}_${pedDelay.short}`;
        const value = rawData[key];
        data[key] = value;

        const keyFactored = `${key}_f`;
        const valueFactored = value * pedClass.factor;
        data[keyFactored] = valueFactored;

        const keyDelay = pedDelay.short;
        data[keyDelay] += value;

        const keyDelayFactored = `${keyDelay}_f`;
        data[keyDelayFactored] += valueFactored;

        data.total += value;
        data.total_f += valueFactored;
      });
    });
    return data;
  }

  static computeAllPedDelayTotals(zoneData) {
    return zoneData.map(({ t, data: rawData }) => {
      const data = ReportPedDelaySummary.computePedDelayTotals(rawData);
      return { t, data };
    });
  }

  static computePercentSafe(a, b) {
    if (b === 0) {
      return 0;
    }
    return 100 * a / b;
  }

  static transformCountData(countData) {
    const countDataByZone = ArrayUtils.groupBySorted(countData, ({ data: { zone } }) => zone);
    const zones = countDataByZone.map((zoneData) => {
      const label = zoneData[0].data.zone;
      const rows = ReportPedDelaySummary.computeAllPedDelayTotals(zoneData);
      const totals = ArrayUtils.sumObjects(rows.map(row => row.data));
      return { label, rows, totals };
    });
    const totals = ArrayUtils.sumObjects(zones.map(zone => zone.totals));

    /*
     * After computing actual and factored totals, we then calculate the share of
     * non-delayed vs. delayed pedestrians.
     */
    zones.forEach((zone) => {
      const { totals: zoneTotals } = zone;
      zoneTotals.nd_f_pct = ReportPedDelaySummary.computePercentSafe(
        zoneTotals.nd_f,
        zoneTotals.total_f,
      );
      zoneTotals.d_f_pct = ReportPedDelaySummary.computePercentSafe(
        zoneTotals.d_f,
        zoneTotals.total_f,
      );
    });
    totals.nd_f_pct = ReportPedDelaySummary.computePercentSafe(
      totals.nd_f,
      totals.total_f,
    );
    totals.d_f_pct = ReportPedDelaySummary.computePercentSafe(
      totals.d_f,
      totals.total_f,
    );

    /*
     * Finally, we compute per-time-bucket totals, assuming that all zones have the same time
     * buckets for data collection.
     */
    const n = zones[0].rows.length;
    const byTime = new Array(n).fill(0);
    zones.forEach(({ rows }) => {
      rows.slice(0, n).forEach(({ data }, i) => {
        byTime[i] += data.total;
      });
    });

    return { byTime, totals, zones };
  }

  transformData(study, { counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }
    const [count] = counts;
    const {
      date,
      extraMetadata: { weather },
      hours,
      id,
    } = count;
    const countData = studyData.get(id);
    const stats = ReportPedDelaySummary.transformCountData(countData);

    return {
      date,
      hours,
      stats,
      weather,
    };
  }

  // CSV GENERATION

  static generateCsvZoneRow(zone, row) {
    const { label } = zone;
    const { t, data } = row;
    return {
      zone: label,
      start: t,
      end: t.plus({ minutes: 15 }),
      ...data,
    };
  }

  generateCsv(study, { stats }) {
    const columns = [
      { key: 'zone', header: 'Zone' },
      { key: 'start', header: 'Start' },
      { key: 'end', header: 'End' },
      ...Array.prototype.concat.apply([], PedClass.enumValues.map(
        pedClass => PedDelay.enumValues.map(
          pedDelay => ({
            key: `${pedClass.short}_${pedDelay.short}`,
            header: `${pedClass.description} ${pedDelay.description}`,
          }),
        ),
      )),
      { key: 'total', header: 'Total Peds' },
      { key: 'crossings', header: 'Number of Crossings' },
    ];
    const rows = Array.prototype.concat.apply([], stats.zones.map(
      zone => zone.rows.map(
        row => ReportPedDelaySummary.generateCsvZoneRow(zone, row),
      ),
    ));
    return { columns, rows };
  }

  // PDF GENERATION

  static getFactoredSummaryTableRow(label, row, style) {
    return [
      { value: label, header: true, style: { br: true, ...style } },
      { value: row.nd_f, style },
      { value: row.nd_f_pct.toFixed(2), style: { br: true, ...style } },
      { value: row.d_f, style },
      { value: row.d_f_pct.toFixed(2), style: { br: true, ...style } },
      { value: row.total_f, style },
    ];
  }

  static getFactoredSummaryTableOptions(stats) {
    return {
      autoWidthTable: true,
      title: 'Factored Summary',
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        { c: 1, style: { width: '3xl' } },
        { c: 2, style: { width: '3xl' } },
        { c: 3, style: { width: '3xl' } },
        { c: 4, style: { width: '3xl' } },
        { c: 5, style: { width: '3xl' } },
      ],
      header: [
        [
          { value: null, style: { br: true, bold: true } },
          { value: `Delay ${PedDelay.NOT_DELAYED.description}` },
          { value: 'Percent of Total', style: { br: true } },
          { value: `Delay ${PedDelay.DELAYED.description}` },
          { value: 'Percent of Total', style: { br: true } },
          { value: 'Combined Totals' },
        ],
      ],
      body: [
        ...stats.zones.map(
          (zone, i) => ReportPedDelaySummary.getFactoredSummaryTableRow(
            `Zone ${zone.label}`,
            zone.totals,
            { shade: i % 2 === 1 },
          ),
        ),
        ReportPedDelaySummary.getFactoredSummaryTableRow(
          'All Zones',
          stats.totals,
          { bt: true },
        ),
      ],
    };
  }

  static getFirstZoneTableOptions(stats) {
    const tableOptions = ReportPedDelaySummary.getZoneTableOptions(stats.zones[0]);

    tableOptions.columnStyles.push({ c: 13, style: { width: '3xl' } });

    tableOptions.header[0].push({
      value: 'Total Peds: All Zones',
      rowspan: 3,
      style: { bl: true },
    });

    stats.byTime.forEach((value, i) => {
      const shade = i % 2 === 1;
      tableOptions.body[i].push({ value, style: { bl: true, shade } });
    });

    const n = stats.zones[0].rows.length;
    tableOptions.body[n].push({
      value: stats.totals.total,
      style: { bl: true, bt: true, shade: n % 2 === 1 },
    });
    tableOptions.body[n + 1].push({
      value: stats.totals.total_f,
      style: { bl: true, shade: n % 2 === 0 },
    });

    return tableOptions;
  }

  static getZoneTableRow(label, data, style) {
    return [
      { value: label, header: true, style: { br: true, ...style } },
      ...Array.prototype.concat.apply([], PedClass.enumValues.map(
        pedClass => PedDelay.enumValues.map((pedDelay, j) => {
          const key = `${pedClass.short}_${pedDelay.short}`;
          return {
            value: data[key],
            style: { br: j === PedDelay.enumValues.length - 1, ...style },
          };
        }),
      )),
      { value: data.total, style: { br: true, ...style } },
      { value: data.crossings, style },
    ];
  }

  static getZoneTableRowFactored(label, data, style) {
    return [
      { value: label, header: true, style: { br: true, ...style } },
      ...Array.prototype.concat.apply([], PedClass.enumValues.map(
        pedClass => PedDelay.enumValues.map((pedDelay, j) => {
          const key = `${pedClass.short}_${pedDelay.short}_f`;
          return {
            value: data[key],
            style: { br: j === PedDelay.enumValues.length - 1, ...style },
          };
        }),
      )),
      { value: data.total_f, style: { br: true, ...style } },
      { value: data.crossings, style },
    ];
  }

  static getZoneTableDataRow(row, i) {
    const { t, data } = row;
    const start = t;
    const end = t.plus({ minutes: ReportBaseFlow.MINUTES_PER_ROW });
    const timeRange = { start, end };
    const timeRangeHuman = TimeFormatters.formatRangeTimeOfDay(timeRange);
    return ReportPedDelaySummary.getZoneTableRow(
      timeRangeHuman,
      data,
      { shade: i % 2 === 1 },
    );
  }

  static getZoneTableTotalsRows(zone) {
    const n = zone.rows.length;
    return [
      ReportPedDelaySummary.getZoneTableRow(
        'Actual Totals',
        zone.totals,
        { bt: true, shade: n % 2 === 1 },
      ),
      ReportPedDelaySummary.getZoneTableRowFactored(
        'Factored Totals',
        zone.totals,
        { shade: n % 2 === 0 },
      ),
    ];
  }

  static getZoneTableOptions(zone) {
    return {
      autoWidthTable: true,
      title: `Zone ${zone.label}`,
      tableStyle: { fontSize: '2xs' },
      columnStyles: [
        { c: 0, style: { width: '3xl' } },
        { c: 11, style: { width: '2xl' } },
        { c: 12, style: { width: '2xl' } },
      ],
      header: [
        [
          { value: null, rowspan: 2, style: { br: true } },
          { value: 'Ped Types', colspan: 10, style: { bb: true, br: true } },
          { value: 'Total Peds', rowspan: 3, style: { br: true } },
          { value: 'Number of Crossings', rowspan: 3 },
        ],
        [
          // rowspan: 2
          ...PedClass.enumValues.map(
            pedClass => ({ value: pedClass.description, colspan: 2, style: { br: true } }),
          ),
          // rowspan: 3
          // rowspan: 3
        ],
        [
          { value: 'Time Period', style: { br: true } },
          ...Array.prototype.concat.apply([], PedClass.enumValues.map(
            () => PedDelay.enumValues.map(
              (pedDelay, i) => ({
                value: pedDelay.description,
                style: { br: i === PedDelay.enumValues.length - 1 },
              }),
            ),
          )),
          // rowspan: 3
          // rowspan: 3
        ],
      ],
      body: [
        ...zone.rows.map(ReportPedDelaySummary.getZoneTableDataRow),
        ...ReportPedDelaySummary.getZoneTableTotalsRows(zone),
      ],
    };
  }

  static getCountMetadataOptions({
    date,
    hours,
    stats,
    weather,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;

    const { totals, zones } = stats;

    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      { cols: 3, name: 'Study Hours', value: hoursStr },
      { cols: 6, name: 'Weather', value: weather },
      ...zones.map(zone => ({
        cols: 3,
        name: `Zone ${zone.label} Total`,
        value: zone.totals.total,
      })),
      { cols: 3, name: 'All Zones Total', value: totals.total },
    ];
    return { entries };
  }

  generateLayoutContent(study, reportData) {
    const countMetadataOptions = ReportPedDelaySummary.getCountMetadataOptions(reportData);
    const { stats } = reportData;
    const factoredSummaryTableOptions = ReportPedDelaySummary
      .getFactoredSummaryTableOptions(stats);
    const firstZoneTableOptions = ReportPedDelaySummary.getFirstZoneTableOptions(stats);
    const zoneTablesOptions = stats.zones.slice(1).map(ReportPedDelaySummary.getZoneTableOptions);
    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
      { type: ReportBlock.TABLE, options: factoredSummaryTableOptions },
      { type: ReportBlock.PAGE_BREAK, options: {} },
      { type: ReportBlock.TABLE, options: firstZoneTableOptions },
      ...Array.prototype.concat.apply([], zoneTablesOptions.map(options => [
        { type: ReportBlock.PAGE_BREAK, options: {} },
        ({ type: ReportBlock.TABLE, options }),
      ])),
    ];
  }
}

export default ReportPedDelaySummary;
