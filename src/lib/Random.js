class Random {
  static uniform(lo, hi) {
    return lo + (hi - lo) * Math.random();
  }

  static range(lo, hi) {
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
}

export default Random;
