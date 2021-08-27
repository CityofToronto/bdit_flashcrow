import { CardinalDirection } from '@/lib/Constants';
import { formatCombinedStreet } from '@/lib/StringFormatters';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CountLocation from '@/lib/model/CountLocation';

const ARTERYDATA_FIELDS = `
  ad."ARTERYCODE", ad."STAT_CODE",
  ad."STREET1", ad."STREET1TYPE", ad."STREET1DIR",
  ad."STREET2", ad."STREET2TYPE", ad."STREET2DIR",
  ad."STREET3", ad."STREET3TYPE", ad."STREET3DIR",
  ad."LOCATION", ac.direction,
  ST_AsGeoJSON(ac.geom)::json AS geom, ac.centreline_id, ac.centreline_type
  FROM "TRAFFIC"."ARTERYDATA" ad
  JOIN counts.arteries_centreline ac ON ad."ARTERYCODE" = ac.arterycode`;

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

function arteryDataToArtery({
  ARTERYCODE: arteryCode,
  STREET1: street1Name,
  STREET1TYPE: street1Type,
  STREET1DIR: street1Dir,
  STREET2: street2Name,
  STREET2TYPE: street2Type,
  STREET2DIR: street2Dir,
  /*
   * Wondering how three streets can intersect?  One example is Midland Ave
   * and Marcos Blvd / Romulus Dr in Scarborough - here a roadway has different
   * names on each side of an intersection.  This is not entirely uncommon,
   * especially for older roads at pre-amalgamation municipality boundaries.
   */
  STREET3: street3Name,
  STREET3TYPE: street3Type,
  STREET3DIR: street3Dir,
  LOCATION: locationDesc,
  STAT_CODE: stationCode,
  centreline_id: centrelineId,
  centreline_type: centrelineType,
  direction,
  geom,
}) {
  const approachDir = CardinalDirection.enumValueOfSafe(direction, 'short');
  const street1 = formatCombinedStreet(street1Name, street1Type, street1Dir);
  const street2 = formatCombinedStreet(street2Name, street2Type, street2Dir);
  const street3 = formatCombinedStreet(street3Name, street3Type, street3Dir);
  return {
    approachDir,
    arteryCode,
    centrelineId,
    centrelineType,
    geom,
    locationDesc,
    stationCode,
    street1,
    street2,
    street3,
  };
}

/**
 * Data access object for count locations, i.e. locations at which counts have been conducted.
 * This is used in the new `counts2` schema.
 *
 * We fetch both legacy arterycodes and new `counts2.count_locations` records here, adapting the
 * former into the same data model as the latter.
 */
class CountLocationDAO {
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
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(countLocationId)
)
SELECT ${ARTERYDATA_FIELDS}
JOIN arterycodes a ON ad."ARTERYCODE" = a.arterycode
ORDER BY a.arterycode ASC`;
    const rows = await db.manyOrNone(sql, study);
    const arteries = rows.map(arteryDataToArtery);
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
