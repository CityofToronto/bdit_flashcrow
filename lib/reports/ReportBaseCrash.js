/* eslint-disable class-methods-use-this */
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CollisionDAO from '@/lib/db/CollisionDAO';
import {
  InvalidCentrelineTypeError,
  InvalidReportIdError,
} from '@/lib/error/MoveErrors';
import ReportBase from '@/lib/reports/ReportBase';

/**
 * Base class for all CRASH-related reports, i.e. those reports that deal with collision data.
 */
class ReportBaseCrash extends ReportBase {
  /**
   * Parses an ID in the format `{centrelineType}/{centrelineId}`, and returns it
   * as a location from {@link CentrelineDAO} for further processing.
   *
   * @param {string} rawId - ID to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(rawId) {
    const parts = rawId.split('/');
    if (parts.length !== 2) {
      throw new InvalidReportIdError(rawId);
    }

    let centrelineType = parts.shift();
    centrelineType = parseInt(centrelineType, 10);
    if (Number.isNaN(centrelineType)) {
      throw new InvalidReportIdError(rawId);
    }

    let centrelineId = parts.shift();
    centrelineId = parseInt(centrelineId, 10);
    if (Number.isNaN(centrelineId)) {
      throw new InvalidReportIdError(rawId);
    }

    try {
      const location = await CentrelineDAO.byIdAndType(centrelineId, centrelineType);
      if (location === null) {
        throw new InvalidReportIdError(rawId);
      }
      return location;
    } catch (err) {
      if (err instanceof InvalidCentrelineTypeError) {
        throw new InvalidReportIdError(rawId);
      }
      throw err;
    }
  }

  async fetchRawData(location) {
    const { centrelineId, centrelineType } = location;
    return CollisionDAO.byCentreline(centrelineType, centrelineId);
  }

  // TODO: metadata blocks?
}

export default ReportBaseCrash;
