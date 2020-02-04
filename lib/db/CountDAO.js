import { StudyHours, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CategoryDAO from '@/lib/db/CategoryDAO';
import Category from '@/lib/model/Category';
import Count from '@/lib/model/Count';
import Joi from '@/lib/model/Joi';

/**
 * Defines the fields fetched for non-TMC counts, and the tables that those
 * fields come from.
 *
 * @memberof CountDAO
 * @type {string}
 */
const COUNTINFO_FIELDS = `
  ci."COUNT_INFO_ID", ci."ARTERYCODE", ci."COUNT_DATE",
  ci."CATEGORY_ID", ci."COMMENT_",
  ad."LOCATION", ad."STAT_CODE",
  ac.centreline_id, ac.centreline_type, ST_AsGeoJSON(ac.geom)::json AS geom
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN "TRAFFIC"."ARTERYDATA" ad ON ci."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode`;

/**
 * Defines the fields fetched for TMC counts, and the tables that those
 * fields come from.
 *
 * @memberof CountDAO
 * @type {string}
 */
const COUNTINFOMICS_FIELDS = `
  cim."COUNT_INFO_ID", cim."ARTERYCODE", cim."COUNT_TYPE", cim."COUNT_DATE",
  cim."CATEGORY_ID", cim."COMMENT_",
  ad."LOCATION", ad."STAT_CODE",
  ac.centreline_id, ac.centreline_type, ST_AsGeoJSON(ac.geom)::json AS geom
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN "TRAFFIC"."ARTERYDATA" ad ON cim."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode`;

function toCategoryIds(studyTypes, categories) {
  const categoryIds = [];
  categories.forEach(({ studyType }, categoryId) => {
    if (studyTypes.includes(studyType)) {
      categoryIds.push(categoryId);
    }
  });
  return categoryIds;
}

/**
 * Convert a row fetched using {@link CountDAO.COUNTINFO_FIELDS} to a count
 * object as used by the MOVE frontend.
 *
 * @memberof CountDAO
 */
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

/**
 * Convert a row fetched using {@link CountDAO.COUNTINFOMICS_FIELDS} to a count
 * object as used by the MOVE frontend.
 *
 * @memberof CountDAO
 */
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
  const hours = StudyHours.enumValueOf(COUNT_TYPE, 'countType');
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

/**
 * Convert location and filtering parameters from count-fetching endpoints
 * to:
 *
 * - a list of SQL clauses containing filters for fetching non-TMC counts;
 * - an object containing parameters needed to resolve those filters.
 *
 * @memberof CountDAO
 */
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

/**
 * Convert location and filtering parameters from count-fetching endpoints
 * to:
 *
 * - a list of SQL clauses containing filters for fetching TMC counts;
 * - an object containing parameters needed to resolve those filters.
 *
 * @memberof CountDAO
 */
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
    params.countTypes = hours.map(({ countType }) => countType);
    filters.push('cim."COUNT_TYPE" IN ($(countTypes:csv))');
  }
  return { filters, params };
}

/**
 * Data access layer for count metadata.  Note that these do *not* fetch the
 * underlying count data; for that, use `CountDAO` to lookup relevant counts,
 * then pass those counts to {@link CountDataDAO} accessors.
 */
class CountDAO {
  // COUNTINFO

  /**
   * Fetch non-TMC counts that match the given filters, using the pagination parameters
   * `limit` and `offset`.
   *
   * @param {number} centrelineId - ID of centreline feature
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {string} studyType - type of study to fetch counts for
   * @param {Object} dateRange - fetch counts that fall in this date range
   * @param {DateTime} dateRange.start - fetch counts on or after this date
   * @param {DateTime} dateRange.end - fetch counts before this date
   * @param {Array<number>} daysOfWeek - fetch counts on these days of the week
   * @param {number} limit - page size for pagination
   * @param {number} offset - offset for pagination
   */
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

  /**
   * Fetch a summary of non-TMC counts that match the given filters.  For each study type,
   * this summary contains the number of matching counts, as well as the most recent count.
   *
   * @param {number} centrelineId - ID of centreline feature
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {Object} dateRange - fetch counts that fall in this date range
   * @param {DateTime} dateRange.start - fetch counts on or after this date
   * @param {DateTime} dateRange.end - fetch counts before this date
   * @param {Array<number>} daysOfWeek - fetch counts on these days of the week
   * @param {Array<string>} studyTypes - type of study to fetch counts for
   */
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

  /**
   * Fetch the non-TMC count with the given ID.
   *
   * @param {number} id - ID of count to fetch
   */
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

  /**
   * Fetch TMC counts that match the given filters, using the pagination parameters
   * `limit` and `offset`.
   *
   * @param {number} centrelineId - ID of centreline feature
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {Object} dateRange - fetch counts that fall in this date range
   * @param {DateTime} dateRange.start - fetch counts on or after this date
   * @param {DateTime} dateRange.end - fetch counts before this date
   * @param {Array<number>} daysOfWeek - fetch counts on these days of the week
   * @param {Array<StudyHours>} hours - fetch counts performed on these schedules
   * @param {number} limit - page size for pagination
   * @param {number} offset - offset for pagination
   */
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

  /**
   * Fetch a summary of TMC counts that match the given filters.  For each study type,
   * this summary contains the number of matching counts, as well as the most recent count.
   *
   * @param {number} centrelineId - ID of centreline feature
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {Object} dateRange - fetch counts that fall in this date range
   * @param {DateTime} dateRange.start - fetch counts on or after this date
   * @param {DateTime} dateRange.end - fetch counts before this date
   * @param {Array<number>} daysOfWeek - fetch counts on these days of the week
   * @param {Array<StudyHours>} hours - fetch counts performed on these schedules
   */
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

  /**
   * Fetch the TMC count with the given ID.
   *
   * @param {number} id - ID of count to fetch
   */
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

  /**
   * Fetch a summary of counts that match the given filters.  For each study type,
   * this summary contains the number of matching counts, as well as the most recent count.
   *
   * @param {number} centrelineId - ID of centreline feature
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {Object} dateRange - fetch counts that fall in this date range
   * @param {DateTime} dateRange.start - fetch counts on or after this date
   * @param {DateTime} dateRange.end - fetch counts before this date
   * @param {Array<number>} daysOfWeek - fetch counts on these days of the week
   * @param {Array<StudyHours>} hours - fetch counts performed on these schedules
   * @param {Array<string>} studyTypes - type of study to fetch counts for
   */
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
      const i = studyTypes.indexOf(StudyType.TMC);
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
    const summary = Array.prototype.concat.apply([], results);
    const summarySchema = Joi.array().items(
      Joi.object().keys({
        category: Category.read,
        count: Count.read,
        numPerCategory: Joi.number().integer().positive().required(),
      }),
    );
    return summarySchema.validateAsync(summary);
  }

  /**
   * Fetch counts that match the given filters, using the pagination parameters
   * `limit` and `offset`.
   *
   * @param {number} centrelineId - ID of centreline feature
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {string} studyType - type of study to fetch counts for
   * @param {Object} dateRange - fetch counts that fall in this date range
   * @param {DateTime} dateRange.start - fetch counts on or after this date
   * @param {DateTime} dateRange.end - fetch counts before this date
   * @param {Array<number>} daysOfWeek - fetch counts on these days of the week
   * @param {Array<StudyHours>} hours - fetch counts performed on these schedules
   * @param {number} limit - page size for pagination
   * @param {number} offset - offset for pagination
   */
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
    let counts;
    if (studyType === StudyType.TMC) {
      counts = await CountDAO.countInfomicsByCentreline(
        centrelineId,
        centrelineType,
        dateRange,
        daysOfWeek,
        hours,
        limit,
        offset,
      );
    } else {
      counts = await CountDAO.countInfoByCentreline(
        centrelineId,
        centrelineType,
        studyType,
        dateRange,
        daysOfWeek,
        limit,
        offset,
      );
    }
    const countsSchema = Joi.array().items(Count.read);
    return countsSchema.validateAsync(counts);
  }

  /**
   * Fetch the count with the given ID and category.
   *
   * TMC and non-TMC counts are stored in separate tables, so we use `categoryId` to
   * identify which table to look in.  The ID alone isn't enough, as there is some overlap
   * between `COUNT_INFO_ID` ranges in these tables.
   *
   * @param {number} id - ID of count to fetch
   * @param {number} categoryId - category of count to fetch
   */
  static async byIdAndCategory(id, categoryId) {
    const category = await CategoryDAO.byId(categoryId);
    if (category === undefined) {
      return null;
    }
    const { studyType } = category;
    if (studyType === StudyType.TMC) {
      return CountDAO.countInfomicsById(id);
    }
    return CountDAO.countInfoById(id);
  }
}

export default CountDAO;
