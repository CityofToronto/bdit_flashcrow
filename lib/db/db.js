const pg = require('pg-promise')({
  capSQL: true,
});

const config = require('../config');

const OID_BIGINT = 20;
pg.pg.types.setTypeParser(OID_BIGINT, value => parseInt(value, 10));

const db = pg(config.db);
module.exports = db;
