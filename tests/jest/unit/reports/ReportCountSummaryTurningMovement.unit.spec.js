import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import DateTime from '@/lib/time/DateTime';

describe('ReportCountSummaryTurningMovement', () => {
  const ReportTMC = ReportCountSummaryTurningMovement;
  const INTERVAL_DURATION = ReportTMC.COUNT_INTERVAL_DURATION;
  const countStartTime = DateTime.now();

  describe('totalsForPeriod', () => {
    let rawVehicleCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    function getIntervalCounts() {
      const intervalCounts = [];
      rawVehicleCounts.forEach((count, i) => {
        if (count !== null) {
          const minutesElapsedFromStart = INTERVAL_DURATION.minutes * i;
          const interval = {
            data: { TOTAL_VEHICLES: count },
            t: countStartTime.plus({ minutes: minutesElapsedFromStart }),
          };
          intervalCounts.push(interval);
        }
      });
      return intervalCounts;
    }
    let intervalCounts = getIntervalCounts();

    let startIntervalIndex;
    let endIntervalIndex;
    function getPeriodFromIntervalCounts() {
      const period = {
        startTime: intervalCounts[startIntervalIndex].t,
        endTime: intervalCounts[endIntervalIndex].t.plus(INTERVAL_DURATION),
      };
      return period;
    }
    let period;

    function getTotalsForPeriod() {
      return ReportTMC.totalsForPeriod(intervalCounts, period);
    }

    describe('when a period is not specified', () => {
      test('returns the sum of the counts in ALL the intervals', () => {
        const totalVehicles = rawVehicleCounts.reduce((p, n) => p + n);
        expect(getTotalsForPeriod().sum.TOTAL_VEHICLES).toEqual(totalVehicles);
      });

      test('returns the full time range covered by the set of intervals', () => {
        const intervalStartTime = intervalCounts[0].t;
        const nIntervals = intervalCounts.length;
        const intervalEndTime = intervalCounts[nIntervals - 1].t.plus(INTERVAL_DURATION);
        expect(getTotalsForPeriod().timeRange.start).toEqual(intervalStartTime);
        expect(getTotalsForPeriod().timeRange.end).toEqual(intervalEndTime);
      });
    });

    describe('for a period that is a subset of the full interval window', () => {
      beforeAll(() => {
        startIntervalIndex = 2;
        endIntervalIndex = 7;
        period = getPeriodFromIntervalCounts();
      });

      test('returns the sum of the counts within the period ', () => {
        const rawCountsForPeriod = rawVehicleCounts.slice(
          startIntervalIndex, endIntervalIndex + 1,
        );
        const totalVehiclesForPeriod = rawCountsForPeriod.reduce((p, n) => p + n);
        expect(getTotalsForPeriod().sum.TOTAL_VEHICLES).toEqual(totalVehiclesForPeriod);
      });

      test('returns a time range that is equal to the period', () => {
        const periodStartTime = intervalCounts[startIntervalIndex].t;
        const periodEndTime = intervalCounts[endIntervalIndex].t.plus(INTERVAL_DURATION);
        expect(getTotalsForPeriod().timeRange.start).toEqual(periodStartTime);
        expect(getTotalsForPeriod().timeRange.end).toEqual(periodEndTime);
      });

      test('returns the number of count intervals included in the period', () => {
        const nIntervalsInPeriod = endIntervalIndex - startIntervalIndex + 1;
        expect(getTotalsForPeriod().timeRange.nIntervals).toEqual(nIntervalsInPeriod);
      });

      describe('when THERE ARE time gaps in the count intervals', () => {
        beforeAll(() => {
          rawVehicleCounts = [0, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          intervalCounts = getIntervalCounts();
          period = getPeriodFromIntervalCounts();
        });

        test('returns the sum of the counts within the period', () => {
          const validCounts = rawVehicleCounts.filter(count => Number.isSafeInteger(count));
          const rawCountsForPeriod = validCounts.slice(
            startIntervalIndex, endIntervalIndex + 1,
          );
          const totalVehiclesForPeriod = rawCountsForPeriod.reduce((p, n) => p + n);
          expect(getTotalsForPeriod().sum.TOTAL_VEHICLES).toEqual(totalVehiclesForPeriod);
        });
      });
    });
  });
});
