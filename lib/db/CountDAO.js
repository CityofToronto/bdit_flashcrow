import db from '@/lib/db/db';
import CategoryDAO from '@/lib/db/CategoryDAO';
import { StudyHours } from '@/lib/Constants';

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

function toCountType(studyHours) {
  switch (studyHours) {
    case StudyHours.ROUTINE:
      return 'R';
    case StudyHours.SCHOOL:
      return 'P';
    default:
      return '';
  }
}

function toStudyHours(countType) {
  switch (countType) {
    case 'R':
      return StudyHours.ROUTINE;
    case 'P':
      return StudyHours.SCHOOL;
    default:
      return StudyHours.OTHER;
  }
}

function toCategoryIds(studyTypes, categories) {
  const categoryIds = [];
  categories.forEach(({ value }, categoryId) => {
    if (studyTypes.includes(value)) {
      categoryIds.push(categoryId);
    }
  });
  return categoryIds;
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
  const notesNormalized = notes === null ? null : notes.trim();
  return {
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
    notes: notesNormalized,
    geom,
  };
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
  const hours = toStudyHours(COUNT_TYPE);
  return {
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
}

function getCountInfoFilters(
  centrelineId,
  centrelineType,
  dateRange,
  daysOfWeek,
  studyTypes,
  categories,
) {
  const params = { centrelineId, centrelineType };
  const filters = [
    'ac.centreline_id = $(centrelineId)',
    'ac.centreline_type = $(centrelineType)',
  ];
  if (dateRange !== null) {
    Object.assign(params, dateRange);
    filters.push('ci."COUNT_DATE" >= $(start)');
    filters.push('ci."COUNT_DATE" < $(end)');
  }
  if (daysOfWeek !== null) {
    params.daysOfWeek = daysOfWeek;
    filters.push('EXTRACT(DOW FROM ci."COUNT_DATE") IN ($(daysOfWeek:csv))');
  }
  if (studyTypes !== null) {
    const categoryIds = toCategoryIds(studyTypes, categories);
    params.categoryIds = categoryIds;
    filters.push('ci."CATEGORY_ID" IN ($(categoryIds:csv))');
  }
  return { filters, params };
}

function getCountInfomicsFilters(
  centrelineId,
  centrelineType,
  dateRange,
  daysOfWeek,
  hours,
) {
  const params = { centrelineId, centrelineType };
  const filters = [
    'ac.centreline_id = $(centrelineId)',
    'ac.centreline_type = $(centrelineType)',
  ];
  if (dateRange !== null) {
    Object.assign(params, dateRange);
    filters.push('cim."COUNT_DATE" >= $(start)');
    filters.push('cim."COUNT_DATE" < $(end)');
  }
  if (daysOfWeek !== null) {
    params.daysOfWeek = daysOfWeek;
    filters.push('EXTRACT(DOW FROM cim."COUNT_DATE") IN ($(daysOfWeek:csv))');
  }
  if (hours !== null) {
    params.countTypes = hours.map(toCountType);
    filters.push('cim."COUNT_TYPE" IN ($(countTypes:csv))');
  }
  return { filters, params };
}

class CountDAO {
  // COUNTINFO
  static async countInfoByCentreline(
    centrelineId,
    centrelineType,
    studyType,
    dateRange,
    daysOfWeek,
    limit,
    offset,
  ) {
    const categories = await CategoryDAO.all();
    const { filters, params } = getCountInfoFilters(
      centrelineId,
      centrelineType,
      dateRange,
      daysOfWeek,
      [studyType],
      categories,
    );
    const sqlFilters = filters.join('\n  AND ');

    params.limit = limit;
    params.offset = offset;
    const sql = `SELECT ${COUNTINFO_FIELDS}
  WHERE ${sqlFilters}
  ORDER BY ci."COUNT_DATE" DESC
  LIMIT $(limit) OFFSET $(offset)`;
    const rows = await db.manyOrNone(sql, params);
    return rows.map(row => countInfoToCount(row, categories));
  }

  static async countInfoByCentrelineSummary(
    centrelineId,
    centrelineType,
    dateRange,
    daysOfWeek,
    studyTypes,
  ) {
    const categories = await CategoryDAO.all();
    const { filters, params } = getCountInfoFilters(
      centrelineId,
      centrelineType,
      dateRange,
      daysOfWeek,
      studyTypes,
      categories,
    );
    const sqlFilters = filters.join('\n  AND ');

    const sqlMostRecent = `SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY ci."CATEGORY_ID" ORDER BY ci."COUNT_DATE" DESC) __row,
    ${COUNTINFO_FIELDS}
    WHERE ${sqlFilters}
  ) x WHERE x.__row = 1`;
    const rowsMostRecent = await db.manyOrNone(sqlMostRecent, params);

    const sqlNumPerCategory = `SELECT
  COUNT(*) AS n, ci."CATEGORY_ID"
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode
  WHERE ${sqlFilters}
  GROUP BY ci."CATEGORY_ID"`;
    const rowsNumPerCategory = await db.manyOrNone(sqlNumPerCategory, params);
    const mapNumPerCategory = new Map(
      rowsNumPerCategory.map(({ n, CATEGORY_ID }) => [CATEGORY_ID, n]),
    );

    return rowsMostRecent.map((row) => {
      const { CATEGORY_ID } = row;
      const category = categories.get(CATEGORY_ID);
      const count = countInfoToCount(row, categories);
      const numPerCategory = mapNumPerCategory.get(CATEGORY_ID);
      return { category, count, numPerCategory };
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
    daysOfWeek,
    hours,
    limit,
    offset,
  ) {
    const { filters, params } = getCountInfomicsFilters(
      centrelineId,
      centrelineType,
      dateRange,
      daysOfWeek,
      hours,
    );
    const sqlFilters = filters.join('\n  AND ');

    params.limit = limit;
    params.offset = offset;
    const sql = `SELECT ${COUNTINFOMICS_FIELDS}
  WHERE ${sqlFilters}
  ORDER BY cim."COUNT_DATE" DESC
  LIMIT $(limit) OFFSET $(offset)`;
    const rows = await db.manyOrNone(sql, params);
    const categories = await CategoryDAO.all();
    return rows.map(row => countInfomicsToCount(row, categories));
  }

  static async countInfomicsByCentrelineSummary(
    centrelineId,
    centrelineType,
    dateRange,
    daysOfWeek,
    hours,
  ) {
    const { filters, params } = getCountInfomicsFilters(
      centrelineId,
      centrelineType,
      dateRange,
      daysOfWeek,
      hours,
    );
    const sqlFilters = filters.join('\n  AND ');

    const sqlMostRecent = `SELECT * FROM (
      SELECT
        ROW_NUMBER() OVER (PARTITION BY cim."CATEGORY_ID" ORDER BY cim."COUNT_DATE" DESC) __row,
        ${COUNTINFOMICS_FIELDS}
        WHERE ${sqlFilters}
      ) x WHERE x.__row = 1`;
    const rowsMostRecent = await db.manyOrNone(sqlMostRecent, params);

    const sqlNumPerCategory = `SELECT
  COUNT(*) AS n, cim."CATEGORY_ID"
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode
  WHERE ${sqlFilters}
  GROUP BY cim."CATEGORY_ID"`;
    const rowsNumPerCategory = await db.manyOrNone(sqlNumPerCategory, params);
    const mapNumPerCategory = new Map(
      rowsNumPerCategory.map(({ n, CATEGORY_ID }) => [CATEGORY_ID, n]),
    );

    const categories = await CategoryDAO.all();
    return rowsMostRecent.map((row) => {
      const { CATEGORY_ID } = row;
      const category = categories.get(CATEGORY_ID);
      const count = countInfomicsToCount(row, categories);
      const numPerCategory = mapNumPerCategory.get(CATEGORY_ID);
      return { category, count, numPerCategory };
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

  static async byCentrelineSummary(
    centrelineId,
    centrelineType,
    dateRange,
    daysOfWeek,
    hours,
    studyTypes,
  ) {
    const tasks = [];
    if (studyTypes === null) {
      tasks.push(CountDAO.countInfoByCentrelineSummary(
        centrelineId,
        centrelineType,
        dateRange,
        daysOfWeek,
        studyTypes,
      ));
      tasks.push(CountDAO.countInfomicsByCentrelineSummary(
        centrelineId,
        centrelineType,
        dateRange,
        daysOfWeek,
        hours,
      ));
    } else {
      const studyTypesCopy = [...studyTypes];
      const i = studyTypes.indexOf('TMC');
      if (i !== -1) {
        tasks.push(CountDAO.countInfomicsByCentrelineSummary(
          centrelineId,
          centrelineType,
          dateRange,
          daysOfWeek,
          hours,
        ));
        studyTypesCopy.splice(i, 1);
      }
      if (studyTypesCopy.length > 0) {
        tasks.push(CountDAO.countInfoByCentrelineSummary(
          centrelineId,
          centrelineType,
          dateRange,
          daysOfWeek,
          studyTypes,
        ));
      }
    }
    const results = await Promise.all(tasks);
    return Array.prototype.concat.apply([], results);
  }

  static async byCentreline(
    centrelineId,
    centrelineType,
    studyType,
    dateRange,
    daysOfWeek,
    hours,
    limit,
    offset,
  ) {
    if (studyType === 'TMC') {
      return CountDAO.countInfomicsByCentreline(
        centrelineId,
        centrelineType,
        dateRange,
        daysOfWeek,
        hours,
        limit,
        offset,
      );
    }
    return CountDAO.countInfoByCentreline(
      centrelineId,
      centrelineType,
      studyType,
      dateRange,
      daysOfWeek,
      limit,
      offset,
    );
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
