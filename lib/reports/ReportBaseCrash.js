/* eslint-disable class-methods-use-this */
import { ReportBlock } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import {
  InvalidCentrelineTypeError,
  InvalidReportIdError,
} from '@/lib/error/MoveErrors';
import ReportBase from '@/lib/reports/ReportBase';

/**
 * Base class for all CRASH-related reports, i.e. those reports that deal with collision data.
 */
class ReportBaseCrash extends ReportBase {
  constructor() {
    super();
    this.collisionFactors = null;
  }

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

  async fetchRawData(location, filters) {
    if (this.collisionFactors === null) {
      this.collisionFactors = await CollisionFactorDAO.all();
    }

    const { centrelineId, centrelineType } = location;
    const collisionQuery = {
      centrelineId,
      centrelineType,
      ...filters,
    };
    const [collisions, collisionSummary] = await Promise.all([
      CollisionDAO.byCentreline(collisionQuery),
      CollisionDAO.byCentrelineSummary(collisionQuery),
    ]);
    return { collisions, collisionSummary };
  }

  getCollisionFactorEntries(field) {
    const fieldEntries = this.collisionFactors.get(field);
    if (fieldEntries === undefined) {
      return null;
    }
    return fieldEntries;
  }

  getCollisionFactorEntry(field, value) {
    // TODO: check for null collisionFactors
    const fieldEntries = this.getCollisionFactorEntries(field);
    if (fieldEntries === null) {
      return null;
    }
    const entry = fieldEntries.get(value);
    if (entry === undefined) {
      return null;
    }
    return entry;
  }

  getCollisionFactorCode(field, value) {
    const entry = this.getCollisionFactorEntry(field, value);
    if (entry === null) {
      return null;
    }
    return entry.code;
  }

  getCollisionFactorDescription(field, value) {
    const entry = this.getCollisionFactorEntry(field, value);
    if (entry === null) {
      return null;
    }
    return entry.description;
  }

  static getCollisionsSummaryBlock({ amount, ksi, validated }) {
    const options = {
      entries: [
        { cols: 3, name: 'Amount', value: amount },
        { cols: 3, name: 'KSI', value: ksi },
        { cols: 3, name: 'Validated', value: validated },
      ],
    };
    return {
      type: ReportBlock.METADATA,
      options,
    };
  }
}

export default ReportBaseCrash;
