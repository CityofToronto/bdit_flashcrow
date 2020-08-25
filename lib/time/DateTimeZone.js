import DateTime from '@/lib/time/DateTime';

class DateTimeZone {
  constructor(dt) {
    this.dt = dt;
  }

  get isValid() {
    return this.dt.isValid;
  }

  equals(that) {
    if (!(that instanceof DateTimeZone)) {
      return false;
    }
    return this.dt.equals(that.dt);
  }

  toJSON() {
    return this.toSQL();
  }

  toSQL() {
    return this.dt.toSQL({ includeOffset: true });
  }

  toString() {
    return this.toSQL();
  }

  valueOf() {
    return this.dt.valueOf();
  }

  static fromJSON(value) {
    return DateTimeZone.fromSQL(value);
  }

  static fromMillis(t) {
    const dt = DateTime.fromMillis(t, { zone: 'UTC' });
    return new DateTimeZone(dt);
  }

  static fromSQL(value) {
    const dt = DateTime.fromSQL(value, { setZone: true });
    return new DateTimeZone(dt);
  }

  static fromString(value) {
    return DateTimeZone.fromSQL(value);
  }

  static utc(...args) {
    const dt = DateTime.utc(...args);
    return new DateTimeZone(dt);
  }
}

export default DateTimeZone;
