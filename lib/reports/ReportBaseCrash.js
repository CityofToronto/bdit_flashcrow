/* eslint-disable class-methods-use-this */
import { LocationSelectionType, ReportBlock } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import {
  EnumValueError,
  InvalidCompositeIdError,
  InvalidFeaturesSelectionError,
  InvalidReportIdError,
} from '@/lib/error/MoveErrors';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import FeatureResolver from '@/lib/geo/FeatureResolver';
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
   * Parses an ID in the format `{s1}/{selectionType}`, where `{ s1, selectionType }` identifies
   * a location selection.  Returns this as an object `{ locations, selectionType }`: `locations`
   * is an array of centreline locations from {@link CentrelineDAO}, while `selectionType` is a
   * {@link LocationSelectionType}.
   *
   * @param {string} rawId - ID to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(rawId) {
    const parts = rawId.split('/');
    if (parts.length !== 2) {
      throw new InvalidReportIdError(rawId);
    }

    const s1 = parts.shift();
    let features;
    try {
      features = CompositeId.decode(s1);
    } catch (err) {
      if (err instanceof InvalidCompositeIdError) {
        throw new InvalidReportIdError(rawId);
      }
      throw err;
    }

    const selectionTypeStr = parts.shift();
    let selectionType;
    try {
      selectionType = LocationSelectionType.enumValueOf(selectionTypeStr);
    } catch (err) {
      if (err instanceof EnumValueError) {
        throw new InvalidReportIdError(rawId);
      }
      throw err;
    }

    const locations = await CentrelineDAO.byFeatures(features);
    const locationsSelection = { locations, selectionType };

    const featuresSelection = { features, selectionType };
    try {
      features = await FeatureResolver.byFeaturesSelection(featuresSelection);
    } catch (err) {
      if (err instanceof InvalidFeaturesSelectionError) {
        throw new InvalidReportIdError(rawId);
      }
      throw err;
    }

    return { features, locationsSelection };
  }

  async fetchRawData({ features }, collisionQuery) {
    if (this.collisionFactors === null) {
      this.collisionFactors = await CollisionFactorDAO.all();
    }
    const [collisions, collisionSummary] = await Promise.all([
      CollisionDAO.byCentreline(features, collisionQuery),
      CollisionDAO.byCentrelineSummary(features, collisionQuery),
    ]);
    return { collisions, collisionSummary };
  }

  async generateLayoutHeader({ locationsSelection }) {
    let info = getLocationsSelectionDescription(locationsSelection);
    /*
     * `pdfmake` only supports ANSI characters:
     *
     * https://pdfmake.github.io/docs/0.1/fonts/standard-14-fonts/
     *
     * To work around this, we replace the Unicode arrow used in corridor descriptions
     * with a more ANSI-friendly equivalent here.
     */
    info = info.replace('\u2192', '-');
    return { info, subinfo: '' };
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
