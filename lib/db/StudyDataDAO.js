import { StudyType } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import db from '@/lib/db/db';
import ArteryDAO from '@/lib/db/ArteryDAO';
import CountDAO from '@/lib/db/CountDAO';

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
      counts.map(({ id }) => [id, []]),
    );
    dataRows.forEach((row) => {
      const { countInfoId, ...rowRest } = row;
      dataRowsByCount.get(countInfoId).push(rowRest);
    });
    return dataRowsByCount;
  }

  static async byStudy(study) {
    const [arteries, counts] = await Promise.all([
      ArteryDAO.byStudy(study),
      CountDAO.byStudy(study),
    ]);
    const arteriesByCode = mapBy(arteries, ({ arteryCode }) => arteryCode);

    const dataRows = await StudyDataDAO.dataRowsByCounts(study, counts);
    const studyData = StudyDataDAO.groupDataRows(counts, dataRows);

    return {
      arteries: arteriesByCode,
      counts,
      studyData,
    };
  }
}

export default StudyDataDAO;
