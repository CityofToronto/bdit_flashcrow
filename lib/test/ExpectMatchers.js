import DateTime from '@/lib/time/DateTime';

function toBeValidCountData(received) {
  const n = received.length;

  let tPrev = -Infinity;
  let dateFirst = null;
  let keysFirst = null;
  for (let i = 0; i < n; i++) {
    const d = received[i];

    // all data points must have timestamp `t`
    if (!Object.prototype.hasOwnProperty.call(d, 't')) {
      const msg = `expected data point at index ${i} to have timestamp`;
      return {
        message: () => msg,
        pass: false,
      };
    }
    if (!(d.t instanceof DateTime)) {
      const msg = `expected timestamp at index ${i} to be DateTime instance`;
      return {
        message: () => msg,
        pass: false,
      };
    }

    // timestamps must be in ascending order
    const t = d.t.valueOf();
    if (t < tPrev) {
      const msg = `expected timestamp at index ${i} to be in ascending order`;
      return {
        message: () => msg,
        pass: false,
      };
    }
    tPrev = t;

    // timestamps must have same date
    const { year, month, day } = d.t;
    const date = { year, month, day };
    if (dateFirst === null) {
      dateFirst = date;
    } else {
      const { year: yearFirst, month: monthFirst, day: dayFirst } = dateFirst;
      if (year !== yearFirst || month !== monthFirst || day !== dayFirst) {
        const msg = `expected timestamp at index ${i} to be on same day`;
        return {
          message: () => msg,
          pass: false,
        };
      }
    }

    // all data points must have `data`
    if (!Object.prototype.hasOwnProperty.call(d, 'data')) {
      const msg = `expected data point at index ${i} to have data`;
      return {
        message: () => msg,
        pass: false,
      };
    }
    if (d.data !== Object(d.data)) {
      const msg = `expected data at index ${i} to be an object`;
      return {
        message: () => msg,
        pass: false,
      };
    }

    // all `data` values must have same keys
    const keys = Object.keys(d.data);
    if (keysFirst === null) {
      keysFirst = keys;
    } else {
      const numKeys = keysFirst.length;
      if (keys.length !== numKeys) {
        const msg = `expected data at index ${i} to have same keys`;
        return {
          message: () => msg,
          pass: false,
        };
      }
      for (let j = 0; j < numKeys; j++) {
        if (!keysFirst.includes(keys[j])) {
          const msg = `expected data at index ${i} to have same keys`;
          return {
            message: () => msg,
            pass: false,
          };
        }
      }
    }
  }

  const msg = 'expected valid count data';
  return {
    message: () => msg,
    pass: true,
  };
}

function toBeValidIndexRangeFor(received, expected) {
  const n = expected.length;
  const { lo, hi } = received;
  const msg = `expected ${received} to be valid index range for count data`;
  const pass = lo >= 0 && lo <= n && hi >= 0 && hi <= n && lo <= hi;
  return {
    message: () => msg,
    pass,
  };
}

function toBeWithinTolerance(received, expected, tolerance) {
  const pass = Math.abs(received - expected) <= tolerance;
  if (pass) {
    const msg = `expected ${received} to be outside tolerance ${tolerance} of ${expected}`;
    return {
      message: () => msg,
      pass: true,
    };
  }
  const msg = `expected ${received} to be within tolerance ${tolerance} of ${expected}`;
  return {
    message: () => msg,
    pass: false,
  };
}

function toMatchNumPerStudyType(received, expected) {
  const n = expected.length;
  if (received.length !== n) {
    const msg = `expected array of length ${expected.length}, got length ${received.length}`;
    return {
      message: () => msg,
      pass: false,
    };
  }
  for (let i = 0; i < n; i++) {
    const [k0, value0] = expected[i];
    const { n: k, studyType: { name: value } } = received[i];
    if (value !== value0) {
      const msg = `expected study type ${value0} at position ${i}, got ${value}`;
      return {
        message: () => msg,
        pass: false,
      };
    }
    if (k < k0) {
      const msg = `expected at least ${k0} studies of type ${value0}, got ${k} studies`;
      return {
        message: () => msg,
        pass: false,
      };
    }
  }
  return {
    message: () => 'expected number of studies to match',
    pass: true,
  };
}

function toMatchNumPerStudyTypeAndLocation(received, expected) {
  const n = expected.length;
  if (received.length !== n) {
    const msg = `expected array of length ${n}, got length ${received.length}`;
    return {
      message: () => msg,
      pass: false,
    };
  }
  for (let i = 0; i < n; i++) {
    const [ks0, value0] = expected[i];
    const { perLocation: ks, studyType: { name: value } } = received[i];
    if (value !== value0) {
      const msg = `expected study type ${value0} at position ${i}, got ${value}`;
      return {
        message: () => msg,
        pass: false,
      };
    }
    const m = ks0.length;
    if (ks.length !== m) {
      const msg = `expected per-location array of length ${m}, got length ${ks.length}`;
      return {
        message: () => msg,
        pass: false,
      };
    }
    for (let j = 0; j < m; j++) {
      const k0 = ks0[j];
      const k = ks[j];
      if (k < k0) {
        const msg = `expected at least ${k0} studies of type ${value0} for location ${j}, got ${k} studies`;
        return {
          message: () => msg,
          pass: false,
        };
      }
    }
  }
  return {
    message: () => 'expected number of studies to match',
    pass: true,
  };
}

/**
 * Matchers that extend `expect`.  Use these with `expect.extend` from within test suites
 * as needed.
 *
 * @namespace
 * @example
 * import { toBeWithinTolerance } from '@/lib/test/ExpectMatchers';
 * expect.extend({ toBeWithinTolerance });
 */
const ExpectMatchers = {
  toBeValidCountData,
  toBeValidIndexRangeFor,
  toBeWithinTolerance,
  toMatchNumPerStudyType,
  toMatchNumPerStudyTypeAndLocation,
};

export {
  ExpectMatchers as default,
  toBeValidCountData,
  toBeValidIndexRangeFor,
  toBeWithinTolerance,
  toMatchNumPerStudyType,
  toMatchNumPerStudyTypeAndLocation,
};
