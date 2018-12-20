const pg = require('pg-promise')({
  capSQL: true,
});

const config = require('../config');

const db = pg(config.db);
module.exports = db;
