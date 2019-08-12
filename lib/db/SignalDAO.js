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
    CAST(px AS INT), description || ' (px: ' || px || ')' as "ADDRESS", tbl
    FROM gis.query_table 
    WHERE CAST(px AS INT) = ($(PXNums:csv)) OR px LIKE ($(PXNums:csv))::TEXT || '%'
    ORDER BY CAST(px AS INT) LIMIT 6; `;
    const rows = await db.manyOrNone(sql, { PXNums }, { PXNums });
    return rows;
  }
}

module.exports = SignalDAO;
