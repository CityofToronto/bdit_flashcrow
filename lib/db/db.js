import pgPromise from 'pg-promise';

import config from '@/lib/config/MoveConfig';
import DateTime from '@/lib/time/DateTime';

const pg = pgPromise({
  capSQL: true,
});

const OID_BIGINT = 20;
pg.pg.types.setTypeParser(OID_BIGINT, value => parseInt(value, 10));

const OID_TIMESTAMP_WITHOUT_TIME_ZONE = 1114;
pg.pg.types.setTypeParser(
  OID_TIMESTAMP_WITHOUT_TIME_ZONE,
  value => DateTime.fromSQL(value),
);

const db = pg(config.db);
export default db;
