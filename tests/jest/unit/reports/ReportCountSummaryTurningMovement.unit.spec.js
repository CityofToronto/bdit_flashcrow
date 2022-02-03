import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import DateTime from '@/lib/time/DateTime';

describe('ReportCountSummaryTurningMovement', () => {
  const ReportTMC = ReportCountSummaryTurningMovement;
  const INTERVAL_DURATION = ReportTMC.COUNT_INTERVAL_DURATION;
  const INTERVAL_MINS = INTERVAL_DURATION.minutes;
  const countStartTime = DateTime.now();
  const nullSummary = ReportTMC.statSummaryForNullCount();

  describe('totalsForPeriod', () => {
    let turningMovementCounts = [
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 0 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 1 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 2 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 3 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 4 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 5 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 6 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 7 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 8 },
      { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 9 },
    ];
    function formatCounts() {
      const counts = turningMovementCounts.map((count) => {
        const interval = {
          data: { TOTAL_VEHICLES: count.TOTAL_VEHICLES },
          t: countStartTime.plus({ minutes: count.minutesElapsed }),
        };
        return interval;
      });
      return counts;
    }
    function getNumberOfCounts() {
      return turningMovementCounts.length;
    }

    let periodStartMinute;
    let periodEndMinute;
    let nPeriodIntervals;
    function getPeriod() {
      return {
        startTime: countStartTime.plus({ minutes: periodStartMinute }),
        endTime: countStartTime.plus({ minutes: periodEndMinute }),
      };
    }

    let period;
    function getTotalsForPeriod() {
      return ReportTMC.totalsForPeriod(formatCounts(), period);
    }

    describe('when the period is not specified', () => {
      test('returns the sum of the counts in ALL the intervals', () => {
        expect(getTotalsForPeriod().sum.TOTAL_VEHICLES).toEqual(getNumberOfCounts());
      });

      test('returns the full time range covered by the set of intervals', () => {
        const countEndTime = countStartTime.plus({ minutes: INTERVAL_MINS * getNumberOfCounts() });
        expect(getTotalsForPeriod().timeRange.start).toEqual(countStartTime);
        expect(getTotalsForPeriod().timeRange.end).toEqual(countEndTime);
      });
    });

    describe('when the period includes a subset of the count intervals', () => {
      beforeAll(() => {
        periodStartMinute = INTERVAL_MINS * 2;
        periodEndMinute = INTERVAL_MINS * 6;
        period = getPeriod();
        nPeriodIntervals = 4;
      });

      test('returns the sum of the counts within the period ', () => {
        expect(getTotalsForPeriod().sum.TOTAL_VEHICLES).toEqual(nPeriodIntervals);
      });

      test('returns a time range that is equal to the period', () => {
        expect(getTotalsForPeriod().timeRange.start).toEqual(period.startTime);
        expect(getTotalsForPeriod().timeRange.end).toEqual(period.endTime);
      });

      test('returns the number of count intervals included in the period', () => {
        expect(getTotalsForPeriod().timeRange.nIntervals).toEqual(nPeriodIntervals);
      });

      describe('and there are time gaps in the subet', () => {
        beforeAll(() => {
          turningMovementCounts = [
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 0 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 1 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 2 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 3 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 6 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 7 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 8 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 9 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 10 },
            { TOTAL_VEHICLES: 1, minutesElapsed: INTERVAL_MINS * 11 },
          ];
          nPeriodIntervals = 2;
        });

        test('returns the sum of the counts within the period', () => {
          expect(getTotalsForPeriod().sum.TOTAL_VEHICLES).toEqual(nPeriodIntervals);
        });
      });
    });

    describe('when the period does NOT include any count intervals', () => {
      beforeAll(() => {
        periodStartMinute = INTERVAL_MINS * 10;
        periodEndMinute = INTERVAL_MINS * 15;
        period = getPeriod();
        nPeriodIntervals = 0;
      });

      test('returns a null count summary', () => {
        expect(getTotalsForPeriod()).toEqual(nullSummary);
      });
    });
  });
});
