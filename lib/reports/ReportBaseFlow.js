import { ReportBlock, StudyType } from '@/lib/Constants';
import CountDAO from '@/lib/db/CountDAO';
import CountDataDAO from '@/lib/db/CountDataDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportBase from '@/lib/reports/ReportBase';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Base class for all FLOW-related reports, i.e. those reports that deal with traffic count
 * and study data.
 */
class ReportBaseFlow extends ReportBase {
  /* eslint-disable class-methods-use-this */

  /**
   * Parses an ID in the format `{categoryId}/{id}`, and returns it as a
   * {@link Count}.
   *
   * @param {string} rawId - ID to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(rawId) {
    const parts = rawId.split('/');
    if (parts.length !== 2) {
      throw new InvalidReportIdError(rawId);
    }

    let categoryId = parts.shift();
    categoryId = parseInt(categoryId, 10);
    if (Number.isNaN(categoryId)) {
      throw new InvalidReportIdError(rawId);
    }

    let id = parts.shift();
    id = parseInt(id, 10);
    if (Number.isNaN(id)) {
      throw new InvalidReportIdError(rawId);
    }

    const count = await CountDAO.byIdAndCategory(id, categoryId);
    if (count === null) {
      throw new InvalidReportIdError(rawId);
    }
    const { speedRelated, tmcRelated } = this.type();
    const { studyType } = count.type;
    if (speedRelated) {
      /*
       * Speed reports MUST have speed data, as the speed class calculations depend on it.
       * Without that, many of those calculations will return `NaN`.
       */
      if (studyType !== StudyType.ATR_SPEED_VOLUME) {
        throw new InvalidReportIdError(rawId);
      }
    } else if (tmcRelated) {
      /*
       * TMC reports MUST have TMC data, as the various turning movement totals depend on it.
       * Without that, many of those calculations will return `NaN`.
       */
      if (studyType !== StudyType.TMC) {
        throw new InvalidReportIdError(rawId);
      }
    } else if (studyType === StudyType.TMC) {
      /*
       * Other reports MUST NOT have TMC data, as they expect data in the volume-data format
       * in `"TRAFFIC"."CNT_DET"`.
       */
      throw new InvalidReportIdError(rawId);
    }
    return count;
  }

  async fetchRawData(count) {
    return CountDataDAO.byCount(count);
  }

  static getCountMetadataBlock({
    arteryCode,
    date,
    locationDesc,
    notes,
    stationCode,
    type,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const dateValue = `${dateStr} (${dayOfWeekStr})`;
    const options = {
      left: [
        { name: locationDesc, value: null },
        { name: 'Date', value: dateValue },
      ],
      right: [
        { name: 'Study Category', value: type.label },
        { name: 'Station Code', value: stationCode },
        { name: 'Artery Code', value: arteryCode },
      ],
      notes,
    };
    return {
      type: ReportBlock.COUNT_METADATA,
      options,
    };
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
