import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CountDAO from '@/lib/db/CountDAO';
import CountLocationDAO from '@/lib/db/CountLocationDAO';

function normalizeCntDetRow({
  COUNT_INFO_ID: countInfoId,
  TIMECOUNT: t,
  ...data
}) {
  // TODO: build time ranges here
  return { countInfoId, t, data };
}

function normalizeDetRow({
  ID,
  COUNT_INFO_ID: countInfoId,
  COUNT_TIME: countTime,
  ...data
}) {
  // TODO: build time ranges here
  const t = countTime.minus({ minutes: 15 });
  return { countInfoId, t, data };
}

function normalizeCountDataPedDelayRow({
  countInfoId,
  start,
  end,
  ...data
}) {
  // TODO: build time ranges here
  return { countInfoId, t: start, data };
}

/**
 * Data access layer for study data.  Note that many of these accessors require
 * study metadata as fetched using {@link StudyDAO}; those metadata objects can
 * then be used with `StudyDataDAO` to look up underlying data for all the counts
 * that make up a study.
 */
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

  static async pedDelayByCounts(countInfoIds) {
    const sql = `
SELECT *
FROM counts2.count_data_ped_delay
WHERE "countInfoId" IN ($(countInfoIds:csv))
ORDER BY "start" ASC`;
    const rows = await db.manyOrNone(sql, { countInfoIds });
    return rows.map(normalizeCountDataPedDelayRow);
  }

  static async tmcByCounts(countInfoIds) {
    const sql = `
  SELECT * FROM "TRAFFIC"."DET"
  WHERE "COUNT_INFO_ID" IN ($(countInfoIds:csv))
  ORDER BY "COUNT_TIME" ASC`;
    const rows = await db.manyOrNone(sql, { countInfoIds });
    return rows.map(normalizeDetRow);
  }

  static async dataRowsByCounts(study, counts) {
    if (counts.length === 0) {
      return [];
    }
    const { studyType } = study.type;
    const countInfoIds = counts.map(({ id }) => id);
    if (studyType === StudyType.ATR_SPEED_VOLUME) {
      return StudyDataDAO.atrSpeedByCounts(countInfoIds);
    }
    if (studyType === StudyType.PED_DELAY) {
      return StudyDataDAO.pedDelayByCounts(countInfoIds);
    }
    if (studyType === StudyType.TMC) {
      return StudyDataDAO.tmcByCounts(countInfoIds);
    }
    return StudyDataDAO.atrVolumeByCounts(countInfoIds);
  }

  static groupDataRows(counts, dataRows) {
    const dataRowsByCount = new Map(
      counts.map(({ id }) => [id, []]),
    );
    dataRows.forEach((row) => {
      const { countInfoId, ...rowRest } = row;
      dataRowsByCount.get(countInfoId).push(rowRest);
    });
    return dataRowsByCount;
  }

  static async byStudy(study) {
    const [counts, countLocation] = await Promise.all([
      CountDAO.byStudy(study),
      CountLocationDAO.byStudy(study),
    ]);

    const dataRows = await StudyDataDAO.dataRowsByCounts(study, counts);
    const studyData = StudyDataDAO.groupDataRows(counts, dataRows);

    return {
      counts,
      countLocation,
      studyData,
    };
  }
}

export default StudyDataDAO;
