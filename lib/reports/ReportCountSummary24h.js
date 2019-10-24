import ArrayUtils from '@/lib/ArrayUtils';
import { ReportType } from '@/lib/Constants';
import ArteryDAO from '@/lib/db/ArteryDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
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
      const h = t.getHours();
      const m = t.getMinutes();
      const i = h * ReportBaseFlow.ROWS_PER_HOUR + Math.floor(m / ReportBaseFlow.MINUTES_PER_ROW);
      volumeByBucket[i] += COUNT;
    });
    return volumeByBucket;
  }

  static peak(volumeByBucket, lo, hi, len) {
    let peakVolume = -Infinity;
    let indexStart = null;
    for (let i = lo; i < hi - len; i += 1) {
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
    const year = countDate.getFullYear();
    const month = countDate.getMonth();
    const date = countDate.getDate();

    let hour = Math.floor(indexStart / ReportBaseFlow.ROWS_PER_HOUR);
    let minute = (indexStart % ReportBaseFlow.ROWS_PER_HOUR) * ReportBaseFlow.MINUTES_PER_ROW;
    const start = new Date(year, month, date, hour, minute);

    hour = Math.floor(indexEnd / ReportBaseFlow.ROWS_PER_HOUR);
    minute = (indexEnd % ReportBaseFlow.ROWS_PER_HOUR) * ReportBaseFlow.MINUTES_PER_ROW;
    const end = new Date(year, month, date, hour, minute);

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
      pmPeak.indices[k - 1],
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
                category: count.type.name,
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

  generateLayout(count /* , transformedData */) {
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
 * TODO: DRY with {@link ReportCountSummary24h}
 *
 * @type {number}
 */
ReportCountSummary24h.HOURS_PER_DAY = 24;


export default ReportCountSummary24h;
