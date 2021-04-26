function dateRangeValid({ start, end }) {
  if (start === null || end === null) {
    return true;
  }
  return start.valueOf() < end.valueOf();
}

/**
 * @namespace
 */
const ValidationHelpers = {};

export {
  ValidationHelpers as default,
  dateRangeValid,
};
