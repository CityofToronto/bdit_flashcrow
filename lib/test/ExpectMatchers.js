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
};

export {
  ExpectMatchers as default,
  toBeValidCountData,
  toBeValidIndexRangeFor,
  toBeWithinTolerance,
};
