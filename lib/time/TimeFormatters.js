import ArrayUtils from '@/lib/ArrayUtils';
import { TZ_TORONTO } from '@/lib/Constants';

/**
 * Time range.
 *
 * @typedef {Object} TimeRange
 * @property {Date} start - start of range
 * @property {Date} end - end of range
 */

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
   * @param {Object} options - formatting options, as per `Intl.DateTimeFormat`
   * @returns {string} the formatted date string, or the empty string if `d === null`
   */
  static format(d, options) {
    if (!d) {
      return '';
    }
    const defaultOptions = {
      timeZone: TZ_TORONTO,
    };
    const formatOptions = Object.assign(defaultOptions, options);
    return new Intl.DateTimeFormat('en-US', formatOptions).format(d);
  }

  /**
   * Use {@link Date#toISOString} to generate a machine-readable timestamp for
   * CSV exports.
   *
   * @param {Date} d - date to format
   * @returns {string} the formatted date string, or the empty string if `d === null`
   */
  static formatCsv(d) {
    if (d === null) {
      return '';
    }
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }

  /**
   * Format `d` according to `en-US` defaults.
   *
   * @param {Date} d - date to format
   * @returns {string} the formatted date string, or the empty string if `d === null`
   */
  static formatDefault(d) {
    return TimeFormatters.format(d);
  }

  /**
   * Format `d` for the `en-US` locale, showing both date and time.  Note that
   * {@link formatDefault} only shows date.
   *
   * @param {Date} d - date to format
   * @returns {string} the formatted date-time string, or the empty string if `d === null`
   */
  static formatDateTime(d) {
    return TimeFormatters.format(d, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Extract the day of week from `d` in three-letter short form.
   *
   * @param {Date} d - date to format
   * @returns {string} three-letter short day of week, or the empty string if `d === null`
   */
  static formatDayOfWeek(d) {
    return TimeFormatters.format(d, {
      weekday: 'short',
    });
  }

  /**
   * Returns a human-readable description of the days of the week.
   *
   * @param {Array<number>} daysOfWeek - array of unique days of week (0-6), in ascending order
   * @returns {string} human-readable description of the days of the week
   */
  static formatDaysOfWeek(daysOfWeek) {
    /*
     * For ease of comparison, we convert `daysOfWeek` to a 7-bit bitmask,
     * where bit `d` is set iff `daysOfWeek.includes(d)`.
     *
     * This allows us to quickly test against certain "special" bitmasks
     * below.
     */
    let bitMask = 0;
    daysOfWeek.forEach((d) => {
      /* eslint-disable no-bitwise */
      bitMask |= 1 << d;
    });
    if (bitMask === 0x7f) { // 1111111
      return 'any day';
    }
    if (bitMask === 0x3e) { // 0111110
      return 'weekdays';
    }
    if (bitMask === 0x41) { // 1000001
      return 'weekends';
    }
    return ArrayUtils
      .sortBy(daysOfWeek, i => i)
      .map(i => TimeFormatters.DAYS_OF_WEEK[i])
      .join(', ');
  }

  /**
   * Extract the time of day from `d` in 24-hour `HH:MM` format.
   *
   * @param {Date} d - date to format
   * @returns {string} the formatted time of day, or the empty string if `d === null`
   */
  static formatTimeOfDay(d) {
    return TimeFormatters.format(d, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format a time range using time of day (e.g. "08:00-09:00").
   *
   * TODO: we shouldn't have to do
   *
   * @param {TimeRange} timeRange
   * @returns {string} the formatted time range, using time of day for both range endpoints
   */
  static formatRangeTimeOfDay({ start, end }) {
    const startHuman = TimeFormatters.formatTimeOfDay(start);
    const endHuman = TimeFormatters.formatTimeOfDay(end);
    return `${startHuman}\u2013${endHuman}`;
  }

  /**
   * Extract the year and month from `d` in `MMM YYYY` format.
   *
   * @param {Date} d - date to format
   * @returns {string} the formatted year and month, or the empty string if `d === null`
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
 * @type {Array<string>}
 */
TimeFormatters.DAYS_OF_WEEK = ArrayUtils.range(4, 11)
  .map(date => TimeFormatters.formatDayOfWeek(new Date(1970, 0, date)));

export default TimeFormatters;
