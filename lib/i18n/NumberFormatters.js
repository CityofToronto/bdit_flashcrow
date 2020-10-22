/**
 * `NumberFormatters` contains various formatting methods for number formats used
 * throughout MOVE.
 *
 * These formatting methods are also loaded as Vue filters in `main.js`.  If you're
 * doing something with `Number#toLocaleString` that isn't covered here, or if you're
 * tempted to pull in `d3-format` as a dependency just to format numbers, look here
 * first.
 */
class NumberFormatters {
  static format(x, options) {
    if (x === null) {
      return '';
    }
    return x.toLocaleString(undefined, options);
  }

  static formatDefault(x) {
    return NumberFormatters.format(x);
  }

  static formatDecimal(x, fractionDigits) {
    return NumberFormatters.format(x, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }

  static formatPercent(x, fractionDigits) {
    if (x === null) {
      return '';
    }
    const xStr = NumberFormatters.formatDecimal(100 * x, fractionDigits);
    return `${xStr}%`;
  }
}

export default NumberFormatters;
