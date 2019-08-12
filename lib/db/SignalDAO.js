const db = require('./db');

/*
// TODO: DRY with server.js
const SignalType = {
  NORMAL: 1,
  PEDCROSS: 2,
};

// TODO: DRY with store.js
function signalKey(centrelineType, centrelineId) {
  return `${signalType}/${px}`;
}

*/

class SignalDAO {
  static async signalsByPX(PXs) {
    if (PXs.length === 0) {
      return [];
    }
    const PXNums = PXs.map(({ px }) => px);
    const sql = `
    SELECT
    CAST(px AS INT), description as "ADDRESS", tbl
    FROM gis.query_table
    WHERE CAST(px AS INT) IN ($(PXNums:csv))`;
    const rows = await db.manyOrNone(sql, { PXNums });
    return rows;
  }
}

module.exports = SignalDAO;
