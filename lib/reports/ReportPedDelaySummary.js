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
    const data = {};
    let total = 0;
    PedClass.enumValues.forEach((pedClass) => {
      PedDelay.enumValues.forEach((pedDelay) => {
        const key = `${pedClass.short}_${pedDelay.short}`;
        const value = rawData[key];
        data[key] = value;
        total += value;
      });
    });
    data.crossings = rawData.crossings;
    data.total = total;
    return data;
  }

  static computeAllPedDelayTotals(zoneData) {
    return zoneData.map(({ t, data: rawData }) => {
      const data = ReportPedDelaySummary.computePedDelayTotals(rawData);
      return { t, data };
    });
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
    return { totals, zones };
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

  generateCsv(/* study, transformedData */) {
    const columns = [
      { key: 'zone', header: 'Zone' },
      { key: 'start', header: 'Start' },
      { key: 'end', header: 'End' },
      { key: 'ac_d', header: 'Assisted Children <=10 sec' },
      { key: 'ac_nd', header: 'Assisted Children >10 sec' },
      { key: 'uc_d', header: 'Unassisted Children <=10 sec' },
      { key: 'uc_nd', header: 'Unassisted Children >10 sec' },
      { key: 'ya_d', header: 'Youth and Adults <=10 sec' },
      { key: 'ya_nd', header: 'Youth and Adults >10 sec' },
      { key: 'sc_d', header: 'Senior Citizens <=10 sec' },
      { key: 'sc_nd', header: 'Senior Citizens >10 sec' },
      { key: 'pwd_d', header: 'Persons with Disabilities <=10 sec' },
      { key: 'pwd_nd', header: 'Persons with Disabilities >10 sec' },
      { key: 'total', header: 'Total Pedestrians' },
      { key: 'crossings', header: 'Number of Crossings' },
    ];
    // TODO: implement this
    const rows = [];
    return { columns, rows };
  }

  // PDF GENERATION

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
    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
    ];
  }
}

export default ReportPedDelaySummary;
