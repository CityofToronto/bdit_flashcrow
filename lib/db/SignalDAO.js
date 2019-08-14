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
  static async signalsByPX(px, limit) {
    const sql = `
    SELECT
    CAST(px AS INT), description || ' (px: ' || px || ')' as "ADDRESS", tbl
    FROM gis.query_table 
    WHERE CAST(px AS INT) = $(px) OR px LIKE $(px)::TEXT || '%'
    ORDER BY px 
    LIMIT $(limit); `;
    const rows = await db.manyOrNone(sql, { px, limit });
    return rows;
  }
}

module.exports = SignalDAO;
