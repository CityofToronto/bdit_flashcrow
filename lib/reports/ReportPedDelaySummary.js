/* eslint-disable class-methods-use-this */
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import TimeFormatters from '@/lib/time/TimeFormatters';

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
    // TODO: actually transform data

    return {
      date,
      hours,
      countData,
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

  static getCountMetadataOptions({ date, hours, weather }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;
    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      { cols: 3, name: 'Study Hours', value: hoursStr },
      { cols: 6, name: 'Weather', value: weather },
      { cols: 3, name: 'Zone A Total', value: 125 },
      { cols: 3, name: 'Zone B Total', value: 71 },
      { cols: 3, name: 'Zone C Total', value: 15 },
      { cols: 3, name: 'All Zones Total', value: 211 },
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
