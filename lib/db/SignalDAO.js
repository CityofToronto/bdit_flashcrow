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
    const sql = `
    SELECT
    CAST(px AS INT), description, tbl,
    FROM gis.query_table
    WHERE px IN ($(PXs:csv))`;
    const rows = await db.manyOrNone(sql, { PXs });
    return rows;
  }
}

module.exports = SignalDAO;
