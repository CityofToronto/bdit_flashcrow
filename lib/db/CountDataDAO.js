const db = require('./db');

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

// TODO: order these in time-ascending order
class CountDataDAO {
  static async cntDetByCount(count) {
    const sql = `SELECT * FROM "TRAFFIC"."CNT_DET"
  WHERE "COUNT_INFO_ID" = $(countInfoId)
  ORDER BY "TIMECOUNT" ASC`;
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
    return CountDataDAO.cntDetByCount(count);
  }
}

module.exports = CountDataDAO;
