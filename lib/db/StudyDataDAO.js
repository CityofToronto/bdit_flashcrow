import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';

function normalizeCntDetRow({
  COUNT_INFO_ID: countInfoId,
  TIMECOUNT: t,
  ...data
}) {
  return { countInfoId, t, data };
}

function normalizeDetRow({
  ID,
  COUNT_INFO_ID: countInfoId,
  COUNT_TIME: t,
  ...data
}) {
  return { countInfoId, t, data };
}

class StudyDataDAO {
  static async atrSpeedByCounts(countInfoIds) {
    const sql = `
  SELECT "COUNT_INFO_ID", "TIMECOUNT", "COUNT", "SPEED_CLASS"
  FROM "TRAFFIC"."CNT_DET"
  WHERE "COUNT_INFO_ID" IN ($(countInfoIds:csv))
  ORDER BY "TIMECOUNT" ASC, "SPEED_CLASS" ASC`;
    const rows = await db.manyOrNone(sql, { countInfoIds });
    return rows.map(normalizeCntDetRow);
  }

  static async atrVolumeByCounts(countInfoIds) {
    const sql = `
  SELECT "COUNT_INFO_ID", "TIMECOUNT", "COUNT"
  FROM "TRAFFIC"."CNT_DET"
  WHERE "COUNT_INFO_ID" IN ($(countInfoIds:csv))
  ORDER BY "TIMECOUNT" ASC`;
    const rows = await db.manyOrNone(sql, { countInfoIds });
    return rows.map(normalizeCntDetRow);
  }

  static async tmcByCounts(countInfoIds) {
    const sql = `
  SELECT * FROM "TRAFFIC"."DET"
  WHERE "COUNT_INFO_ID" IN ($(countInfoIds:csv))
  ORDER BY "COUNT_TIME" ASC`;
    const rows = await db.manyOrNone(sql, { countInfoIds });
    return rows.map(normalizeDetRow);
  }

  static async countsByStudy(study) {
    const sql = `
WITH arterycodes AS (
  SELECT arterycode
  FROM counts.arteries_groups
  WHERE group_id = $(arteryGroupId)
)
SELECT
  cmr."ARTERYCODE" AS arterycode,
  cmr."COUNT_DATE" AS "countDate",
  cmr."COUNT_INFO_ID" AS "countInfoId",
  amd.direction
FROM counts.counts_multiday_runs cmr
JOIN arterycodes a ON cmr."ARTERYCODE" = a.arterycode
LEFT JOIN counts.arteries_midblock_direction amd ON cmr."ARTERYCODE" = amd.arterycode
WHERE cmr."CATEGORY_ID" = $(categoryId)
AND cmr."COUNT_DATE" >= $(startDate)
AND cmr."COUNT_DATE" <= $(endDate)`;
    const {
      arteryGroupId,
      endDate,
      startDate,
      type: { id: categoryId },
    } = study;
    return db.manyOrNone(sql, {
      arteryGroupId,
      categoryId,
      endDate,
      startDate,
    });
  }

  static async dataRowsByCounts(study, counts) {
    if (counts.length === 0) {
      return [];
    }
    const { studyType } = study.type;
    const countInfoIds = counts.map(({ countInfoId }) => countInfoId);
    if (studyType === StudyType.TMC) {
      return StudyDataDAO.tmcByCounts(countInfoIds);
    }
    if (studyType === StudyType.ATR_SPEED_VOLUME) {
      return StudyDataDAO.atrSpeedByCounts(countInfoIds);
    }
    return StudyDataDAO.atrVolumeByCounts(countInfoIds);
  }

  static groupDataRows(counts, dataRows) {
    const dataRowsByCount = new Map(
      counts.map(({ countInfoId }) => [countInfoId, []]),
    );
    dataRows.forEach((row) => {
      const { countInfoId, ...rowRest } = row;
      dataRowsByCount.get(countInfoId).push(rowRest);
    });
    return dataRowsByCount;
  }

  static async byStudy(study) {
    const counts = await StudyDataDAO.countsByStudy(study);
    const dataRows = await StudyDataDAO.dataRowsByCounts(study, counts);
    const studyData = StudyDataDAO.groupDataRows(counts, dataRows);
    return { counts, studyData };
  }
}

export default StudyDataDAO;
