import db from '@/lib/db/db';

// TODO: DRY with web/server.js
const SignalType = {
  NORMAL: 1,
  PEDCROSS: 2,
};

class SignalDAO {
  static async signalsByPX(px, signalType, limit) {
    let table = null;
    if (signalType === SignalType.NORMAL) {
      table = 'gis.traffic_signals';
    } else {
      table = 'gis.pedestrian_crossings';
    }
    const sql = `
SELECT px as "KEYSTRING",
description || ' (px: ' || px || ')' as "ADDRESS",
tbl
FROM gis.query_table
WHERE (px = $(px) OR px::TEXT LIKE $(px)::TEXT || '%') AND tbl = $(table)::TEXT
ORDER BY px
LIMIT $(limit);`;
    const rows = await db.manyOrNone(sql, { px, table, limit });
    return rows;
  }
}

export default SignalDAO;
