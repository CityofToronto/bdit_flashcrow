import ArrayUtils from '@/lib/ArrayUtils';

/**
 * `TimeFormatters` contains various formatting methods for date / time formats used
 * throughout MOVE.
 *
 * Thes formatting methods are also loaded as Vue filters in `main.js`.  If you're
 * doing something with `Intl.DateTimeFormat()` that isn't covered here, or if you're
 * tempted to pull in `moment` as a dependency just to format `Date` objects, look
 * here first.
 */
class TimeFormatters {
  /**
   * Use `Intl.DateTimeFormat` to format `d` according to the given options.  This exists
   * primarily to provide a `null`-safe wrapper to `Intl.DateTimeFormat`.
   *
   * @param {Date} d - date to format
   * @param {object} options - formatting options, as per `Intl.DateTimeFormat`
   * @returns {String} the formatted date string, or the empty string if `d === null`
   */
  static format(d, options) {
    if (!d) {
      return '';
    }
    return new Intl.DateTimeFormat('en-US', options).format(d);
  }

  /**
   * Format `d` according to `en-US` defaults.
   *
   * @param {Date} d - date to format
   * @returns {String} the formatted date string, or the empty string if `d === null`
   */
  static formatDefault(d) {
    return TimeFormatters.format(d);
  }

  /**
   * Extract the day of week from `d` in three-letter short form.
   *
   * @param {Date} d - date to format
   * @returns {String} three-letter short day of week, or the empty string if `d === null`
   */
  static formatDayOfWeek(d) {
    return TimeFormatters.format(d, {
      weekday: 'short',
    });
  }

  /**
   * Extract the time of day from `d` in 24-hour `HH:MM` format.
   *
   * @param {Date} d - date to format
   * @returns {String} the formatted time of day, or the empty string if `d === null`
   */
  static formatTimeOfDay(d) {
    return TimeFormatters.format(d, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Extract the year and month from `d` in `MMM YYYY` format.
   *
   * @param {Date} d - date to format
   * @returns {String} the formatted year and month, or the empty string if `d === null`
   */
  static formatYearMonth(d) {
    return TimeFormatters.format(d, {
      year: 'numeric',
      month: 'short',
    });
  }
}

/**
 * Array of three-letter short day of week names, indexed to match `Date#getDay()`.
 *
 * @see https://stackoverflow.com/questions/30437134/how-to-get-the-weekday-names-using-intl
 * @type {Array<String>}
 */
TimeFormatters.DAYS_OF_WEEK = ArrayUtils.range(4, 11)
  .map(date => TimeFormatters.formatDayOfWeek(new Date(1970, 0, date)));

export default TimeFormatters;
