import { CardinalDirection } from '@/lib/Constants';
import { formatCombinedStreet } from '@/lib/StringFormatters';
import db from '@/lib/db/db';

/**
 * Data access object for "arteries", which represent locations at which counts
 * were conducted.
 *
 * While it's usually enough to access counts, sometimes you need the additional
 * metadata (e.g. direction of travel) stored here.  For instance, {@link ReportCountSummary24h}
 * uses this metadata as part of the 24-Hour Count Summary Report.
 */
class ArteryDAO {
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

  /**
   *
   * @param {Object} arteryData - row from `"TRAFFIC"."ARTERYDATA"` table, with
   * some additional fields from `counts.arteries_centreline`
   * @returns normalized artery
   */
  static arteryDataToArtery({
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
    const approachDir = ArteryDAO.getApproachDirection(direction);
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
   *
   * @param {number} arteryCode - code to fetch artery for
   */
  static async byArteryCode(arteryCode) {
    const sql = `SELECT ${ArteryDAO.ARTERYDATA_FIELDS} WHERE "ARTERYCODE" = $(arteryCode)`;
    const row = await db.oneOrNone(sql, { arteryCode });
    if (row === null) {
      return null;
    }
    return ArteryDAO.arteryDataToArtery(row);
  }

  static async byStudy(study) {
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(arteryGroupId)
)
SELECT ${ArteryDAO.ARTERYDATA_FIELDS}
JOIN arterycodes a ON ad."ARTERYCODE" = a.arterycode`;
    const { arteryGroupId } = study;
    const rows = await db.manyOrNone(sql, { arteryGroupId });
    return rows.map(ArteryDAO.arteryDataToArtery);
  }
}

/**
 * @type {string}
 */
ArteryDAO.ARTERYDATA_FIELDS = `
  ad."ARTERYCODE", ad."STAT_CODE",
  ad."STREET1", ad."STREET1TYPE", ad."STREET1DIR",
  ad."STREET2", ad."STREET2TYPE", ad."STREET2DIR",
  ad."STREET3", ad."STREET3TYPE", ad."STREET3DIR",
  ad."LOCATION", ac.direction,
  ST_AsGeoJSON(ac.geom)::json AS geom, ac.centreline_id, ac.centreline_type
  FROM "TRAFFIC"."ARTERYDATA" ad
  JOIN counts.arteries_centreline ac ON ad."ARTERYCODE" = ac.arterycode`;

export default ArteryDAO;
