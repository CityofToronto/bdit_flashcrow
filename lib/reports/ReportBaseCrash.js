/* eslint-disable class-methods-use-this */
import {
  LocationSelectionType,
  MAX_LOCATIONS,
  ReportBlock,
} from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import RoutingDAO from '@/lib/db/RoutingDAO';
import {
  EnumValueError,
  InvalidCompositeIdError,
  InvalidReportIdError,
} from '@/lib/error/MoveErrors';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
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
    let locations;
    try {
      const features = CompositeId.decode(s1);
      if (features.length > MAX_LOCATIONS) {
        throw new InvalidReportIdError(rawId);
      }
      locations = await CentrelineDAO.byFeatures(features);
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

    const locationsSelection = { locations, selectionType };
    if (selectionType === LocationSelectionType.CORRIDOR) {
      const features = await RoutingDAO.routeCorridor(locations);
      if (features === null) {
        throw new InvalidReportIdError(rawId);
      }
      if (features.length > CompositeId.MAX_FEATURES) {
        throw new InvalidReportIdError(rawId);
      }
      locations = await CentrelineDAO.byFeatures(features);
    }

    return { locations, locationsSelection };
  }

  async fetchRawData({ locations }, collisionQuery) {
    if (this.collisionFactors === null) {
      this.collisionFactors = await CollisionFactorDAO.all();
    }
    const [collisions, collisionSummary] = await Promise.all([
      CollisionDAO.byCentreline(locations, collisionQuery),
      CollisionDAO.byCentrelineSummary(locations, collisionQuery),
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
    info = info.replace('\u2192', 'to');
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
