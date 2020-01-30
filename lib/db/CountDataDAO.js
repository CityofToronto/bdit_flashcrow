import db from '@/lib/db/db';

function normalizeCntDetRow({
  ID: id,
  COUNT_INFO_ID: countId,
  TIMECOUNT: t,
  ...data
}) {
  return {
    id, countId, t, data,
  };
}

function normalizeDetRow({
  ID: id,
  COUNT_INFO_ID: countId,
  COUNT_TIME: t,
  ...data
}) {
  return {
    id, countId, t, data,
  };
}

/**
 * Data access layer for count data.  Note that many of these accessors require
 * count metadata as fetched using {@link CountDAO}; those metadata objects can
 * then be used with `CountDataDAO` to look up underlying count data.
 */
class CountDataDAO {
  static async cntDetByCount(count, speedRelated) {
    const orderBySpeedCount = speedRelated ? ', "SPEED_CLASS" ASC' : '';
    const sql = `SELECT * FROM "TRAFFIC"."CNT_DET"
  WHERE "COUNT_INFO_ID" = $(countInfoId)
  ORDER BY "TIMECOUNT" ASC${orderBySpeedCount}`;
    const countInfoId = count.id;
    const rows = await db.manyOrNone(sql, { countInfoId });
    return rows.map(normalizeCntDetRow);
  }

  static async detByCount(count) {
    const sql = `SELECT * FROM "TRAFFIC"."DET"
  WHERE "COUNT_INFO_ID" = $(countInfoId)
  ORDER BY "COUNT_TIME" ASC`;
    const countInfoId = count.id;
    const rows = await db.manyOrNone(sql, { countInfoId });
    return rows.map(normalizeDetRow);
  }

  static async byCount(count) {
    if (count.type.value === 'TMC') {
      return CountDataDAO.detByCount(count);
    }
    const speedRelated = count.type.value === 'ATR_SPEED_VOLUME';
    return CountDataDAO.cntDetByCount(count, speedRelated);
  }
}

export default CountDataDAO;
