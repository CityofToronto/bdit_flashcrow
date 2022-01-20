import ArrayUtils from '@/lib/ArrayUtils';

/**
 * @typedef {Object} CountDataRecord
 * @property {DateTime} t - timestamp
 * @param {Object} data - data parameters
 */

/**
 * Represents a series of count data records on the same day, in ascending
 * `t` order, and with the same parameters in `data`.
 *
 * @typedef {Array<CountDataRecord>} CountData
 */

/**
 * Defines a range of consecutive indices over an array.  This range is considered to
 * be half-open, in that it includes `lo` and excludes `hi` (i.e. `[lo, hi)` in mathematical
 * notation).
 *
 * @typedef {Object} IndexRange
 * @property {number} lo - lower bound (inclusive)
 * @property {number} hi - upper bound (exclusive)
 * @example
 * const indexRange = indexRangeHourOfDay(countData, 0, 12);
 * const { lo, hi } = indexRange;
 * for (let i = lo; i < hi; i++) {
 *   const { t, data } = countData[i];
 *   // do something with count data record
 * }
 */

/**
 * @param {CountData} countData
 * @param {number} start - hour of day to start from (inclusive)
 * @param {number} end - hour of day to end at (exclusive)
 * @returns {IndexRange} index range where `t.hour >= start && t.hour < end`
 */
function indexRangeHourOfDay(countData, start, end) {
  const n = countData.length;
  let lo = 0;
  while (lo < n && countData[lo].t.hour < start) {
    lo += 1;
  }
  let hi = n;
  while (hi > 0 && countData[hi - 1].t.hour >= end) {
    hi -= 1;
  }
  return { lo, hi };
}

function mapPeriodToIntervalIndices(intervalStartTimes, periodStartTime, periodEndTime) {
  let periodStartIndex = intervalStartTimes.findIndex(t => t >= periodStartTime);
  if (periodStartIndex === -1) periodStartIndex = 0;

  let periodEndIndex;
  for (let n = 0; n < intervalStartTimes.length; n++) {
    const nIntervalEndTime = intervalStartTimes[n].plus({ minutes: 15 });
    if (nIntervalEndTime.valueOf() === periodEndTime.valueOf()) {
      periodEndIndex = n;
      break;
    } else if (nIntervalEndTime.valueOf() > periodEndTime.valueOf()) {
      periodEndIndex = n - 1;
      break;
    }
  }
  if (periodEndIndex === undefined) periodEndIndex = intervalStartTimes.length - 1;

  return { start: periodStartIndex, end: periodEndIndex };
}

/**
 * Returns a sequence of disjoint index ranges that identify consecutive counted hours
 * in `countData`.  Note that these may not align with clock hours, and that they may not
 * always cover a full hour.  For instance, a count conducted from 7:30-9:30 and
 * 10:00-11:30 will have four index ranges representing:
 *
 * - 7:30-8:30
 * - 8:30-9:30
 * - 10:00-11:00
 * - 11:00-11:30
 *
 * @param {CountData} countData
 * @returns {Array<IndexRange>} index ranges identifying consecutive hours of the count
 */
function indexRangesConsecutiveHours(countData) {
  const indexRanges = [];
  const n = countData.length;
  if (n === 0) {
    return indexRanges;
  }

  let lo = 0;
  let start = countData[0].t;
  countData.forEach(({ t }, i) => {
    if (t.valueOf() >= start.plus({ hours: 1 }).valueOf()) {
      indexRanges.push({ lo, hi: i });
      lo = i;
      start = t;
    }
  });
  indexRanges.push({ lo, hi: n });

  return indexRanges;
}

/**
 * @param {CountData} countData
 * @param {IndexRange} indexRange - range to total volume over
 * @param {Function} fnVolume - function that takes `data` parameters and returns a
 * number representing the volume
 * @returns {number} maximum `fnVolume` volume over the given `indexRange`
 */
function indexRangeMax(countData, indexRange, fnVolume) {
  let volumeMax = 0;
  const { lo, hi } = indexRange;
  for (let i = lo; i < hi; i++) {
    const { data } = countData[i];
    const volume = fnVolume(data);
    if (volume > volumeMax) {
      volumeMax = volume;
    }
  }
  return volumeMax;
}

/**
 * @param {CountData} countData
 * @param {IndexRange} indexRange - range to total volume over
 * @param {Function} fnVolume - function that takes `data` parameters and returns a
 * number representing the volume
 * @returns {number} total `fnVolume` volume over the given `indexRange`
 */
function indexRangeSum(countData, indexRange, fnVolume) {
  let volumeTotal = 0;
  const { lo, hi } = indexRange;
  for (let i = lo; i < hi; i++) {
    const { data } = countData[i];
    const volume = fnVolume(data);
    volumeTotal += volume;
  }
  return volumeTotal;
}

/**
 * @param {CountData} countData
 * @param {IndexRange} indexRange - range to find peak hour over
 * @param {Object} timeSpan - `luxon` interval-like object describing time span to sum over
 * @param {Function} fnVolume - function that takes `data` parameters and returns a
 * number representing the volume
 * @returns {IndexRange} index range within `indexRange` spanning an interval of `timeSpan`
 * and having the maximum total value of `fnVolume` on the given `countData`
 */
function indexRangePeakTime(countData, indexRange, timeSpan, fnVolume) {
  const { lo, hi } = indexRange;
  if (lo === hi) {
    return { lo, hi };
  }

  let volumePeak = -Infinity;
  let indexRangePeak = null;
  for (let i = lo; i < hi; i++) {
    const ti = countData[i].t;
    let j = i + 1;
    while (j < hi) {
      const tj = countData[j].t;
      if (tj.valueOf() >= ti.plus(timeSpan).valueOf()) {
        break;
      }
      j += 1;
    }

    const indexRangeVolume = { lo: i, hi: j };
    const volume = indexRangeSum(countData, indexRangeVolume, fnVolume);
    if (volume > volumePeak) {
      volumePeak = volume;
      indexRangePeak = indexRangeVolume;
    }
  }

  return indexRangePeak;
}

/**
 * Speed / Volume ATRs represent different speed ranges as {@link CountDataRecord}
 * records with different `SPEED_CLASS` values at the same timestamp `t`.  This
 * method sums across all such records at `t`.
 *
 * While this is currently useful only for treating Speed / Volume ATRs as Volume ATRs,
 * it's possible that future count types will make use of this as well.
 *
 * @param {CountData} countData
 * @returns {CountData} `countData`, summed across equal values of `t`
 */
function sumByTime(countData) {
  const groups = ArrayUtils.groupBySorted(countData, ({ t }) => t.valueOf());
  return groups.map((group) => {
    const { t } = group[0];
    const datas = group.map(({ data }) => data);
    const data = ArrayUtils.sumObjects(datas);
    return { t, data };
  });
}

/**
 * @namespace
 */
const ReportTimeUtils = {
  indexRangeHourOfDay,
  indexRangeMax,
  indexRangePeakTime,
  indexRangeSum,
  indexRangesConsecutiveHours,
  sumByTime,
};

export {
  ReportTimeUtils as default,
  indexRangeHourOfDay,
  indexRangeMax,
  indexRangePeakTime,
  indexRangeSum,
  indexRangesConsecutiveHours,
  sumByTime,
  mapPeriodToIntervalIndices,
};
