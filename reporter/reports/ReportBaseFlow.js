import { ReportType } from '@/lib/Constants';
import CountDAO from '@/../lib/db/CountDAO';
import CountDataDAO from '@/../lib/db/CountDataDAO';
import { InvalidReportIdError } from '@/../lib/error/MoveErrors';

import ReportBase from './ReportBase';

/**
 * Base class for all FLOW-related reports, i.e. those reports that deal with traffic count
 * and study data.
 */
class ReportBaseFlow extends ReportBase {
  /* eslint-disable class-methods-use-this */

  /**
   * @returns {Boolean} whether this report is TMC-related (i.e. relies on data
   * from `"TRAFFIC"."DET"`)
   */
  isTmcRelated() {
    const type = this.type();
    return type === ReportType.COUNT_SUMMARY_TURNING_MOVEMENT
      || type === ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED;
  }

  /**
   * @returns {Boolean} whether this report is speed-related (i.e. relies on data
   * from `"TRAFFIC"."CNT_DET"` with valid `SPEED_CLASS` values)
   */
  isSpeedRelated() {
    const type = this.type();
    return type === ReportType.SPEED_PERCENTILE;
  }

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
    if (this.isSpeedRelated()) {
      /*
       * Speed reports MUST have speed data, as the speed class calculations depend on it.
       * Without that, many of those calculations will return `NaN`.
       */
      if (count.type.value !== 'ATR_SPEED_VOLUME') {
        throw new InvalidReportIdError(rawId);
      }
    } else if (this.isTmcRelated()) {
      /*
       * TMC reports MUST have TMC data, as the various turning movement totals depend on it.
       * Without that, many of those calculations will return `NaN`.
       */
      if (count.type.value !== 'TMC') {
        throw new InvalidReportIdError(rawId);
      }
    } else if (count.type.value === 'TMC') {
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

  getPdfMetadata(count) {
    const {
      arteryCode,
      date,
      locationDesc,
      stationCode,
      type,
    } = count;
    return {
      reportName: 'Graphical 24-Hour Count Summary Report',
      reportDate: new Date(),
      date,
      locationDesc,
      identifiers: [
        { name: 'Study Category', value: type.label },
        { name: 'Station Number', value: stationCode },
        { name: 'Artery Code', value: arteryCode },
      ],
    };
  }
}

export default ReportBaseFlow;
