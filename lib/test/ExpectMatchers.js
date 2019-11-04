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
  toBeWithinTolerance,
};

export {
  ExpectMatchers as default,
  toBeWithinTolerance,
};
