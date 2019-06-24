class ArrayUtils {
  static range(lo, hi) {
    let loActual = lo;
    let hiActual = hi;
    if (hi === undefined) {
      hiActual = lo;
      loActual = 0;
    }
    const n = hiActual - loActual;
    if (n < 0) {
      return [];
    }
    return [...Array(n).keys()].map(i => loActual + i);
  }

  static getMaxBy(xs, key) {
    const i = ArrayUtils.getMaxIndexBy(xs, key);
    if (i === null) {
      return null;
    }
    return xs[i];
  }

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
