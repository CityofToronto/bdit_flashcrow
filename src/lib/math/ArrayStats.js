/**
 * `ArrayStats` contains utility methods for computing aggregate statistics on
 * numeric arrays.
 */
class ArrayStats {
  /**
   * Compute the sum of the given numbers.
   *
   * @param {Array<number>} xs - array of numbers
   * @returns {number} sum of `xs`
   */
  static sum(xs) {
    let sum = 0;
    xs.forEach((x) => {
      sum += x;
    });
    return sum;
  }

  /**
   * Estimate the given percentile of histogram-bucketed data.  This estimate
   * assumes that data is evenly distributed across each histogram bucket.
   *
   * @param {Array<[number, number]>} buckets - array of `[min, max]` intervals
   * corresponding to histogram buckets
   * @param {Array<number>} counts - array of counts, such that `counts[i]` is the
   * number of items in the interval `buckets[i]`
   * @param {number} p - quantile, as a value on the interval `[0, 1]` where
   * 0 = 0th percentile (min), 1 = 100th percentile (max)
   * @returns {number} the value at quantile `p`
   */
  static histogramPercentile(buckets, counts, p) {
    const n = buckets.length;
    if (n === 0) {
      throw new Error('cannot calculate histogram percentile of empty dataset!');
    }
    if (n !== counts.length) {
      throw new Error('buckets and counts must have same length!');
    }
    const totalCount = ArrayStats.sum(counts);
    if (totalCount === 0) {
      throw new Error('cannot calculate histogram percentile of empty dataset!');
    }
    if (p <= 0) {
      return buckets[0][0];
    }
    if (p >= 1) {
      return buckets[n - 1][1];
    }
    const cutoffCount = p * totalCount;
    let curCount = 0;
    for (let i = 0; i < n; i++) {
      const [min, max] = buckets[i];
      const count = counts[i];
      if (curCount + count >= cutoffCount) {
        /*
         * `t` here represents the proportion of the bucket that is less than the
         * estimated value.
         */
        const t = (cutoffCount - curCount) / count;
        return (min + t * (max - min));
      }
      curCount += count;
    }
    return buckets[n - 1][1];
  }

  /**
   * Estimate the average (mean) of histogram-bucketed data.  This estimate
   * assumes that data is evenly distributed across each histogram bucket.
   *
   * @param {Array<[number, number]>} buckets - array of `[min, max]` intervals
   * corresponding to histogram buckets
   * @param {Array<number>} counts - array of counts, such that `counts[i]` is the
   * number of items in the interval `buckets[i]`
   */
  static histogramMean(buckets, counts) {
    const n = buckets.length;
    if (n === 0) {
      throw new Error('cannot calculate histogram percentile of empty dataset!');
    }
    if (n !== counts.length) {
      throw new Error('buckets and counts must have same length!');
    }
    const totalCount = ArrayStats.sum(counts);
    if (totalCount === 0) {
      throw new Error('cannot calculate histogram percentile of empty dataset!');
    }
    let mu = 0;
    for (let i = 0; i < n; i++) {
      const [min, max] = buckets[i];
      const count = counts[i];
      /*
       * The "centre of mass" of a bucket `[min, max]` is at the bucket
       * midpoint, so we use that midpoint to form the weighted average.
       */
      mu += ((min + max) / 2) * count / totalCount;
    }
    return mu;
  }
}

export default ArrayStats;
