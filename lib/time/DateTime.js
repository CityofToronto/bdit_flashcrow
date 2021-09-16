import { DateTime, IANAZone, Settings } from 'luxon';

/*
 * Application timezone.  Edit this to run MOVE in other jurisdictions.
 */
Settings.defaultZone = IANAZone.create('America/Toronto');

const { get: originalWeekday } = Object.getOwnPropertyDescriptor(DateTime.prototype, 'weekday');
Object.defineProperty(DateTime.prototype, 'weekday', {
  get() {
    /*
     * `DateTime#weekday` uses ISO numbering, which starts with Monday (1) and ends with
     * Sunday (7).  For our purposes, JavaScript's numbering from Sunday (0) to Saturday (6)
     * is more useful, so we override that here.
     */
    const weekday = originalWeekday.call(this);
    return weekday % 7;
  },
});

const originalToRelative = DateTime.prototype.toRelative;
DateTime.prototype.toRelative = function toRelative() {
  return originalToRelative.call(this, {});
};

const originalToSQL = DateTime.prototype.toSQL;
DateTime.prototype.toSQL = function toSQL(options) {
  /*
   * `DateTime#toSQL` includes the timezone offset by default.  In MOVE, however, timestamps
   * are always treated as being local `DateTime` instances in the application timezone.
   */
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

DateTime.fromLocaleString = function fromLocaleString(str) {
  return DateTime.fromFormat(str, 'M/d/yyyy');
};

DateTime.fromString = function fromString(value) {
  return DateTime.fromSQL(value);
};

export default DateTime;
