import db from '@/../lib/db/db';
import CategoryDAO from '@/../lib/db/CategoryDAO';
import { Status } from '@/lib/Constants';

const COUNTINFO_FIELDS_BYBOUNDINGBOX = `
  SELECT ac.centreline_id, ac.centreline_type, ad."LOCATION",
  ci."ARTERYCODE", ac.geom
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN "TRAFFIC"."ARTERYDATA" ad ON ci."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode`;
const COUNTINFOMICS_FIELDS_BYBOUNDINGBOX = `
  SELECT ac.centreline_id, ac.centreline_type, ad."LOCATION",
  cim."ARTERYCODE", ac.geom
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN "TRAFFIC"."ARTERYDATA" ad ON cim."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode`;
const COUNTINFO_FIELDS = `
  ci."COUNT_INFO_ID", ci."ARTERYCODE", ci."COUNT_DATE",
  ci."CATEGORY_ID", ci."COMMENT_",
  ad."LOCATION", ad."STAT_CODE",
  ac.centreline_id, ac.centreline_type, ST_AsGeoJSON(ac.geom)::json AS geom
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN "TRAFFIC"."ARTERYDATA" ad ON ci."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode`;
const COUNTINFOMICS_FIELDS = `
  cim."COUNT_INFO_ID", cim."ARTERYCODE", cim."COUNT_TYPE", cim."COUNT_DATE",
  cim."CATEGORY_ID", cim."COMMENT_",
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

function getCountStatus(count) {
  const now = new Date().valueOf();
  const countTimestamp = count.date.valueOf();
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
  if (countTimestamp < fiveYearsAgo) {
    return Status.OLD_5;
  }
  const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
  if (countTimestamp < threeYearsAgo) {
    return Status.OLD_3;
  }
  return Status.RECENT;
}

function countInfoToCount({
  COUNT_INFO_ID: id,
  ARTERYCODE: arteryCode,
  COUNT_DATE: date,
  CATEGORY_ID,
  COMMENT_: notes,
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
    notes,
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
  COMMENT_: notes,
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
    notes,
    geom,
  };
  count.status = getCountStatus(count);
  return count;
}

// TODO: implement fetching of requested counts
class CountDAO {
  // COUNTINFO
  static async countInfoByCentreline(
    centrelineId,
    centrelineType,
    dateRange,
    maxPerCategory,
  ) {
    const params = { centrelineId, centrelineType, maxPerCategory };
    let dateRangeSql = '';
    if (dateRange !== null) {
      Object.assign(params, dateRange);
      dateRangeSql = 'AND ci."COUNT_DATE" >= $(start) AND ci."COUNT_DATE" < $(end)';
    }
    const sql = `SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY ci."CATEGORY_ID" ORDER BY ci."COUNT_DATE" DESC) __row,
    ${COUNTINFO_FIELDS}
    WHERE ac.centreline_id = $(centrelineId)
    AND ac.centreline_type = $(centrelineType)
    ${dateRangeSql}
  ) x WHERE x.__row <= $(maxPerCategory)`;
    const rows = await db.manyOrNone(sql, params);
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfoToCount(row, categories));
  }

  static async countInfoByCentrelineNumPerCategory(
    centrelineId,
    centrelineType,
    dateRange,
  ) {
    const params = { centrelineId, centrelineType };
    let dateRangeSql = '';
    if (dateRange !== null) {
      Object.assign(params, dateRange);
      dateRangeSql = 'AND ci."COUNT_DATE" >= $(start) AND ci."COUNT_DATE" < $(end)';
    }
    const sql = `SELECT
  COUNT(*) AS n, ci."CATEGORY_ID"
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode
  WHERE ac.centreline_id = $(centrelineId)
  AND ac.centreline_type = $(centrelineType)
  ${dateRangeSql}
  GROUP BY ci."CATEGORY_ID"`;
    const rows = await db.manyOrNone(sql, params);
    const categories = await CategoryDAO.all();
    return rows.map(({ n, CATEGORY_ID }) => {
      const category = categories.get(CATEGORY_ID);
      return { n, category };
    });
  }

  static async countInfoById(id) {
    const sql = `SELECT ${COUNTINFO_FIELDS} WHERE ci."COUNT_INFO_ID" = $(id)`;
    const row = await db.oneOrNone(sql, { id });
    if (row === null) {
      return null;
    }
    const categories = await CategoryDAO.all();
    return countInfoToCount(row, categories);
  }

  // COUNTINFOMICS
  static async countInfomicsByCentreline(
    centrelineId,
    centrelineType,
    dateRange,
    maxPerCategory,
  ) {
    const params = { centrelineId, centrelineType, maxPerCategory };
    let dateRangeSql = '';
    if (dateRange !== null) {
      Object.assign(params, dateRange);
      dateRangeSql = 'AND cim."COUNT_DATE" >= $(start) AND cim."COUNT_DATE" < $(end)';
    }
    const sql = `SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY cim."CATEGORY_ID" ORDER BY cim."COUNT_DATE" DESC) __row,
    ${COUNTINFOMICS_FIELDS}
    WHERE ac.centreline_id = $(centrelineId)
    AND ac.centreline_type = $(centrelineType)
    ${dateRangeSql}
  ) x WHERE x.__row <= $(maxPerCategory)`;
    const rows = await db.manyOrNone(sql, params);
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfomicsToCount(row, categories));
  }

  static async countInfomicsByCentrelineNumPerCategory(
    centrelineId,
    centrelineType,
    dateRange,
  ) {
    const params = { centrelineId, centrelineType };
    let dateRangeSql = '';
    if (dateRange !== null) {
      Object.assign(params, dateRange);
      dateRangeSql = 'AND cim."COUNT_DATE" >= $(start) AND cim."COUNT_DATE" < $(end)';
    }
    const sql = `SELECT
  COUNT(*) AS n, cim."CATEGORY_ID"
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode
  WHERE ac.centreline_id = $(centrelineId)
  AND ac.centreline_type = $(centrelineType)
  ${dateRangeSql}
  GROUP BY cim."CATEGORY_ID"`;
    const rows = await db.manyOrNone(sql, params);
    const categories = await CategoryDAO.all();
    return rows.map(({ n, CATEGORY_ID }) => {
      const category = categories.get(CATEGORY_ID);
      return { n, category };
    });
  }

  static async countInfomicsById(id) {
    const sql = `SELECT ${COUNTINFOMICS_FIELDS} WHERE cim."COUNT_INFO_ID" = $(id)`;
    const row = await db.oneOrNone(sql, { id });
    if (row === null) {
      return null;
    }
    const categories = await CategoryDAO.all();
    return countInfomicsToCount(row, categories);
  }

  // COMBINED
  static async byBoundingBox(xmin, ymin, xmax, ymax) {
    if (xmin >= xmax || ymin >= ymax) {
      return [];
    }
    const sql = `SELECT centreline_id "centrelineId", centreline_type "centrelineType",
    "LOCATION" locationDesc, COUNT(*) cnt,
    "ARTERYCODE", ST_AsGeoJSON(geom)::json AS geom,
    CONCAT(centreline_type, centreline_id) as id
    FROM
    ( ${COUNTINFO_FIELDS_BYBOUNDINGBOX}
    WHERE ac.geom @ ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 4326)
    UNION ALL
    ${COUNTINFOMICS_FIELDS_BYBOUNDINGBOX}
    WHERE ac.geom @ ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 4326)
    ) AS x
    GROUP BY "ARTERYCODE", "LOCATION", centreline_id, centreline_type, geom`;
    const rows = await db.manyOrNone(sql, {
      xmin,
      ymin,
      xmax,
      ymax,
    });
    return rows;
  }

  static async byCentrelineNumPerCategory(centrelineId, centrelineType, dateRange) {
    const [countInfoNumPerCategory, countInfomicsNumPerCategory] = await Promise.all([
      CountDAO.countInfoByCentrelineNumPerCategory(
        centrelineId,
        centrelineType,
        dateRange,
      ),
      CountDAO.countInfomicsByCentrelineNumPerCategory(
        centrelineId,
        centrelineType,
        dateRange,
      ),
    ]);
    return countInfoNumPerCategory.concat(countInfomicsNumPerCategory);
  }

  static async byCentreline(
    centrelineId,
    centrelineType,
    dateRange,
    maxPerCategory,
  ) {
    const [rowsCountInfo, rowsCountInfomics] = await Promise.all([
      CountDAO.countInfoByCentreline(
        centrelineId,
        centrelineType,
        dateRange,
        maxPerCategory,
      ),
      CountDAO.countInfomicsByCentreline(
        centrelineId,
        centrelineType,
        dateRange,
        maxPerCategory,
      ),
    ]);
    return rowsCountInfo.concat(rowsCountInfomics);
  }

  static async byIdAndCategory(id, categoryId) {
    const type = await CategoryDAO.byId(categoryId);
    if (type === undefined) {
      return null;
    }
    if (type.value === 'TMC') {
      return CountDAO.countInfomicsById(id);
    }
    return CountDAO.countInfoById(id);
  }
}

export default CountDAO;
