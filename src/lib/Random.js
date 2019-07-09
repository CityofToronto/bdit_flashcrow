/**
 * `Random` contains various utilities for generating random numbers.
 *
 * The random numbers generated here are *NOT* secure, and should *NEVER* be used for
 * cryptographic purposes.  Rather, they are intended for use in:
 *
 * - randomized non-cryptographic algorithms (e.g. Monte Carlo methods);
 * - testing (e.g. fuzz testing).
 */
class Random {
  /**
   * Generate a random number uniformly on the interval `[lo, hi)`.
   *
   * @param {Number} lo - minimum value (inclusive)
   * @param {Number} hi - maximum value (exclusive)
   * @returns {Number} random number uniformly selected from `[lo, hi)`
   */
  static uniform(lo, hi) {
    if (lo >= hi) {
      throw new Error(
        `unexpected input to Random.uniform(): ${lo} >= ${hi}`,
      );
    }
    return lo + (hi - lo) * Math.random();
  }

  /**
   * Generate a random *integer* uniformly on the interval `[lo, hi)`.
   * This is very similar to `Random.uniform()`, except that it returns
   * an integer.
   *
   * @param {Number} lo - minimum value (inclusive)
   * @param {Number} hi - maximum value (exclusive)
   * @returns {Number} random integer uniformly selected from `[lo, hi)`
   */
  static range(lo, hi) {
    if (hi === undefined) {
      return Math.floor(Random.uniform(0, lo));
    }
    return Math.floor(Random.uniform(lo, hi));
  }

  /**
   * Selects an item at random from `xs` using a uniform distribution.
   *
   * @param {Array} xs - array to choose randomly from
   * @returns {*} random item from `xs`, or `null` if `xs` is empty
   */
  static choice(xs) {
    const n = xs.length;
    if (n === 0) {
      return null;
    }
    const i = Math.floor(Math.random() * n);
    return xs[i];
  }

  /**
   * Randomly samples `k` items from `xs` using a uniform distribution
   * without replacement.
   *
   * @param {Array} xs - array to choose randomly from
   * @param {Number} k - number of items to choose
   * @returns {*} up to `k` random items from `xs`, length permitting
   */
  static sample(xs, k) {
    const n = xs.length;
    if (k === 0) {
      return [];
    }
    if (k >= n) {
      return xs;
    }
    const r = xs.slice(0, k);
    for (let i = k; i < n; i += 1) {
      const j = Random.range(i);
      if (j < k) {
        r[j] = xs[i];
      }
    }
    return r;
  }
}

export default Random;
