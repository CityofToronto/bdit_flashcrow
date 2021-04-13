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
  // ARRAY GENERATION

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
   *
   * @param {Array} xs - array to split into chunks
   * @param {number} k - maximum chunk size
   * @returns {Array<Array>} `xs`, split into chunks of size at most `k`
   */
  static chunk(xs, k) {
    const chunks = [];
    const n = xs.length;
    for (let i = 0; i < n; i += k) {
      const chunk = xs.slice(i, i + k);
      chunks.push(chunk);
    }
    return chunks;
  }

  // AGGREGATION

  /**
   * Given an array of objects with number-valued entries, returns the "object sum"
   * of those entries.
   *
   * This is particularly useful when summing larger objects, such as Turning Movement Count
   * data rows.  It can still be used for smaller objects (e.g. vector math) - but if
   * profiling shows that to be a bottleneck, you should consider more specific functions
   * or class methods.
   *
   * @param {Object<string, number>} objs - objects to sum
   * @return {Object<string, number>} object `sum` such that `sum[key]` is the
   * sum of all defined `obj[key]` values
   * @example
   * const objs = [{ a: 1, b: 2 }, { a: 3, c: 4 }, { b: 5 }];
   * const sum = ArrayUtils.sumObjects(objs);
   * // { a: 4, b: 7, c: 4 }
   */
  static sumObjects(objs) {
    const sum = {};
    objs.forEach((obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (!Object.prototype.hasOwnProperty.call(sum, key)) {
          sum[key] = 0;
        }
        sum[key] += value;
      });
    });
    return sum;
  }

  // SELECTION

  /**
   * Creates a new array
   *
   * @param {Array} xs - array to select from
   * @param {number} indices - indices to select
   * @return {Array} elements of `xs` at the given `indices`
   */
  static selectIndices(xs, indices) {
    return indices.map(i => xs[i]);
  }

  // SEARCHING

  /**
   * Returns the minimum value in `xs` according to `key`.
   *
   * @param {Array} xs - array to search
   * @param {ComparisonKey} key - key to compare by
   * @returns minimum value in `xs` when compared by `key`, or `null` if `xs`
   * is empty
   */
  static getMinBy(xs, key) {
    const i = ArrayUtils.getMinIndexBy(xs, key);
    if (i === null) {
      return null;
    }
    return xs[i];
  }

  /**
   * Returns the index of the minimum value in `xs` according to `key`.
   *
   * @param {Array} xs - array to search
   * @param {ComparisonKey} key - key to compare by
   * @returns index of minimum value in `xs` when compared by `key`, or `null` if `xs`
   * is empty
   */
  static getMinIndexBy(xs, key) {
    const n = xs.length;
    if (n === 0) {
      return null;
    }
    let indexMin = 0;
    let kMin = key(xs[0]);
    for (let i = 1; i < n; i += 1) {
      const x = xs[i];
      const k = key(x);
      if (k < kMin) {
        indexMin = i;
        kMin = k;
      }
    }
    return indexMin;
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

  // SORTING

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
    const xsSorted = ArrayUtils.sortBy(xs, g);
    return ArrayUtils.groupBySorted(xsSorted, g);
  }

  /**
   * Uses `g` to group `xs`.  Assumes `xs` is already sorted by `g`.
   *
   * @param {Array} xs - array to group
   * @param {ComparisonKey} g - key to group by
   * @returns {Array<Array>} array of groups, each represented as an array
   */
  static groupBySorted(xs, g) {
    const groups = [];
    if (xs.length === 0) {
      return groups;
    }
    let group = null;
    let gLast = null;
    xs.forEach((x, i) => {
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

  /**
   * Similar to the UNIX utility `uniq` and lodash's `_.sortedUniq`, returns `xs` with
   * consecutive similar values removed.  Two values `x1`, `x2` are similar iff
   * `key(x1) === key(x2)`.
   *
   * Note that this does not handle non-consecutive similar values.
   *
   * @param {Array} xs
   * @param {ComparisonKey} key
   * @see https://lodash.com/docs/4.17.15#sortedUniq
   */
  static consecutiveUniqBy(xs, key) {
    const n = xs.length;
    if (n === 0) {
      return [];
    }
    let x = xs[0];
    const xsConsecutiveUniq = [x];
    let kPrev = key(x);
    for (let i = 1; i < n; i++) {
      x = xs[i];
      const k = key(x);
      if (k !== kPrev) {
        xsConsecutiveUniq.push(x);
        kPrev = k;
      }
    }
    return xsConsecutiveUniq;
  }
}

export default ArrayUtils;
