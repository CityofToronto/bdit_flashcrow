/* eslint-disable class-methods-use-this */
import { ReportBlock } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import {
  InvalidCentrelineTypeError,
  InvalidCompositeIdError,
  InvalidReportIdError,
} from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';
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
   * Parses a `CompositeId`, and returns it as an array of centreline locations from
   * {@link CentrelineDAO} for further processing.
   *
   * @param {string} s1 - `CompositeId` to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(s1) {
    try {
      const features = CompositeId.decode(s1);
      const locations = await CentrelineDAO.byFeatures(features);
      return Array.from(locations.values());
    } catch (err) {
      if (err instanceof InvalidCentrelineTypeError) {
        throw new InvalidReportIdError(s1);
      }
      if (err instanceof InvalidCompositeIdError) {
        throw new InvalidReportIdError(s1);
      }
      throw err;
    }
  }

  async fetchRawData(features, collisionQuery) {
    if (this.collisionFactors === null) {
      this.collisionFactors = await CollisionFactorDAO.all();
    }
    const [collisions, collisionSummary] = await Promise.all([
      CollisionDAO.byCentreline(features, collisionQuery),
      CollisionDAO.byCentrelineSummary(features, collisionQuery),
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
