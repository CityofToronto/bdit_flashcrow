/**
 * @function ComparisonKey
 * @param {*} x - value being compared
 * @returns {(number|string)} key to compare value on
 */

/**
 * `ArrayUtils` contains general utilities for building, sorting, grouping, and
 * searching arrays.
 */
class ArrayUtils {
  /**
   * Returns an array of integers `[lo, ..., hi - 1]`.  The semantics are similar to
   * the 1-argument and 2-argument versions of Python's `range()`.
   *
   * @param {number} lo - range starts here (inclusive)
   * @param {number} hi - range ends here (exclusive)
   * @returns {Array<number>} - array containing range `[lo, ..., hi - 1]`
   */
  static range(lo, hi) {
    let loActual = lo;
    let hiActual = hi;
    if (hi === undefined) {
      // 1-argument case
      hiActual = lo;
      loActual = 0;
    }
    const n = hiActual - loActual;
    if (n < 0) {
      return [];
    }
    return [...Array(n).keys()].map(i => loActual + i);
  }

  /**
   * Returns the maximum value in `xs` according to `key`.
   *
   * @param {Array} xs - array to search
   * @param {ComparisonKey} key - key to compare by
   * @returns maximum value in `xs` when compared by `key`, or `null` if `xs`
   * is empty
   */
  static getMaxBy(xs, key) {
    const i = ArrayUtils.getMaxIndexBy(xs, key);
    if (i === null) {
      return null;
    }
    return xs[i];
  }

  /**
   * Returns the index of the maximum value in `xs` according to `key`.
   *
   * @param {Array} xs - array to search
   * @param {ComparisonKey} key - key to compare by
   * @returns index of maximum value in `xs` when compared by `key`, or `null` if `xs`
   * is empty
   */
  static getMaxIndexBy(xs, key) {
    const n = xs.length;
    if (n === 0) {
      return null;
    }
    let indexMax = 0;
    let kMax = key(xs[0]);
    for (let i = 1; i < n; i += 1) {
      const x = xs[i];
      const k = key(x);
      if (k > kMax) {
        indexMax = i;
        kMax = k;
      }
    }
    return indexMax;
  }

  /**
   * Returns `xs` sorted by `key`, either ascending or descending according to `direction`.
   *
   * @param {Array} xs - array to search
   * @param {ComparisonKey} key - key to compare by
   * @param {number} direction - whether to sort ascending (> 0) or descending (< 0).
   * @returns copy of `xs` sorted by `key`:
   *
   * - ascending if `direction > 0`;
   * - descending if `direction < 0`.
   */
  static sortBy(xs, key, direction = 1) {
    return xs.slice(0).sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      if (ka < kb) {
        return -direction;
      }
      if (ka > kb) {
        return direction;
      }
      return 0;
    });
  }

  /**
   * Uses `g` to group `xs`.
   *
   * @param {Array} xs - array to group
   * @param {ComparisonKey} g - key to group by
   * @returns {Array<Array>} array of groups, each represented as an array
   */
  static groupBy(xs, g) {
    const groups = [];
    if (xs.length === 0) {
      return groups;
    }
    const xsSorted = ArrayUtils.sortBy(xs, g);
    let group = null;
    let gLast = null;
    xsSorted.forEach((x, i) => {
      const gx = g(x);
      if (i === 0 || gx > gLast) {
        group = [];
        gLast = gx;
        groups.push(group);
      }
      group.push(x);
    });
    return groups;
  }
}

export default ArrayUtils;
