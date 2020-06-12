/* eslint-disable class-methods-use-this */
import { ReportBlock, StudyType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyDataDAO from '@/lib/db/StudyDataDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportBase from '@/lib/reports/ReportBase';
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
    const parts = rawId.split('/');
    if (parts.length !== 2) {
      throw new InvalidReportIdError(rawId);
    }

    let categoryId = parts.shift();
    categoryId = parseInt(categoryId, 10);
    if (Number.isNaN(categoryId)) {
      throw new InvalidReportIdError(rawId);
    }

    let countGroupId = parts.shift();
    countGroupId = parseInt(countGroupId, 10);
    if (Number.isNaN(countGroupId)) {
      throw new InvalidReportIdError(rawId);
    }

    const study = await StudyDAO.byCategoryAndCountGroup(categoryId, countGroupId);
    if (study === null) {
      throw new InvalidReportIdError(rawId);
    }
    const { studyType } = study.type;
    const { speedRelated, tmcRelated } = this.type();
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
    return study;
  }

  async fetchRawData(study) {
    return StudyDataDAO.byStudy(study);
  }

  static getCountMetadataBlock({
    arteryGroupId,
    // locationDesc,
    // notes,
    startDate,
    // stationCode,
  }) {
    // TODO: switch to more useful info
    const dateStr = TimeFormatters.formatDefault(startDate);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(startDate);
    const startDateStr = `${dateStr} (${dayOfWeekStr})`;
    const options = {
      entries: [
        { cols: 3, name: 'Start Date', value: startDateStr },
        // { cols: 6, name: 'Location', value: locationDesc },
        { cols: 3, name: 'Artery Code', value: arteryGroupId },
        // { cols: 6, name: 'Notes', value: notes },
      ],
    };
    return {
      type: ReportBlock.METADATA,
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
