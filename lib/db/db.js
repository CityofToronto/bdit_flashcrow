import pgPromise from 'pg-promise';

import config from '@/lib/config/MoveConfig';
import DateTime from '@/lib/time/DateTime';
import DateTimeZone from '@/lib/time/DateTimeZone';

const pg = pgPromise({
  capSQL: true,
});

/*
 * See https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js for the full list
 * of database column types.
 */
const {
  INT8,
  TIMESTAMP,
  TIMESTAMPTZ,
} = pg.pg.types.builtins;

pg.pg.types.setTypeParser(INT8, value => parseInt(value, 10));
pg.pg.types.setTypeParser(TIMESTAMP, value => DateTime.fromSQL(value));
pg.pg.types.setTypeParser(TIMESTAMPTZ, value => DateTimeZone.fromSQL(value));

const db = pg(config.db);
export default db;
