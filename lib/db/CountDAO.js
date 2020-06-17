import { StudyHours, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CategoryDAO from '@/lib/db/CategoryDAO';

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
  JOIN counts.arteries_centreline ac ON ci."ARTERYCODE" = ac.arterycode`;

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
  JOIN counts.arteries_centreline ac ON cim."ARTERYCODE" = ac.arterycode`;

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
 * Data access layer for count metadata.  You should not use this directly;
 * rather, use {@link StudyDAO} to access multi-day, multi-direction counts.
 *
 * Note also that `CountDAO` does *not* fetch the underlying count data;
 * for that, use {@link StudyDAO} to lookup the study, then pass that study
 * to {@link StudyDataDAO}.
 */
class CountDAO {
  // COUNTINFO

  /**
   * Fetch all non-TMC counts for the given study.
   *
   * @param {number} study - study to fetch non-TMC counts for
   */
  static async countInfoByStudy(study) {
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(arteryGroupId)
), count_info_ids AS (
  SELECT cmr."COUNT_INFO_ID"
  FROM counts.counts_multiday_runs cmr
  JOIN arterycodes a ON cmr."ARTERYCODE" = a.arterycode
  WHERE cmr."CATEGORY_ID" = $(categoryId)
  AND cmr."COUNT_DATE" >= $(startDate)
  AND cmr."COUNT_DATE" <= $(endDate)
)
SELECT ${COUNTINFO_FIELDS}
JOIN count_info_ids cii ON ci."COUNT_INFO_ID" = cii."COUNT_INFO_ID"
ORDER BY ci."ARTERYCODE" ASC, ci."COUNT_DATE" ASC`;
    const {
      arteryGroupId,
      endDate,
      startDate,
      type: { id: categoryId },
    } = study;
    const categories = await CategoryDAO.all();
    const rows = await db.manyOrNone(sql, {
      arteryGroupId,
      categoryId,
      endDate,
      startDate,
    });
    return rows.map(row => countInfoToCount(row, categories));
  }

  // COUNTINFOMICS

  /**
   * Fetch all TMC counts for the given study.
   *
   * @param {number} study - study to fetch TMC counts for
   */
  static async countInfomicsByStudy(study) {
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(arteryGroupId)
), count_info_ids AS (
  SELECT cmr."COUNT_INFO_ID"
  FROM counts.counts_multiday_runs cmr
  JOIN arterycodes a ON cmr."ARTERYCODE" = a.arterycode
  WHERE cmr."CATEGORY_ID" = $(categoryId)
  AND cmr."COUNT_DATE" >= $(startDate)
  AND cmr."COUNT_DATE" <= $(endDate)
)
SELECT ${COUNTINFOMICS_FIELDS}
JOIN count_info_ids cii ON cim."COUNT_INFO_ID" = cii."COUNT_INFO_ID"
ORDER BY cim."ARTERYCODE" ASC, cim."COUNT_DATE" ASC`;
    const {
      arteryGroupId,
      endDate,
      startDate,
      type: { id: categoryId },
    } = study;
    const categories = await CategoryDAO.all();
    const rows = await db.manyOrNone(sql, {
      arteryGroupId,
      categoryId,
      endDate,
      startDate,
    });
    return rows.map(row => countInfomicsToCount(row, categories));
  }

  // COMBINED

  /**
   * Fetch all counts for the given study.
   *
   * @param {number} study - study to fetch counts for
   */
  static async byStudy(study) {
    const { studyType } = study.type;
    if (studyType === StudyType.TMC) {
      return CountDAO.countInfomicsByStudy(study);
    }
    return CountDAO.countInfoByStudy(study);
  }
}

export default CountDAO;
