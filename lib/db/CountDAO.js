const db = require('./db');
const CategoryDAO = require('./CategoryDAO');

const COUNTINFO_FIELDS = `
  ci."COUNT_INFO_ID", ci."ARTERYCODE", ci."COUNT_DATE", ci."CATEGORY_ID",
  ad."LOCATION", ad."STAT_CODE",
  ac.centreline_id, ac.centreline_type, ST_AsGeoJSON(ac.geom)::json AS geom
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN "TRAFFIC"."ARTERYDATA" ad ON ci."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode`;
const COUNTINFOMICS_FIELDS = `
  cim."COUNT_INFO_ID", cim."ARTERYCODE", cim."COUNT_TYPE", cim."COUNT_DATE", cim."CATEGORY_ID",
  ad."LOCATION", ad."STAT_CODE",
  ac.centreline_id, ac.centreline_type, ST_AsGeoJSON(ac.geom)::json AS geom
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN "TRAFFIC"."ARTERYDATA" ad ON cim."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode`;

function getHours(countType) {
  switch (countType) {
    case 'R':
      return 'ROUTINE';
    case 'P':
      return 'SCHOOL';
    default:
      return 'OTHER';
  }
}

function countInfoToCount({
  COUNT_INFO_ID: id,
  ARTERYCODE: arteryCode,
  COUNT_DATE: date,
  CATEGORY_ID,
  LOCATION: locationDesc,
  STAT_CODE: stationCode,
  centreline_id: centrelineId,
  centreline_type: centrelineType,
  geom,
}, categories) {
  const category = categories.get(CATEGORY_ID);
  // TODO: determine actual duration if possible
  return {
    id,
    arteryCode,
    stationCode,
    date,
    hours: null,
    duration: 24,
    category,
    locationDesc,
    centrelineId,
    centrelineType,
    geom,
  };
}

function countInfomicsToCount({
  COUNT_INFO_ID: id,
  ARTERYCODE: arteryCode,
  COUNT_DATE: date,
  COUNT_TYPE,
  CATEGORY_ID,
  LOCATION: locationDesc,
  STAT_CODE: stationCode,
  centreline_id: centrelineId,
  centreline_type: centrelineType,
  geom,
}, categories) {
  const category = categories.get(CATEGORY_ID);
  const hours = getHours(COUNT_TYPE);
  return {
    id,
    arteryCode,
    stationCode,
    date,
    hours,
    duration: null,
    category,
    locationDesc,
    centrelineId,
    centrelineType,
    geom,
  };
}

class CountDAO {
  // COUNTINFO
  static async countInfoByBoundingBox(xmin, ymin, xmax, ymax) {
    const sql = `SELECT ${COUNTINFO_FIELDS}
  WHERE ac.geom @ ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 4326)`;
    const rows = await db.manyOrNone(sql, {
      xmin,
      ymin,
      xmax,
      ymax,
    });
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfoToCount(row, categories));
  }

  static async countInfoByCentrelineId(centrelineId) {
    const sql = `SELECT ${COUNTINFO_FIELDS}
  WHERE ac.centreline_id = $(centrelineId)`;
    const rows = await db.manyOrNone(sql, { centrelineId });
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfoToCount(row, categories));
  }

  // COUNTINFOMICS
  static async countInfomicsByBoundingBox(xmin, ymin, xmax, ymax) {
    const sql = `SELECT ${COUNTINFOMICS_FIELDS}
  WHERE ac.geom @ ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 4326)`;
    const rows = await db.manyOrNone(sql, {
      xmin,
      ymin,
      xmax,
      ymax,
    });
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfomicsToCount(row, categories));
  }

  static async countInfomicsByCentrelineId(centrelineId) {
    const sql = `SELECT ${COUNTINFOMICS_FIELDS}
  WHERE ac.centreline_id = $(centrelineId)`;
    const rows = await db.manyOrNone(sql, { centrelineId });
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfomicsToCount(row, categories));
  }

  // COMBINED
  static async byBoundingBox(xmin, ymin, xmax, ymax) {
    const [rowsCountInfo, rowsCountInfomics] = await Promise.all([
      CountDAO.countInfoByBoundingBox(xmin, ymin, xmax, ymax),
      CountDAO.countInfomicsByBoundingBox(xmin, ymin, xmax, ymax),
    ]);
    return rowsCountInfo.concat(rowsCountInfomics);
  }

  static async byCentrelineId(centrelineId) {
    const [rowsCountInfo, rowsCountInfomics] = await Promise.all([
      CountDAO.countInfoByCentrelineId(centrelineId),
      CountDAO.countInfomicsByCentrelineId(centrelineId),
    ]);
    return rowsCountInfo.concat(rowsCountInfomics);
  }
}

module.exports = CountDAO;
