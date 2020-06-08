import db from '@/lib/db/db';
import CategoryDAO from '@/lib/db/CategoryDAO';
import { InvalidStudyQueryError } from '@/lib/error/MoveErrors';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';

const STUDIES_FIELDS = `
  artery_group_id AS "arteryGroupId",
  "CATEGORY_ID",
  centreline_id AS "centrelineId",
  centreline_type AS "centrelineType",
  count_group_id AS "countGroupId",
  duration,
  "daysOfWeek",
  end_date AS "endDate",
  ST_AsGeoJSON(geom)::json AS geom,
  hours,
  start_date AS "startDate"
  FROM counts.studies`;

function toStudyType(categoryId, categories) {
  const category = categories.get(categoryId);
  if (category === undefined) {
    return null;
  }
  return category.studyType;
}

function toCategoryIds(studyTypes, categories) {
  const categoryIds = [];
  categories.forEach(({ studyType }, categoryId) => {
    if (studyTypes.includes(studyType)) {
      categoryIds.push(categoryId);
    }
  });
  return categoryIds;
}

function normalizeStudy(study, categories) {
  const {
    __row,
    CATEGORY_ID,
    ...studyRest
  } = study;
  const studyType = toStudyType(CATEGORY_ID, categories);
  return {
    ...studyRest,
    studyType,
  };
}

function normalizeStudyQuery(studyQuery) {
  const {
    dateRangeEnd,
    dateRangeStart,
    ...studyQueryRest
  } = studyQuery;
  let dateRange = null;
  if (dateRangeStart !== undefined && dateRangeEnd !== undefined) {
    if (dateRangeStart.valueOf() > dateRangeEnd.valueOf()) {
      throw new InvalidStudyQueryError('invalid date range: start is after end');
    }
    dateRange = { start: dateRangeStart, end: dateRangeEnd };
  }
  return {
    ...studyQueryRest,
    dateRange,
  };
}

function getStudyFilters({
  centrelineType,
  centrelineId,
  dateRange,
  daysOfWeek,
  hours,
  studyTypes,
}, categories) {
  const params = { centrelineId, centrelineType };
  const filters = [
    'centreline_id = $(centrelineId)',
    'centreline_type = $(centrelineType)',
  ];
  if (dateRange !== null) {
    params.dateRangeStart = dateRange.start;
    params.dateRangeEnd = dateRange.end;
    filters.push('start_date >= $(dateRangeStart)');
    filters.push('start_date < $(dateRangeEnd)');
  }
  if (daysOfWeek !== null) {
    params.daysOfWeek = daysOfWeek;
    filters.push('"daysOfWeek" && {$(daysOfWeek:csv)}');
  }
  if (hours !== null) {
    params.hours = hours;
    filters.push('hours IN ($(hours:csv))');
  }
  if (studyTypes !== null) {
    const categoryIds = toCategoryIds(studyTypes, categories);
    if (categoryIds.length === 0) {
      return null;
    }
    params.categoryIds = categoryIds;
    filters.push('ci."CATEGORY_ID" IN ($(categoryIds:csv))');
  }
  return { filters, params };
}

async function validateStudies(studies, categories) {
  const studiesNormalized = studies.map(
    study => normalizeStudy(study, categories),
  );
  const studiesSchema = Joi.array().items(Study.read);
  return studiesSchema.validateAsync(studiesNormalized);
}

class StudyDAO {
  static async byCategoryAndCountGroup(categoryId, countGroupId) {
    const sql = `
SELECT * FROM counts.studies
WHERE "CATEGORY_ID" = $(categoryId)
AND count_group_id = $(countGroupId)`;
    const row = await db.oneOrNone(sql, { categoryId, countGroupId });
    if (row === null) {
      return null;
    }
    // TODO: what do we return here?
    return row;
  }

  /*
  static async byCentreline(studyQuery) {

  }
  */

  static async byCentrelineSummary(studyQuery) {
    const studyQueryNormalized = normalizeStudyQuery(studyQuery);
    const categories = await CategoryDAO.all();
    const { filters, params } = getStudyFilters(studyQueryNormalized, categories);
    const sqlFilters = filters.join('\n  AND ');

    const sqlMostRecent = `
SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY "CATEGORY_ID" ORDER BY start_date DESC) __row,
    ${STUDIES_FIELDS}
  WHERE ${sqlFilters}
) x
WHERE x.__row = 1`;
    const sqlNumPerCategory = `
SELECT COUNT(*) AS n, "CATEGORY_ID"
FROM counts.studies
WHERE ${sqlFilters}
GROUP BY "CATEGORY_ID"`;

    const [rowsMostRecent, rowsNumPerCategory] = await Promise.all([
      db.manyOrNone(sqlMostRecent, params),
      db.manyOrNone(sqlNumPerCategory, params),
    ]);

    const studies = await validateStudies(rowsMostRecent, categories);
    const mapNumPerStudyType = new Map(
      rowsNumPerCategory.map(({ n, CATEGORY_ID }) => {
        const studyType = toStudyType(CATEGORY_ID, categories);
        return [studyType, n];
      }),
    );
    return studies.map((study) => {
      const { studyType } = study;
      const n = mapNumPerStudyType.get(studyType);
      return { studyType, study, n };
    });
  }

  static async byCentrelineTotal(centrelineType, centrelineId) {
    const params = { centrelineId, centrelineType };
    const sql = `
SELECT COUNT(*) AS total
FROM counts.studies
WHERE centreline_type = $(centrelineType)
AND centreline_id = $(centrelineId)`;
    const { total } = await db.one(sql, params);
    return total;
  }
}

export default StudyDAO;
