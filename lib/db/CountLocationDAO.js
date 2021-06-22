import { CardinalDirection } from '@/lib/Constants';
import db from '@/lib/db/db';
import ArteryDAO from '@/lib/db/ArteryDAO';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CountLocation from '@/lib/model/CountLocation';

const COUNT_LOCATION_FIELDS = `
  FALSE AS "legacy",
  cl."id",
  cl."description",
  cl."centrelineId",
  cl."centrelineType",
  ST_AsGeoJSON(cl."geom")::json AS "geom"
  FROM counts2.count_locations cl`;

const REGEX_DIRECTION_BOUND = / [NESW]\/B/;

async function validateCountLocation(countLocation) {
  if (countLocation === null) {
    return null;
  }
  return CountLocation.read.validateAsync(countLocation);
}

/**
 * Data access object for count locations, i.e. locations at which counts have been conducted.
 * This is used in the new `counts2` schema.
 *
 * To help transition from the now-deprecated {@link ArteryDAO} to this, we fetch both legacy
 * arterycodes and new `counts2.count_locations` records here, adapting the former into the same
 * data model as the latter.
 */
class CountLocationDAO {
  /**
   *
   * @param {string} direction - `direction` column from `counts.arteries_midblock_direction`
   * @returns direction of approach for the given side of intersection
   */
  static getApproachDirection(direction) {
    switch (direction) {
      case 'N':
        return CardinalDirection.NORTH;
      case 'E':
        return CardinalDirection.EAST;
      case 'S':
        return CardinalDirection.SOUTH;
      case 'W':
        return CardinalDirection.WEST;
      default:
        return null;
    }
  }

  static getArteryDescription(artery, location) {
    const { locationDesc } = artery;
    if (locationDesc === null) {
      return location.description;
    }
    return locationDesc.replace(REGEX_DIRECTION_BOUND, '');
  }

  /**
   *
   * @param {Object} study - legacy study to fetch count location for
   * @returns {Object}
   */
  static async byStudyLegacy(study) {
    const arteries = await ArteryDAO.byStudy(study);
    if (arteries.length === 0) {
      return null;
    }
    const [artery] = arteries;
    const location = await CentrelineDAO.byFeature(artery);
    const description = CountLocationDAO.getArteryDescription(artery, location);
    const {
      centrelineId,
      centrelineType,
      countLocationId,
      geom,
    } = study;
    const countLocation = {
      id: countLocationId,
      legacy: true,
      description,
      centrelineId,
      centrelineType,
      geom,
    };
    return validateCountLocation(countLocation);
  }

  /**
   *
   * @param {number} study - study to get count location for
   * @returns {Object}
   */
  static async byStudy(study) {
    if (study.legacy) {
      return CountLocationDAO.byStudyLegacy(study);
    }

    const sql = `
SELECT ${COUNT_LOCATION_FIELDS}
WHERE "id" = $(countLocationId)`;
    const countLocation = await db.oneOrNone(sql, study);
    return validateCountLocation(countLocation);
  }
}

export default CountLocationDAO;
