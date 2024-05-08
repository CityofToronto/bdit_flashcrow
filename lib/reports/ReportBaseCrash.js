/* eslint-disable class-methods-use-this */
import { ReportBlock } from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import ReportBase from '@/lib/reports/ReportBase';
import { parseCollisionReportId } from '@/lib/reports/ReportIdParser';

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
    const { features, locationsSelection } = await parseCollisionReportId(rawId);
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

  async generateLayoutHeader({ locationsSelection }, options) {
    const description = getLocationsSelectionDescription(locationsSelection);
    /*
     * `pdfmake` only supports ANSI characters:
     *
     * https://pdfmake.github.io/docs/0.1/fonts/standard-14-fonts/
     *
     * To work around this, we replace the Unicode arrows and dashes used in corridor
     * descriptions with more ANSI-friendly equivalents here.
     */
    const info = description
      .replace('\u2013', '-')
      .replace('\u2192', '--');
    return { info, subinfo: '', ...options };
  }

  getCollisionFactorEntries(field) {
    const fieldEntries = this.collisionFactors.get(field);
    if (fieldEntries === undefined) {
      return null;
    }
    return fieldEntries;
  }

  getCollisionFactorEntry(field, value) {
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
        { cols: 3, name: 'Total', value: amount },
        { cols: 3, name: 'KSI', value: ksi },
        { cols: 3, name: 'Verified', value: validated },
      ],
    };
    return {
      type: ReportBlock.METADATA,
      options,
    };
  }
}

export default ReportBaseCrash;
