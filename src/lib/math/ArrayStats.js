class ArrayStats {
  /**
   *
   * @param {Array<Number>} xs
   */
  static sum(xs) {
    let sum = 0;
    xs.forEach((x) => {
      sum += x;
    });
    return sum;
  }

  /**
   * @param {Array<[Number, Number]} buckets
   * @param {Array<Number>} counts
   * @param {Number} p
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
    const cutoffCount = Math.round(p * totalCount);
    let curCount = 0;
    for (let i = 0; i < n; i++) {
      const [min, max] = buckets[i];
      const count = counts[i];
      if (curCount + count >= cutoffCount) {
        const t = (cutoffCount - curCount) / count;
        return (min + t * (max - min));
      }
      curCount += count;
    }
    return buckets[n - 1][1];
  }
}

export default ArrayStats;
