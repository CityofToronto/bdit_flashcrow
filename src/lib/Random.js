class Random {
  static uniform(lo, hi) {
    if (lo >= hi) {
      throw new Error(
        `unexpected input to Random.uniform(): ${lo} >= ${hi}`,
      );
    }
    return lo + (hi - lo) * Math.random();
  }

  static range(lo, hi) {
    if (hi === undefined) {
      return Math.floor(Random.uniform(0, lo));
    }
    return Math.floor(Random.uniform(lo, hi));
  }

  static choice(xs) {
    const n = xs.length;
    if (n === 0) {
      return null;
    }
    const i = Math.floor(Math.random() * n);
    return xs[i];
  }

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
