import { DateTime, Settings } from 'luxon';

Settings.defaultZoneName = 'America/Toronto';

const originalToSQL = DateTime.prototype.toSQL;
DateTime.prototype.toSQL = function toSQL(options) {
  const defaultOptions = {
    includeOffset: false,
  };
  const toSQLOptions = Object.assign(defaultOptions, options);
  return originalToSQL.call(this, toSQLOptions);
};

DateTime.prototype.toString = function toString() {
  return this.toSQL();
};

DateTime.prototype.toJSON = function toJSON() {
  return this.toSQL();
};

DateTime.fromJSON = function fromJSON(value) {
  return DateTime.fromSQL(value);
};

export default DateTime;
