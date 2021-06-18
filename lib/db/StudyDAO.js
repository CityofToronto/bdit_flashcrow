import { centrelineKey, StudyType } from '@/lib/Constants';
import { setdefault } from '@/lib/MapUtils';
import db from '@/lib/db/db';
import {
  getCentrelineFilter,
  getStudyFilters,
} from '@/lib/db/filters/StudyFiltersSql';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';

const STUDIES_FIELDS = `
  "legacy",
  "countLocationId",
  "studyType",
  "countGroupId",
  "startDate",
  "endDate",
  "duration",
  "daysOfWeek",
  "hours",
  "centrelineType",
  "centrelineId",
  ST_AsGeoJSON("geom")::json AS geom
  FROM counts2.studies`;

function normalizeStudy(study) {
  const { __row, ...studyRest } = study;
  return { ...studyRest };
}

async function validateStudy(study) {
  if (study === null) {
    return null;
  }
  const studyNormalized = normalizeStudy(study);
  return Study.read.validateAsync(studyNormalized);
}

async function validateStudies(studies) {
  const studiesNormalized = studies.map(normalizeStudy);
  const studiesSchema = Joi.array().items(Study.read);
  return studiesSchema.validateAsync(studiesNormalized);
}

/**
 * Data access object for "studies".  A study is a set of one or more counts conducted at the same
 * location, on the same set of consecutive days, and for the same purpose.
 *
 * For some study types (e.g. TMC, Ped Delays), studies will only contain a single count.  For
 * others (e.g. ATRs), studies can contain several counts: for instance, a volume ATR study might
 * take place over 3 days on an East-West road with traffic in both directions, for a total of 6
 * counts.
 */
class StudyDAO {
  /**
   * @deprecated
   */
  static async byCategoryAndCountGroup(categoryId, countGroupId) {
    const sql = `
SELECT ${STUDIES_FIELDS}
JOIN counts2.category_study_type cst USING ("studyType")
WHERE cst."CATEGORY_ID" = $(categoryId)
AND "countGroupId" = $(countGroupId)`;
    const study = await db.oneOrNone(sql, { categoryId, countGroupId });
    return validateStudy(study);
  }

  static async byStudyTypeAndCountGroup(studyType, countGroupId) {
    const sql = `
SELECT ${STUDIES_FIELDS}
WHERE "studyType" = $(studyType)
AND "countGroupId" = $(countGroupId)`;
    const study = await db.oneOrNone(sql, { countGroupId, studyType });
    return validateStudy(study);
  }

  static async byCentreline(features, studyQuery, pagination) {
    const { filters, params } = getStudyFilters(features, studyQuery);
    const studyFilters = filters.join('\n  AND ');

    const sql = `
  SELECT ${STUDIES_FIELDS}
  WHERE ${studyFilters}
  ORDER BY "startDate" DESC
  LIMIT $(limit) OFFSET $(offset)`;
    const rows = await db.manyOrNone(sql, {
      ...params,
      ...pagination,
    });
    return validateStudies(rows);
  }

  static async byCentrelineSummary(features, studyQuery) {
    const { filters, params } = getStudyFilters(features, studyQuery);
    const studyFilters = filters.join('\n  AND ');

    const sqlMostRecent = `
SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY "studyType" ORDER BY "startDate" DESC) __row,
    ${STUDIES_FIELDS}
  WHERE ${studyFilters}
) x
WHERE x.__row = 1`;
    const sqlNumPerStudyType = `
SELECT COUNT(*) AS n, "studyType"
FROM counts2.studies
WHERE ${studyFilters}
GROUP BY "studyType"`;

    const [rowsMostRecent, rowsNumPerStudyType] = await Promise.all([
      db.manyOrNone(sqlMostRecent, params),
      db.manyOrNone(sqlNumPerStudyType, params),
    ]);

    const studies = await validateStudies(rowsMostRecent);
    const mapNumPerStudyType = new Map(
      rowsNumPerStudyType.map(({ n, studyType }) => [studyType, n]),
    );
    return studies.map((mostRecent) => {
      const { studyType } = mostRecent;
      const n = mapNumPerStudyType.get(studyType.name);
      return { mostRecent, n, studyType };
    });
  }

  static async byCentrelineSummaryPerLocation(features, studyQuery) {
    const { filters, params } = getStudyFilters(features, studyQuery);
    const studyFilters = filters.join('\n  AND ');

    const sqlMostRecent = `
SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (
      PARTITION BY "studyType", "centrelineType", "centrelineId"
      ORDER BY "startDate" DESC
    ) __row,
    ${STUDIES_FIELDS}
  WHERE ${studyFilters}
) x
WHERE x.__row = 1`;
    const sqlNumPerStudyType = `
SELECT COUNT(*) AS n,
"studyType",
"centrelineType",
"centrelineId"
FROM counts2.studies
WHERE ${studyFilters}
GROUP BY "studyType", "centrelineType", "centrelineId"`;

    const [rowsMostRecent, rowsNumPerStudyType] = await Promise.all([
      db.manyOrNone(sqlMostRecent, params),
      db.manyOrNone(sqlNumPerStudyType, params),
    ]);

    const studies = await validateStudies(rowsMostRecent);
    const setStudyTypes = new Set();
    const mapStudiesPerStudyTypeAndLocation = new Map();
    studies.forEach((study) => {
      const { centrelineId, centrelineType, studyType } = study;
      setStudyTypes.add(studyType);

      const mapStudiesPerLocation = setdefault(
        mapStudiesPerStudyTypeAndLocation,
        studyType,
        new Map(),
      );
      const feature = { centrelineId, centrelineType };
      const key = centrelineKey(feature);
      mapStudiesPerLocation.set(key, study);
    });

    const mapNumPerStudyTypeAndLocation = new Map();
    rowsNumPerStudyType.forEach(({
      centrelineId,
      centrelineType,
      studyType: studyTypeName,
      n,
    }) => {
      const studyType = StudyType.enumValueOf(studyTypeName);
      const mapNumPerLocation = setdefault(
        mapNumPerStudyTypeAndLocation,
        studyType,
        new Map(),
      );
      const feature = { centrelineId, centrelineType };
      const key = centrelineKey(feature);
      mapNumPerLocation.set(key, n);
    });

    const studyTypesWithStudies = Array.from(setStudyTypes);
    return studyTypesWithStudies.map((studyType) => {
      const mapStudiesPerLocation = mapStudiesPerStudyTypeAndLocation.get(studyType);
      const mapNumPerLocation = mapNumPerStudyTypeAndLocation.get(studyType);
      const perLocation = features.map((feature) => {
        const key = centrelineKey(feature);
        if (mapStudiesPerLocation.has(key)) {
          const mostRecent = mapStudiesPerLocation.get(key);
          const n = mapNumPerLocation.get(key);
          return { mostRecent, n };
        }
        return { mostRecent: null, n: 0 };
      });
      return { perLocation, studyType };
    });
  }

  static async byCentrelineTotal(features) {
    const centrelineFilter = getCentrelineFilter(features);
    const sql = `
SELECT COUNT(*) AS total
FROM counts2.studies
WHERE ${centrelineFilter}`;
    const { total } = await db.one(sql);
    return total;
  }
}

export default StudyDAO;
