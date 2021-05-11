import { Info } from 'luxon';

import ArrayUtils from '@/lib/ArrayUtils';

/**
 * Time range.
 *
 * @typedef {Object} TimeRange
 * @property {DateTime?} start - start of range
 * @property {DateTime?} end - end of range
 */

/**
 * `TimeFormatters` contains various formatting methods for date / time formats used
 * throughout MOVE.
 *
 * These formatting methods are also loaded as Vue filters in `main.js`.  If you're
 * doing something with `Intl.DateTimeFormat` that isn't covered here, or if you're
 * tempted to pull in `moment` as a dependency just to format `Date` objects, look
 * here first.
 */
class TimeFormatters {
  /**
   * Use `DateTime#toLocaleString` to format `d` according to the given options.  This exists
   * primarily to provide a `null`-safe wrapper to `DateTime#toLocaleString`.
   *
   * @param {DateTime} d - date to format
   * @param {Object} options - formatting options, as per `Intl.DateTimeFormat`
   * @returns {string} the formatted date string, or the empty string if `d === null`
   */
  static format(d, options) {
    if (!d) {
      return '';
    }
    return d.toLocaleString(options);
  }

  /**
   * Use {@link Date#toISOString} to generate a machine-readable timestamp for
   * CSV exports.
   *
   * @param {DateTime} d - date to format
   * @returns {string} the formatted date/time string, or the empty string if `d === null`
   */
  static formatCsv(d) {
    if (d === null) {
      return '';
    }
    return d.toISO().slice(0, 16).replace('T', ' ');
  }

  /**
   * Use {@link Date#toISOString} to generate a machine-readable date for
   * CSV exports.
   *
   * @param {DateTime} d - date to format
   * @returns {string} the formatted date string, or the empty string if `d === null`
   */
  static formatCsvDate(d) {
    if (d === null) {
      return '';
    }
    return d.toISO().slice(0, 10);
  }

  /**
   * Format `d` according to `en-US` defaults.
   *
   * @param {DateTime} d - date to format
   * @returns {string} the formatted date string, or the empty string if `d === null`
   */
  static formatDefault(d) {
    return TimeFormatters.formatCsvDate(d);
  }

  /**
   * Format `d` as per ISO 8601 standards, showing both date and time.  Note that
   * {@link formatDefault} only shows date.
   *
   * @param {DateTime} d - date to format
   * @returns {string} the formatted date-time string, or the empty string if `d === null`
   */
  static formatDateTime(d) {
    if (d === null) {
      return '';
    }
    return d.toISO().slice(0, 16).replace('T', ' ');
  }

  /**
   * Extract the day of week from `d` in three-letter short form.
   *
   * @param {DateTime} d - date to format
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
      /* eslint-disable-next-line no-bitwise */
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
   * @param {DateTime} d - date to format
   * @returns {string} the formatted time of day, or the empty string if `d === null`
   */
  static formatTimeOfDay(d) {
    if (d === null) {
      return '';
    }
    return d.toISO().slice(11, 16);
  }

  /**
   * Format a time range using dates (e.g. "04/01/2012 - 04/01/2018").
   *
   * @param {TimeRange?} timeRange
   * @returns {string?} the formatted date range
   */
  static formatRangeDate(timeRange) {
    if (timeRange === null) {
      return null;
    }
    const { start, end } = timeRange;
    let startHuman = null;
    if (start !== null) {
      startHuman = TimeFormatters.formatDefault(start);
    }
    let endHuman = null;
    if (end !== null) {
      endHuman = TimeFormatters.formatDefault(end);
    }

    if (startHuman === null) {
      if (endHuman === null) {
        return null;
      }
      return `Until ${endHuman}`;
    }
    if (endHuman === null) {
      return `Since ${startHuman}`;
    }
    if (startHuman === endHuman) {
      return startHuman;
    }
    return `${startHuman} to ${endHuman}`;
  }

  /**
   * Format a time range using time of day (e.g. "08:00 - 09:00").
   *
   * @param {TimeRange?} timeRange
   * @returns {string?} the formatted time range, using time of day for both range endpoints
   */
  static formatRangeTimeOfDay(timeRange) {
    if (timeRange === null) {
      return null;
    }
    const { start, end } = timeRange;
    let startHuman = null;
    if (start !== null) {
      startHuman = TimeFormatters.formatTimeOfDay(start);
    }
    let endHuman = null;
    if (end !== null) {
      endHuman = TimeFormatters.formatTimeOfDay(end);
    }

    if (startHuman === null) {
      if (endHuman === null) {
        return null;
      }
      return `Before ${endHuman}`;
    }
    if (endHuman === null) {
      return `After ${startHuman}`;
    }
    if (startHuman === endHuman) {
      return `At ${startHuman}`;
    }
    return `${startHuman}\u2013${endHuman}`;
  }
}

const WEEKDAYS = Info.weekdays('short');

/**
 * Array of three-letter short day of week names, indexed to match `Date#getDay()`.
 *
 * @type {Array<string>}
 */
TimeFormatters.DAYS_OF_WEEK = [
  WEEKDAYS[6],
  ...WEEKDAYS.slice(0, -1),
];

TimeFormatters.MONTHS_OF_YEAR = Info.months('short');

export default TimeFormatters;
