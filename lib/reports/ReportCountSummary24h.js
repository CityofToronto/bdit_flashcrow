import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ArteryDAO from '@/lib/db/ArteryDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Subclass of {@link ReportBaseFlow} for the 24-Hour Count Summary Report.
 *
 * @see https://www.notion.so/bditto/24-Hour-Count-Summary-Report-573e17ae544749dab66c25f019281654
 */
class ReportCountSummary24h extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.COUNT_SUMMARY_24H;
  }

  /**
   * Parses an ID in the format `{categoryId}/{id}`, and returns the associated
   * {@link Count} and {@link Artery}.
   *
   * @param {string} rawId - ID to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(rawId) {
    const count = await super.parseId(rawId);
    const { arteryCode } = count;
    const artery = await ArteryDAO.byArteryCode(arteryCode);
    if (artery === null) {
      throw new InvalidReportIdError(rawId);
    }
    return { artery, count };
  }

  async fetchRawData({ count }) {
    return super.fetchRawData(count);
  }

  static volumeByBucket(countData) {
    const n = 24 * ReportBaseFlow.ROWS_PER_HOUR;
    const volumeByBucket = new Array(n).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.hour;
      const m = t.minute;
      const i = h * ReportBaseFlow.ROWS_PER_HOUR + Math.floor(m / ReportBaseFlow.MINUTES_PER_ROW);
      volumeByBucket[i] += COUNT;
    });
    return volumeByBucket;
  }

  static peak(volumeByBucket, lo, hi, len) {
    let peakVolume = -Infinity;
    let indexStart = null;
    for (let i = lo; i <= hi - len; i += 1) {
      const sum = ArrayStats.sum(
        volumeByBucket.slice(i, i + len),
      );
      if (sum > peakVolume) {
        peakVolume = sum;
        indexStart = i;
      }
    }
    const indexEnd = indexStart + len;
    return { indexStart, indexEnd, sum: peakVolume };
  }

  static timeRange(countData, indexStart, indexEnd) {
    const countDate = countData[0].t;
    const { year, month, day } = countDate;

    let hour = Math.floor(indexStart / ReportBaseFlow.ROWS_PER_HOUR);
    let minute = (indexStart % ReportBaseFlow.ROWS_PER_HOUR) * ReportBaseFlow.MINUTES_PER_ROW;
    const start = DateTime.fromObject({
      year,
      month,
      day,
      hour,
      minute,
    });

    hour = Math.floor(indexEnd / ReportBaseFlow.ROWS_PER_HOUR);
    minute = (indexEnd % ReportBaseFlow.ROWS_PER_HOUR) * ReportBaseFlow.MINUTES_PER_ROW;
    const end = DateTime.fromObject({
      year,
      month,
      day,
      hour,
      minute,
    });

    return { start, end };
  }

  static peakSection(countData, volumeByBucket, lo, hi) {
    const { indexStart, indexEnd, sum } = ReportCountSummary24h.peak(
      volumeByBucket,
      lo,
      hi,
      ReportBaseFlow.ROWS_PER_HOUR,
    );
    const timeRange = ReportCountSummary24h.timeRange(countData, indexStart, indexEnd);
    return {
      indices: ArrayUtils.range(indexStart, indexEnd),
      sum,
      timeRange,
    };
  }

  static offPeakSection(countData, volumeByBucket, amPeak, pmPeak) {
    const k = ReportBaseFlow.ROWS_PER_HOUR;

    const { indexStart, sum } = ReportCountSummary24h.peak(
      volumeByBucket,
      amPeak.indices[k - 1] + 1,
      pmPeak.indices[k - 1] - 1,
      ReportBaseFlow.ROWS_PER_HOUR,
    );
    const indexEnd = indexStart + k;
    const timeRange = ReportCountSummary24h.timeRange(countData, indexStart, indexEnd);
    return {
      indices: ArrayUtils.range(indexStart, indexEnd),
      sum,
      timeRange,
    };
  }

  transformData({ artery, count }, countData) {
    const volumeByBucket = ReportCountSummary24h.volumeByBucket(countData);
    const total = ArrayStats.sum(volumeByBucket);
    const dayOfWeek = TimeFormatters.formatDayOfWeek(count.date);

    const amPeak = ReportCountSummary24h.peakSection(
      countData,
      volumeByBucket,
      0,
      ReportCountSummary24h.HOURS_PER_DAY / 2 * ReportBaseFlow.ROWS_PER_HOUR,
    );
    const pmPeak = ReportCountSummary24h.peakSection(
      countData,
      volumeByBucket,
      ReportCountSummary24h.HOURS_PER_DAY / 2 * ReportBaseFlow.ROWS_PER_HOUR,
      ReportCountSummary24h.HOURS_PER_DAY * ReportBaseFlow.ROWS_PER_HOUR,
    );
    const offPeak = ReportCountSummary24h.offPeakSection(
      countData,
      volumeByBucket,
      amPeak,
      pmPeak,
    );

    const totals = {
      sum: {
        amPeak: amPeak.sum,
        pmPeak: pmPeak.sum,
        offPeak: offPeak.sum,
        total,
      },
      avg: {
        amPeak: amPeak.sum,
        pmPeak: pmPeak.sum,
        offPeak: offPeak.sum,
        total,
      },
    };

    return [
      {
        title: artery.street1,
        directionGroups: [
          {
            title: artery.approachDir.bound,
            counts: [
              {
                location: count.locationDesc,
                category: count.type.studyType.label,
                stationCode: artery.stationCode,
                arteryCode: artery.arteryCode,
                date: count.date,
                dayOfWeek,
                amPeak,
                pmPeak,
                offPeak,
                total,
              },
            ],
            totals,
          },
        ],
        totals,
      },
    ];
  }

  generateCsv(parsedId, sections) {
    const columns = [
      { key: 'section', header: 'Section' },
      { key: 'direction', header: 'Direction' },
      { key: 'location', header: 'Location' },
      { key: 'date', header: 'Date' },
      { key: 'dayOfWeek', header: 'DayOfWeek' },
      { key: 'stationCode', header: 'StationCode' },
      { key: 'arteryCode', header: 'ArteryCode' },
      { key: 'category', header: 'Category' },
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
    sections.forEach(({ title: section, directionGroups }) => {
      directionGroups.forEach(({ title: direction, counts }) => {
        counts.forEach(({
          location,
          date,
          dayOfWeek,
          stationCode,
          arteryCode,
          category,
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
          total: count,
        }) => {
          const row = {
            section,
            direction,
            location,
            date,
            dayOfWeek,
            stationCode,
            arteryCode,
            category,
            amPeakStart,
            amPeakEnd,
            amPeakCount,
            pmPeakStart,
            pmPeakEnd,
            pmPeakCount,
            offPeakStart,
            offPeakEnd,
            offPeakCount,
            count,
          };
          rows.push(row);
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
          style: { br: true, fontSize: 'xl' },
        },
        { value: 'Station Code' },
        { value: 'Artery Code' },
        { value: 'Category' },
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

  static getCountRow({
    location,
    stationCode,
    arteryCode,
    category,
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
  }) {
    const dateHuman = TimeFormatters.formatDefault(date);
    const countDateHuman = `${dateHuman} (${dayOfWeek})`;
    const amPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(amPeakTimeRange);
    const pmPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(pmPeakTimeRange);
    const offPeakTimeRangeHuman = TimeFormatters.formatRangeTimeOfDay(offPeakTimeRange);
    return [
      { value: location, style: { br: true } },
      { value: stationCode },
      { value: arteryCode },
      { value: category },
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

  static getDirectionGroupRows({
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
  }) {
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
        { value: avgAmPeak },
        { value: null },
        { value: avgPmPeak },
        { value: null },
        { value: avgOffPeak },
        { value: null },
        { value: avgTotal },
      ],
    ];
    return [
      headerRow,
      ...counts.map(ReportCountSummary24h.getCountRow),
      ...footerRows,
    ];
  }

  static getSectionLayout({
    title: sectionTitle,
    directionGroups,
    totals,
  }) {
    const header = ReportCountSummary24h.getSectionHeader(sectionTitle);
    const body = Array.prototype.concat.apply(
      [],
      directionGroups.map(ReportCountSummary24h.getDirectionGroupRows),
    );
    const footer = ReportCountSummary24h.getSectionFooter(sectionTitle, totals);
    return { header, body, footer };
  }

  static getTableBlocks(reportData) {
    return reportData.map((section) => {
      const options = ReportCountSummary24h.getSectionLayout(section);
      return { type: ReportBlock.TABLE, options };
    });
  }

  generateLayoutContent({ count }, reportData) {
    const countMetadataBlock = ReportBaseFlow.getCountMetadataBlock(count);
    const tableBlocks = ReportCountSummary24h.getTableBlocks(reportData);
    return [
      countMetadataBlock,
      ...tableBlocks,
    ];
  }
}

/**
 * TODO: DRY with {@link ReportCountSummary24h}
 *
 * @type {number}
 */
ReportCountSummary24h.HOURS_PER_DAY = 24;


export default ReportCountSummary24h;
