/* eslint-disable class-methods-use-this */
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import StudyDataDAO from '@/lib/db/StudyDataDAO';
import ReportBase from '@/lib/reports/ReportBase';
import { parseStudyReportId } from '@/lib/reports/ReportIdParser';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Base class for all FLOW-related reports, i.e. those reports that deal with traffic count
 * and study data.
 */
class ReportBaseFlow extends ReportBase {
  /**
   * Parses an ID in the format `{studyType}/{id}`, and returns it as a
   * {@link Count}.
   *
   * @param {string} rawId - ID to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(rawId) {
    const { study } = await parseStudyReportId(this.type(), rawId);
    return study;
  }

  async fetchRawData(study) {
    return StudyDataDAO.byStudy(study);
  }

  async generateLayoutHeader(study) {
    const location = await CentrelineDAO.byFeature(study);

    let info;
    if (location === null) {
      /*
       * Fallback in case this study refers to an old centreline feature that no longer exists.
       */
      const { centrelineId, centrelineType } = study;
      info = `${centrelineType}_${centrelineId}`;
    } else {
      info = location.description;
    }

    const { startDate: start, endDate: end } = study;
    const subinfo = TimeFormatters.formatRangeDate({ start, end });
    return { info, subinfo };
  }

  // UTILITY METHODS

  /**
   *
   * @param {CountData} countData - count data
   * @param {IndexRange} indexRange - index range valid on `countData`
   * @returns {TimeRange?} time range on `countData` for the given `indexRange`, assuming
   * 15-minute buckets, or `null` if `countData` or `indexRange` are empty
   */
  static timeRange(countData, indexRange) {
    if (countData.length === 0) {
      return null;
    }
    const { lo, hi } = indexRange;
    if (lo === hi) {
      return null;
    }
    const { t: start } = countData[lo];
    let { t: end } = countData[hi - 1];
    end = end.plus({
      minutes: ReportBaseFlow.MINUTES_PER_ROW,
    });
    return { start, end };
  }
}

// TODO: what if we have smaller / larger buckets?

/**
 * @type {number}
 */
ReportBaseFlow.ROWS_PER_HOUR = 4;

/**
 * @type {number}
 */
ReportBaseFlow.MINUTES_PER_ROW = 15;

export default ReportBaseFlow;
