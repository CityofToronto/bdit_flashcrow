import pgPromise from 'pg-promise';

import config from '@/../lib/config/MoveConfig';

const pg = pgPromise({
  capSQL: true,
});

const OID_BIGINT = 20;
pg.pg.types.setTypeParser(OID_BIGINT, value => parseInt(value, 10));

const db = pg(config.db);
export default db;
