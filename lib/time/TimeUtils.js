/**
 * @memberof TimeUtils
 * @param {DateTime} dt1 - date to compare against
 * @param {DateTime} dt2 - date being compared
 * @returns {boolean} whether the date `dt2` takes place on is after the date
 * `dt1` takes place on
 */
function afterDateOf(dt1, dt2) {
  const endOfDay1 = dt1.endOf('day');
  return dt2.valueOf() > endOfDay1.valueOf();
}

/**
 * @memberof TimeUtils
 * @param {Array<number>} daysOfWeek - days of week (0-6); these do not need
 * to be in order
 * @returns {number} maximum span of consecutive days that can be found in
 * the given days of week
 */
function numConsecutiveDaysOfWeek(daysOfWeek) {
  const days = new Array(15).fill(false);
  daysOfWeek.forEach((i) => {
    days[i] = true;
    days[i + 7] = true;
  });
  let max = 0;
  let start = 0;
  let inRun = false;
  for (let i = 0; i < 15; i += 1) {
    if (days[i] && !inRun) {
      inRun = true;
      start = i;
    } else if (!days[i] && inRun) {
      inRun = false;
      const size = i - start;
      if (size > max) {
        max = size;
      }
    }
  }
  return max === 14 ? 7 : max;
}

function timeIntervalOverlap({ start: aStart, end: aEnd }, { start: bStart, end: bEnd }) {
  if (bStart.valueOf() > aEnd.valueOf() || aStart.valueOf() > bEnd.valueOf()) {
    return null;
  }
  const start = aStart.valueOf() > bStart.valueOf() ? aStart : bStart;
  const end = aEnd.valueOf() < bEnd.valueOf() ? aEnd : bEnd;
  return { start, end };
}

/**
 * @namespace
 */
const TimeUtils = {
  afterDateOf,
  numConsecutiveDaysOfWeek,
  timeIntervalOverlap,
};

export {
  TimeUtils as default,
  afterDateOf,
  numConsecutiveDaysOfWeek,
  timeIntervalOverlap,
};
