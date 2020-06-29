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
  const type = categories.get(CATEGORY_ID);
  return {
    ...studyRest,
    type,
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

function getCentrelineFilter(features) {
  const featureIds = features.map(
    ({ centrelineId, centrelineType }) => `(${centrelineType}, ${centrelineId})`,
  );
  const featureIdsStr = featureIds.join(', ');
  return `(centreline_type, centreline_id) IN (${featureIdsStr})`;
}

function getStudyFilters(features, studyQuery, categories) {
  const centrelineFilter = getCentrelineFilter(features);
  const filters = [centrelineFilter];
  const params = {};
  const {
    dateRange,
    daysOfWeek,
    hours,
    studyTypes,
  } = studyQuery;
  if (dateRange !== null) {
    params.dateRangeStart = dateRange.start;
    params.dateRangeEnd = dateRange.end;
    filters.push('start_date >= $(dateRangeStart)');
    filters.push('start_date < $(dateRangeEnd)');
  }
  if (daysOfWeek !== null) {
    params.daysOfWeek = daysOfWeek;
    filters.push('"daysOfWeek" && \'{$(daysOfWeek:csv)}\'');
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
    filters.push('"CATEGORY_ID" IN ($(categoryIds:csv))');
  }
  return { filters, params };
}

async function validateStudy(study, categories) {
  if (study === null) {
    return null;
  }
  const studyNormalized = normalizeStudy(study, categories);
  return Study.read.validateAsync(studyNormalized);
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
SELECT ${STUDIES_FIELDS}
WHERE "CATEGORY_ID" = $(categoryId)
AND count_group_id = $(countGroupId)`;
    const study = await db.oneOrNone(sql, { categoryId, countGroupId });
    const categories = await CategoryDAO.all();
    return validateStudy(study, categories);
  }

  static async byCentreline(features, studyQuery, pagination) {
    const studyQueryNormalized = normalizeStudyQuery(studyQuery);
    const categories = await CategoryDAO.all();
    const { filters, params } = getStudyFilters(features, studyQueryNormalized, categories);
    const studyFilters = filters.join('\n  AND ');

    const sql = `
  SELECT ${STUDIES_FIELDS}
  WHERE ${studyFilters}
  ORDER BY start_date DESC
  LIMIT $(limit) OFFSET $(offset)`;
    const rows = await db.manyOrNone(sql, {
      ...params,
      ...pagination,
    });
    return validateStudies(rows, categories);
  }

  static async byCentrelineSummary(features, studyQuery) {
    const studyQueryNormalized = normalizeStudyQuery(studyQuery);
    const categories = await CategoryDAO.all();
    const { filters, params } = getStudyFilters(features, studyQueryNormalized, categories);
    const studyFilters = filters.join('\n  AND ');

    const sqlMostRecent = `
SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY "CATEGORY_ID" ORDER BY start_date DESC) __row,
    ${STUDIES_FIELDS}
  WHERE ${studyFilters}
) x
WHERE x.__row = 1`;
    const sqlNumPerCategory = `
SELECT COUNT(*) AS n, "CATEGORY_ID"
FROM counts.studies
WHERE ${studyFilters}
GROUP BY "CATEGORY_ID"`;

    const [rowsMostRecent, rowsNumPerCategory] = await Promise.all([
      db.manyOrNone(sqlMostRecent, params),
      db.manyOrNone(sqlNumPerCategory, params),
    ]);

    const studies = await validateStudies(rowsMostRecent, categories);
    const mapNumPerCategory = new Map(
      rowsNumPerCategory.map(({ n, CATEGORY_ID }) => [CATEGORY_ID, n]),
    );
    return studies.map((mostRecent) => {
      const category = mostRecent.type;
      const n = mapNumPerCategory.get(category.id);
      return { category, mostRecent, n };
    });
  }

  static async byCentrelineTotal(features) {
    const centrelineFilter = getCentrelineFilter(features);
    const sql = `
SELECT COUNT(*) AS total
FROM counts.studies
WHERE ${centrelineFilter}`;
    const { total } = await db.one(sql);
    return total;
  }
}

export default StudyDAO;
