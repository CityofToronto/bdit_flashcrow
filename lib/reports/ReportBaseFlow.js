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
   * Parses an ID in the format `{categoryId}/{id}`, and returns it as a
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
    const info = location.description;
    const { startDate: start, endDate: end } = study;
    const subinfo = TimeFormatters.formatRangeDate({ start, end });
    return { info, subinfo };
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
