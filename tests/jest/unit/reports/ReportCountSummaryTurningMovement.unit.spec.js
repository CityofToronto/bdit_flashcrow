import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import DateTime from '@/lib/time/DateTime';

describe('ReportCountSummaryTurningMovement', () => {
  const ReportTMC = ReportCountSummaryTurningMovement;

  describe('totalsForPeriod', () => {
    const rawVehicleCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const countStartTime = DateTime.now();
    const intervalCounts = rawVehicleCounts.map((count, i) => {
      const minutesElapsedFromStart = 15 * i;
      const interval = {
        data: { TOTAL_VEHICLES: count },
        t: countStartTime.plus({ minutes: minutesElapsedFromStart }),
      };
      return interval;
    });

    describe('when a period is not specified', () => {
      const totalsSummary = ReportTMC.totalsForPeriod(intervalCounts);

      test('returns the sum of the counts in ALL the intervals', () => {
        const totalVehicles = rawVehicleCounts.reduce((p, n) => p + n);
        expect(totalsSummary.sum.TOTAL_VEHICLES).toEqual(totalVehicles);
      });

      test('returns the full time range covered by the set of intervals', () => {
        const intervalStartTime = intervalCounts[0].t;
        const nIntervals = intervalCounts.length;
        const intervalEndTime = intervalCounts[nIntervals - 1].t.plus({ minutes: 15 });
        expect(totalsSummary.timeRange.start).toEqual(intervalStartTime);
        expect(totalsSummary.timeRange.end).toEqual(intervalEndTime);
      });
    });

    describe('for a period that is a subset of the full interval window', () => {
      const periodStartIntervalIndex = 1;
      const periodEndIntervalIndex = 9;
      const period = {
        startTime: intervalCounts[periodStartIntervalIndex].t,
        endTime: intervalCounts[periodEndIntervalIndex].t.plus({ minutes: 15 }),
      };
      const totalsSummary = ReportTMC.totalsForPeriod(intervalCounts, period);

      test('returns the sum of the counts within the period ', () => {
        const rawCountsForPeriod = rawVehicleCounts.slice(
          periodStartIntervalIndex, periodEndIntervalIndex + 1,
        );
        const totalVehiclesForPeriod = rawCountsForPeriod.reduce((p, n) => p + n);
        expect(totalsSummary.sum.TOTAL_VEHICLES).toEqual(totalVehiclesForPeriod);
      });

      test('returns a time range that is equal to the period', () => {
        const periodStartTime = intervalCounts[periodStartIntervalIndex].t;
        const periodEndTime = intervalCounts[periodEndIntervalIndex].t.plus({ minutes: 15 });
        expect(totalsSummary.timeRange.start).toEqual(periodStartTime);
        expect(totalsSummary.timeRange.end).toEqual(periodEndTime);
      });

      test('returns the number of count intervals included in the period', () => {
        const nIntervalsInPeriod = periodEndIntervalIndex - periodStartIntervalIndex + 1;
        expect(totalsSummary.timeRange.nIntervals).toEqual(nIntervalsInPeriod);
      });
    });
  });
});
