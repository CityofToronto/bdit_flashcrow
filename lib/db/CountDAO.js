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

/*
 * TODO: DRY with Constants (or, better yet, put into database!)
 */
const Status = {
  RECENT: 0,
  OLD_3: 1,
  OLD_5: 2,
  NO_EXISTING_COUNT: 3,
  REQUEST_IN_PROGRESS: 4,
};

function getCountStatus(count) {
  const now = new Date().valueOf();
  const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
  if (count.date.valueOf() < threeYearsAgo) {
    return Status.OLD_3;
  }
  if (count.date.valueOf() < fiveYearsAgo) {
    return Status.OLD_5;
  }
  return Status.RECENT;
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
  const type = categories.get(CATEGORY_ID);
  // TODO: determine actual duration if possible
  const count = {
    id,
    arteryCode,
    stationCode,
    date,
    hours: null,
    duration: 24,
    type,
    locationDesc,
    centrelineId,
    centrelineType,
    geom,
  };
  count.status = getCountStatus(count);
  return count;
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
  const type = categories.get(CATEGORY_ID);
  const hours = getHours(COUNT_TYPE);
  const count = {
    id,
    arteryCode,
    stationCode,
    date,
    hours,
    duration: null,
    type,
    locationDesc,
    centrelineId,
    centrelineType,
    geom,
  };
  count.status = getCountStatus(count);
  return count;
}

// TODO: implement fetching of requested counts
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

  static async countInfoByCentreline(centrelineId, centrelineType) {
    const sql = `SELECT ${COUNTINFO_FIELDS}
  WHERE ac.centreline_id = $(centrelineId)
  AND ac.centreline_type = $(centrelineType)`;
    const rows = await db.manyOrNone(sql, { centrelineId, centrelineType });
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

  static async countInfomicsByCentreline(centrelineId, centrelineType) {
    const sql = `SELECT ${COUNTINFOMICS_FIELDS}
  WHERE ac.centreline_id = $(centrelineId)
  AND ac.centreline_type = $(centrelineType)`;
    const rows = await db.manyOrNone(sql, { centrelineId, centrelineType });
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

  static async byCentreline(centrelineId, centrelineType) {
    const [rowsCountInfo, rowsCountInfomics] = await Promise.all([
      CountDAO.countInfoByCentreline(centrelineId, centrelineType),
      CountDAO.countInfomicsByCentreline(centrelineId, centrelineType),
    ]);
    return rowsCountInfo.concat(rowsCountInfomics);
  }
}

module.exports = CountDAO;
