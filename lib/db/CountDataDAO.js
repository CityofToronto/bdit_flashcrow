const db = require('./db');

function normalizeCntDetDataRows(rows, count) {
  console.log(count);
  return rows;
}

function normalizeDetDataRows(rows, count) {
  console.log(count);
  return rows;
}

class CountDataDAO {
  static async cntDetByCount(count) {
    const sql = `SELECT * FROM "TRAFFIC"."CNT_DET"
  WHERE "COUNT_INFO_ID" = $(countInfoId)
  ORDER BY "ID" ASC`;
    const countInfoId = count.id;
    const rows = await db.manyOrNone(sql, { countInfoId });
    return normalizeCntDetDataRows(rows, count);
  }

  static async detByCount(count) {
    const sql = `SELECT * FROM "TRAFFIC"."DET"
  WHERE "COUNT_INFO_ID" = $(countInfoId)
  ORDER BY "ID" ASC`;
    const countInfoId = count.id;
    const rows = await db.manyOrNone(sql, { countInfoId });
    return normalizeDetDataRows(rows, count);
  }

  static async byCount(count) {
    if (count.type.value === 'TMC') {
      return CountDataDAO.detByCount(count);
    }
    return CountDataDAO.cntDetByCount(count);
  }
}

module.exports = CountDataDAO;
