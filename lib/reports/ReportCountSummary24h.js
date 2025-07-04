/* eslint-disable class-methods-use-this */
import {
  CardinalDirection,
  REPORT_CONSTANTS,
  ReportBlock,
  ReportType,
} from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import {
  indexRangeHourOfDay,
  indexRangePeakTime,
  indexRangeSum,
  sumByTime,
} from '@/lib/reports/time/ReportTimeUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Subclass of {@link ReportBaseFlow} for the 24-Hour Count Summary Report.
 *
 * @see https://www.notion.so/bditto/24-Hour-Count-Summary-Report-573e17ae544749dab66c25f019281654
 */
class ReportCountSummary24h extends ReportBaseFlow {
  type() {
    return ReportType.COUNT_SUMMARY_24H;
  }

  static sumSection(count, totaledData, indexRange) {
    const sum = indexRangeSum(totaledData, indexRange, ({ COUNT }) => COUNT);
    const timeRange = ReportCountSummary24h.timeRange(totaledData, indexRange);
    return {
      sum,
      timeRange,
    };
  }

  static transformCountData({ count, countData }) {
    const totaledData = sumByTime(countData);
    const n = totaledData.length;
    const total = indexRangeSum(totaledData, { lo: 0, hi: n }, ({ COUNT }) => COUNT);

    const dayOfWeek = TimeFormatters.formatDayOfWeek(count.date);

    const indicesAm = indexRangeHourOfDay(totaledData, REPORT_CONSTANTS.AM_PEAK_WINDOW);
    const indicesAmPeak = indexRangePeakTime(
      totaledData,
      indicesAm,
      { hours: 1 },
      ({ COUNT }) => COUNT,
    );
    const amPeak = ReportCountSummary24h.sumSection(count, totaledData, indicesAmPeak);

    const indicesPm = indexRangeHourOfDay(totaledData, REPORT_CONSTANTS.PM_PEAK_WINDOW);
    const indicesPmPeak = indexRangePeakTime(
      totaledData,
      indicesPm,
      { hours: 1 },
      ({ COUNT }) => COUNT,
    );
    const pmPeak = ReportCountSummary24h.sumSection(count, totaledData, indicesPmPeak);

    const indicesOffHours = { lo: indicesAmPeak.hi, hi: indicesPmPeak.lo };
    const indicesOffPeak = indexRangePeakTime(
      totaledData,
      indicesOffHours,
      { hours: 1 },
      ({ COUNT }) => COUNT,
    );
    const offPeak = ReportCountSummary24h.sumSection(count, totaledData, indicesOffPeak);

    return {
      studyType: count.studyType.label,
      stationCode: count.extraMetadata.stationCode,
      arteryCode: count.extraMetadata.arteryCode,
      date: count.date,
      dayOfWeek,
      amPeak,
      pmPeak,
      offPeak,
      total,
    };
  }

  static getTotalStats(stats, n) {
    const sumAmPeak = ArrayStats.sum(stats.map(({ amPeak }) => amPeak.sum));
    const sumPmPeak = ArrayStats.sum(stats.map(({ pmPeak }) => pmPeak.sum));
    const sumOffPeak = ArrayStats.sum(stats.map(({ offPeak }) => offPeak.sum));
    const sumTotal = ArrayStats.sum(stats.map(({ total }) => total));
    return {
      sum: {
        amPeak: sumAmPeak,
        pmPeak: sumPmPeak,
        offPeak: sumOffPeak,
        total: sumTotal,
      },
      avg: {
        amPeak: sumAmPeak / n,
        pmPeak: sumPmPeak / n,
        offPeak: sumOffPeak / n,
        total: sumTotal / n,
      },
    };
  }

  transformData(study, { countLocation, counts, studyData }) {
    if (counts.length === 0) {
      return [];
    }

    const directionGroups = [];
    CardinalDirection.enumValues.forEach((direction) => {
      let groupCounts = [];
      counts.forEach((count) => {
        if (count.direction !== direction) {
          return;
        }
        const countData = studyData.get(count.id);
        groupCounts.push({ count, countData });
      });
      if (groupCounts.length > 0) {
        groupCounts = groupCounts.map(ReportCountSummary24h.transformCountData);
        const totals = ReportCountSummary24h.getTotalStats(groupCounts, groupCounts.length);
        const title = direction.bound;
        directionGroups.push({ title, counts: groupCounts, totals });
      }
    });

    const totals = ReportCountSummary24h.getTotalStats(
      directionGroups.map(({ totals: { sum } }) => ({
        amPeak: { sum: sum.amPeak },
        offPeak: { sum: sum.offPeak },
        pmPeak: { sum: sum.pmPeak },
        total: sum.total,
      })),
      counts.length,
    );

    const sections = [
      {
        title: countLocation.description,
        directionGroups,
        totals,
      },
    ];
    return { countLocation, sections };
  }

  static generateCsvCountRow(countLocation, titleSection, titleDirectionGroup, count) {
    const {
      studyType,
      stationCode,
      arteryCode,
      date,
      dayOfWeek,
      amPeak: {
        sum: amPeakCount,
        timeRange: {
          start: amPeakStart,
          end: amPeakEnd,
        },
      },
      pmPeak: {
        sum: pmPeakCount,
        timeRange: {
          start: pmPeakStart,
          end: pmPeakEnd,
        },
      },
      offPeak: {
        sum: offPeakCount,
        timeRange: {
          start: offPeakStart,
          end: offPeakEnd,
        },
      },
      total: totalCount,
    } = count;

    return {
      section: titleSection,
      direction: titleDirectionGroup,
      location: countLocation.description,
      date,
      dayOfWeek,
      stationCode,
      arteryCode,
      studyType,
      amPeakStart,
      amPeakEnd,
      amPeakCount,
      pmPeakStart,
      pmPeakEnd,
      pmPeakCount,
      offPeakStart,
      offPeakEnd,
      offPeakCount,
      count: totalCount,
    };
  }

  generateCsv(parsedId, { countLocation, sections }) {
    const columns = [
      { key: 'section', header: 'Section' },
      { key: 'direction', header: 'Direction' },
      { key: 'location', header: 'Location' },
      { key: 'date', header: 'Date' },
      { key: 'dayOfWeek', header: 'DayOfWeek' },
      { key: 'stationCode', header: 'StationCode' },
      { key: 'arteryCode', header: 'ArteryCode' },
      { key: 'studyType', header: 'StudyType' },
      { key: 'amPeakStart', header: 'AmPeakStart' },
      { key: 'amPeakEnd', header: 'AmPeakEnd' },
      { key: 'amPeakCount', header: 'AmPeakCount' },
      { key: 'pmPeakStart', header: 'PmPeakStart' },
      { key: 'pmPeakEnd', header: 'PmPeakEnd' },
      { key: 'pmPeakCount', header: 'PmPeakCount' },
      { key: 'offPeakStart', header: 'OffPeakStart' },
      { key: 'offPeakEnd', header: 'OffPeakEnd' },
      { key: 'offPeakCount', header: 'OffPeakCount' },
      { key: 'count', header: 'Count' },
    ];
    const rows = [];
    sections.forEach(({ directionGroups, title: titleSection }) => {
      directionGroups.forEach(({ counts, title: titleDirectionGroup }) => {
        counts.forEach((count) => {
          const rowCount = ReportCountSummary24h.generateCsvCountRow(
            countLocation,
            titleSection,
            titleDirectionGroup,
            count,
          );
          rows.push(rowCount);
        });
      });
    });
    return { columns, rows };
  }

  // PDF GENERATION

  static getSectionHeader(sectionTitle) {
    return [
      [
        {
          value: sectionTitle,
          style: { br: true },
        },
        { value: 'Station Code' },
        { value: 'Artery Code' },
        { value: 'Study Type' },
        { value: 'Count Date', style: { br: true } },
        { value: 'AM Peak' },
        { value: 'AM Peak Hour', style: { br: true } },
        { value: 'PM Peak' },
        { value: 'PM Peak Hour', style: { br: true } },
        { value: 'Off Peak' },
        { value: 'Off Peak Hour', style: { br: true } },
        { value: '24 Hour Total' },
      ],
    ];
  }

  static getSectionFooter(sectionTitle, {
    sum: {
      amPeak,
      pmPeak,
      offPeak,
      total,
    },
  }) {
    return [
      [
        { value: null, colspan: 3, style: { bt: true } },
        {
          value: `${sectionTitle} Total:`,
          colspan: 2,
          header: true,
          style: { bt: true },
        },
        { value: amPeak, style: { bt: true } },
        { value: null, style: { bt: true } },
        { value: pmPeak, style: { bt: true } },
        { value: null, style: { bt: true } },
        { value: offPeak, style: { bt: true } },
        { value: null, style: { bt: true } },
        { value: total, style: { bt: true } },
      ],
    ];
  }

  static getCountRow(countLocation, count) {
    const {
      stationCode,
      arteryCode,
      studyType,
      date,
      dayOfWeek,
      amPeak: {
        sum: amPeakCount,
        timeRange: amPeakTimeRange,
      },
      pmPeak: {
        sum: pmPeakCount,
        timeRange: pmPeakTimeRange,
      },
      offPeak: {
        sum: offPeakCount,
        timeRange: offPeakTimeRange,
      },
      total,
    } = count;
    const dateHuman = TimeFormatters.formatDefault(date);
    const countDateHuman = `${dateHuman} (${dayOfWeek})`;
    const amPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(amPeakTimeRange);
    const pmPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(pmPeakTimeRange);
    const offPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(offPeakTimeRange);
    return [
      { value: countLocation.description, style: { br: true } },
      { value: stationCode },
      { value: arteryCode.toString() },
      { value: studyType },
      { value: countDateHuman, style: { br: true } },
      { value: amPeakCount },
      { value: amPeakTimeRangeHuman, style: { br: true } },
      { value: pmPeakCount },
      { value: pmPeakTimeRangeHuman, style: { br: true } },
      { value: offPeakCount },
      { value: offPeakTimeRangeHuman, style: { br: true } },
      { value: total },
    ];
  }

  static getDirectionGroupRows(countLocation, directionGroup) {
    const {
      title: directionGroupTitle,
      counts,
      totals: {
        sum: {
          amPeak: sumAmPeak,
          pmPeak: sumPmPeak,
          offPeak: sumOffPeak,
          total: sumTotal,
        },
        avg: {
          amPeak: avgAmPeak,
          pmPeak: avgPmPeak,
          offPeak: avgOffPeak,
          total: avgTotal,
        },
      },
    } = directionGroup;

    const headerRow = [
      {
        value: directionGroupTitle,
        header: true,
        style: { br: true, fontSize: 'l' },
      },
      { value: null, colspan: 4, style: { br: true } },
      { value: null, colspan: 2, style: { br: true } },
      { value: null, colspan: 2, style: { br: true } },
      { value: null, colspan: 2, style: { br: true } },
      { value: null },
    ];
    const footerRows = [
      [
        { value: null, colspan: 3, style: { bt: true } },
        {
          value: `${directionGroupTitle} Total:`,
          colspan: 2,
          header: true,
          style: { bt: true },
        },
        { value: sumAmPeak, style: { bt: true } },
        { value: null, style: { bt: true } },
        { value: sumPmPeak, style: { bt: true } },
        { value: null, style: { bt: true } },
        { value: sumOffPeak, style: { bt: true } },
        { value: null, style: { bt: true } },
        { value: sumTotal, style: { bt: true } },
      ],
      [
        { value: null },
        { value: null, colspan: 2 },
        { value: `${directionGroupTitle} Average:`, colspan: 2, header: true },
        { value: Math.round(avgAmPeak) },
        { value: null },
        { value: Math.round(avgPmPeak) },
        { value: null },
        { value: Math.round(avgOffPeak) },
        { value: null },
        { value: Math.round(avgTotal) },
      ],
    ];
    return [
      headerRow,
      ...counts.map(count => ReportCountSummary24h.getCountRow(countLocation, count)),
      ...footerRows,
    ];
  }

  static getSectionLayout(countLocation, section) {
    const {
      title: sectionTitle,
      directionGroups,
      totals,
    } = section;
    const header = ReportCountSummary24h.getSectionHeader(sectionTitle);
    const body = Array.prototype.concat.apply(
      [],
      directionGroups.map(directionGroup => ReportCountSummary24h.getDirectionGroupRows(
        countLocation,
        directionGroup,
      )),
    );
    const footer = ReportCountSummary24h.getSectionFooter(sectionTitle, totals);
    return { header, body, footer };
  }

  static getTableBlocks({ countLocation, sections }) {
    return sections.map((section) => {
      const options = ReportCountSummary24h.getSectionLayout(countLocation, section);
      return { type: ReportBlock.TABLE, options };
    });
  }

  generateLayoutContent(study, transformedData) {
    return ReportCountSummary24h.getTableBlocks(transformedData);
  }
}

export default ReportCountSummary24h;
