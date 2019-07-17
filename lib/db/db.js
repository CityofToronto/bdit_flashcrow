const pg = require('pg-promise')({
  capSQL: true,
});

const config = require('../config');

const OID_BIGINT = 20;
const OID_TIMESTAMP = 1114;
pg.pg.types.setTypeParser(OID_BIGINT, value => parseInt(value, 10));
pg.pg.types.setTypeParser(OID_TIMESTAMP, value => new Date(`${value}+0000`));

const db = pg(config.db);
module.exports = db;
