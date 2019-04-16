class ArrayUtils {
  static sortBy(xs, key) {
    return xs.slice(0).sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      if (ka < kb) {
        return -1;
      }
      if (ka > kb) {
        return 1;
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
