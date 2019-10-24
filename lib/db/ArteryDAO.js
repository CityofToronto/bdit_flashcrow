import { CardinalDirection } from '@/lib/Constants';
import db from '@/lib/db/db';

const ARTERYDATA_FIELDS = `
  ad."ARTERYCODE", ad."STAT_CODE",
  ad."STREET1", ad."STREET1TYPE", ad."STREET1DIR",
  ad."STREET2", ad."STREET2TYPE", ad."STREET2DIR",
  ad."STREET3", ad."STREET3TYPE", ad."STREET3DIR",
  ad."LOCATION", ad."SIDEOFINT",
  ac.geom, ac.centreline_id, ac.centreline_type
  FROM "TRAFFIC"."ARTERYDATA" ad
  JOIN prj_volume.artery_centreline ac ON ad."ARTERYCODE" = ac.arterycode`;

/**
 *
 * @param {?string} name (e.g. Lawrence)
 * @param {?string} type (e.g. Ave)
 * @param {?string} dir (e.g. W)
 * @returns {string} combined street name (e.g. Lawrence Ave W), or `null`
 * if `name` is empty
 */
function getCombinedStreet(name, type, dir) {
  if (!name) {
    return null;
  }
  let street = name;
  if (type) {
    street += ` ${type}`;
    if (dir) {
      street += ` ${dir}`;
    }
  }
  return street;
}

/**
 *
 * @param {string} sideOfIntersection - `"SIDEOFINT"` column from `"ARTERYDATA"` table
 * @returns direction of approach for the given side of intersection
 */
function getApproachDirection(sideOfIntersection) {
  switch (sideOfIntersection) {
    /*
     * Vehicles coming from the north side of the intersection are travelling
     * southbound into the intersection.
     */
    case 'N':
      return CardinalDirection.SOUTH;
    case 'E':
      return CardinalDirection.WEST;
    case 'S':
      return CardinalDirection.NORTH;
    case 'W':
      return CardinalDirection.EAST;
    default:
      return null;
  }
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
  SIDEOFINT: sideOfIntersection,
  centreline_id: centrelineId,
  centreline_type: centrelineType,
  geom,
}) {
  const approachDir = getApproachDirection(sideOfIntersection);
  const street1 = getCombinedStreet(street1Name, street1Type, street1Dir);
  const street2 = getCombinedStreet(street2Name, street2Type, street2Dir);
  const street3 = getCombinedStreet(street3Name, street3Type, street3Dir);
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

class ArteryDAO {
  static async byArteryCode(arteryCode) {
    const sql = `SELECT ${ARTERYDATA_FIELDS} WHERE "ARTERYCODE" = $(arteryCode)`;
    const row = await db.oneOrNone(sql, { arteryCode });
    if (row === null) {
      return null;
    }
    return arteryDataToArtery(row);
  }
}

export default ArteryDAO;
