import { CardinalDirection, StudyHours, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import Count from '@/lib/model/Count';
import Joi from '@/lib/model/Joi';

/**
 * Defines the fields fetched for legacy non-TMC counts, and the tables that those
 * fields come from.
 *
 * @memberof CountDAO
 * @type {string}
 */
const COUNTINFO_LEGACY_FIELDS = `
  ci."COUNT_INFO_ID", ci."COUNT_DATE", ci."COMMENT_",
  ad."ARTERYCODE", ad."STAT_CODE", ac.direction
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN "TRAFFIC"."ARTERYDATA" ad ON ci."ARTERYCODE" = ad."ARTERYCODE"
  JOIN counts.arteries_centreline ac ON ci."ARTERYCODE" = ac.arterycode`;

/**
 * Defines the fields fetched for legacy TMC counts, and the tables that those
 * fields come from.
 *
 * @memberof CountDAO
 * @type {string}
 */
const COUNTINFOMICS_LEGACY_FIELDS = `
  cim."COUNT_INFO_ID", cim."COUNT_TYPE", cim."COUNT_DATE", cim."COMMENT_",
  ad."ARTERYCODE", ad."STAT_CODE"
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN "TRAFFIC"."ARTERYDATA" ad ON cim."ARTERYCODE" = ad."ARTERYCODE"`;

/**
 * Defines the fields fetched for non-legacy counts, using the `counts2` schema.
 *
 * @memberof CountDAO
 * @type {string}
 */
const COUNTINFO_FIELDS = `
  "id",
  "studyType",
  "hours",
  "date",
  "notes",
  "countLocationId",
  "direction",
  "extraMetadata"
  FROM counts2.count_info`;

/**
 * Convert a row fetched using {@link CountDAO.COUNTINFO_FIELDS} to a count
 * object as used by the MOVE frontend.
 *
 * @memberof CountDAO
 */
function countInfoLegacyToCount(row, study) {
  const {
    COUNT_INFO_ID: id,
    COUNT_DATE: date,
    COMMENT_: notes,
    direction: directionStr,
    ARTERYCODE: arteryCode,
    STAT_CODE: stationCode,
  } = row;
  const direction = CardinalDirection.enumValueOfSafe(directionStr, 'short');
  const notesNormalized = notes === null ? null : notes.trim();

  const { countLocationId, studyType } = study;

  return {
    id,
    legacy: true,
    studyType,
    hours: null,
    date,
    notes: notesNormalized,
    countLocationId,
    direction,
    extraMetadata: { arteryCode, stationCode },
  };
}

/**
 * Convert a row fetched using {@link CountDAO.COUNTINFOMICS_FIELDS} to a count
 * object as used by the MOVE frontend.
 *
 * @memberof CountDAO
 */
function countInfomicsLegacyToCount(row, study) {
  const {
    COUNT_INFO_ID: id,
    COUNT_DATE: date,
    COUNT_TYPE,
    COMMENT_: notes,
    ARTERYCODE: arteryCode,
    STAT_CODE: stationCode,
  } = row;
  const hours = StudyHours.enumValueOf(COUNT_TYPE, 'countType');
  const notesNormalized = notes === null ? null : notes.trim();

  const { countLocationId, studyType } = study;

  return {
    id,
    legacy: true,
    studyType,
    hours,
    date,
    notes: notesNormalized,
    countLocationId,
    direction: null,
    extraMetadata: { arteryCode, stationCode },
  };
}

function countInfoToCount(row) {
  const {
    direction: directionStr,
    ...rowRest
  } = row;
  const direction = CardinalDirection.enumValueOfSafe(directionStr, 'short');
  return { legacy: false, direction, ...rowRest };
}

async function validateCounts(counts) {
  const countsSchema = Joi.array().items(Count.read);
  return countsSchema.validateAsync(counts);
}

/**
 * Data access layer for count metadata.  You should not use this directly;
 * rather, use {@link StudyDAO} to access multi-day, multi-direction counts.
 *
 * Note also that `CountDAO` does *not* fetch the underlying count data;
 * for that, use {@link StudyDAO} to lookup the study, then pass that study
 * to {@link StudyDataDAO}.
 */
class CountDAO {
  // LEGACY TABLES

  /**
   * Fetch all non-TMC counts for the given study.
   *
   * @param {number} study - study to fetch non-TMC counts for
   */
  static async countInfoLegacyByStudy(study) {
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(countLocationId)
), count_info_ids AS (
  SELECT cmr."COUNT_INFO_ID"
  FROM counts.counts_multiday_runs cmr
  JOIN arterycodes a ON cmr."ARTERYCODE" = a.arterycode
  JOIN counts2.category_study_type cst USING ("CATEGORY_ID")
  WHERE cst."studyType" = $(studyType)
  AND cmr."COUNT_DATE" >= $(startDate)
  AND cmr."COUNT_DATE" <= $(endDate)
)
SELECT ${COUNTINFO_LEGACY_FIELDS}
JOIN count_info_ids cii ON ci."COUNT_INFO_ID" = cii."COUNT_INFO_ID"
ORDER BY ci."ARTERYCODE" ASC, ci."COUNT_DATE" ASC`;
    const {
      countLocationId,
      endDate,
      startDate,
      studyType,
    } = study;
    const rows = await db.manyOrNone(sql, {
      countLocationId,
      endDate,
      startDate,
      studyType,
    });
    const counts = rows.map(row => countInfoLegacyToCount(row, study));
    return validateCounts(counts);
  }

  /**
   * Fetch all TMC counts for the given study.
   *
   * @param {number} study - study to fetch TMC counts for
   */
  static async countInfomicsLegacyByStudy(study) {
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(countLocationId)
), count_info_ids AS (
  SELECT cmr."COUNT_INFO_ID"
  FROM counts.counts_multiday_runs cmr
  JOIN arterycodes a ON cmr."ARTERYCODE" = a.arterycode
  JOIN counts2.category_study_type cst USING ("CATEGORY_ID")
  WHERE cst."studyType" = $(studyType)
  AND cmr."COUNT_DATE" >= $(startDate)
  AND cmr."COUNT_DATE" <= $(endDate)
)
SELECT ${COUNTINFOMICS_LEGACY_FIELDS}
JOIN count_info_ids cii ON cim."COUNT_INFO_ID" = cii."COUNT_INFO_ID"
ORDER BY cim."ARTERYCODE" ASC, cim."COUNT_DATE" ASC`;
    const {
      countLocationId,
      endDate,
      startDate,
      studyType,
    } = study;
    const rows = await db.manyOrNone(sql, {
      countLocationId,
      endDate,
      startDate,
      studyType,
    });
    const counts = rows.map(row => countInfomicsLegacyToCount(row, study));
    return validateCounts(counts);
  }

  // NEW TABLES

  static async countInfoByStudy(study) {
    // TODO: support multi-count studies in `counts2` (#976)
    const { countGroupId: id } = study;
    const sql = `SELECT ${COUNTINFO_FIELDS} WHERE id = $(id)`;
    const rows = await db.manyOrNone(sql, { id });
    const counts = rows.map(countInfoToCount);
    return validateCounts(counts);
  }

  // COMBINED

  /**
   * Fetch all counts for the given study.
   *
   * @param {number} study - study to fetch counts for
   */
  static async byStudy(study) {
    const { legacy, studyType } = study;
    if (legacy) {
      if (studyType === StudyType.TMC) {
        return CountDAO.countInfomicsLegacyByStudy(study);
      }
      return CountDAO.countInfoLegacyByStudy(study);
    }
    return CountDAO.countInfoByStudy(study);
  }
}

export default CountDAO;
