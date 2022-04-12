import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import DateTime from '@/lib/time/DateTime';

describe('ReportCountSummaryTurningMovement', () => {
  const ReportTMC = ReportCountSummaryTurningMovement;
  const INTERVAL_DURATION = ReportTMC.COUNT_INTERVAL_DURATION;
  const INTERVAL_MINS = INTERVAL_DURATION.minutes;
  const countStartTime = DateTime.now();
  const nullSummary = ReportTMC.statSummaryForNullCount();

  let turningMovementCounts = [];

  function getNumberOfCounts() {
    return turningMovementCounts.length;
  }

  function getFormattedCounts() {
    const counts = turningMovementCounts.map((count) => {
      const interval = {
        data: { VEHICLE_TOTAL: count.VEHICLE_TOTAL },
        t: countStartTime.plus({ minutes: count.minutesElapsed }),
      };
      return interval;
    });
    return counts;
  }

  let periodStartMinute;
  let periodEndMinute;
  let nPeriodIntervals;
  let period;
  function getPeriod() {
    const timePeriod = {
      startTime: countStartTime.plus({ minutes: periodStartMinute }),
      endTime: countStartTime.plus({ minutes: periodEndMinute }),
    };
    period = timePeriod;
    return timePeriod;
  }

  describe('totalsForPeriod', () => {
    function getTotalsForPeriod() {
      return ReportTMC.totalsForPeriod(getFormattedCounts(), period);
    }

    beforeAll(() => {
      turningMovementCounts = [
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 0 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 1 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 2 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 3 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 4 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 5 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 6 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 7 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 8 },
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 9 },
      ];
    });

    describe('when the period is not specified', () => {
      test('returns the sum of the counts in ALL the intervals', () => {
        expect(getTotalsForPeriod().sum.VEHICLE_TOTAL).toEqual(getNumberOfCounts());
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
        expect(getTotalsForPeriod().sum.VEHICLE_TOTAL).toEqual(nPeriodIntervals);
      });

      test('returns a time range that is equal to the period', () => {
        expect(getTotalsForPeriod().timeRange.start).toEqual(period.startTime);
        expect(getTotalsForPeriod().timeRange.end).toEqual(period.endTime);
      });

      test('returns the number of count intervals included in the period', () => {
        expect(getTotalsForPeriod().timeRange.nIntervals).toEqual(nPeriodIntervals);
      });

      describe('and there are time gaps in the interval subset', () => {
        beforeAll(() => {
          turningMovementCounts = [
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 0 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 1 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 2 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 3 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 6 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 7 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 8 },
            { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 9 },
          ];
          nPeriodIntervals = 2;
        });

        test('returns the sum of the counts within the period', () => {
          expect(getTotalsForPeriod().sum.VEHICLE_TOTAL).toEqual(nPeriodIntervals);
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

  describe('totalsForPeak', () => {
    const { PEAK_DURATION } = ReportTMC;
    let window;
    function getTotalsForPeak() {
      return ReportTMC.totalsForPeak(getFormattedCounts(), window);
    }

    beforeAll(() => {
      turningMovementCounts = [
        { VEHICLE_TOTAL: 100, minutesElapsed: INTERVAL_MINS * 0 }, // index 0
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 1 }, // index 1
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 2 }, // index 2
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 7 }, // index 3
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 9 }, // index 4
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 10 }, // index 5
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 11 }, // index 6
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 12 }, // index 7
        { VEHICLE_TOTAL: 1, minutesElapsed: INTERVAL_MINS * 13 }, // index 8
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 14 }, // index 9
        { VEHICLE_TOTAL: 0, minutesElapsed: INTERVAL_MINS * 15 }, // index 10
      ];

      periodStartMinute = INTERVAL_MINS * 1;
      periodEndMinute = INTERVAL_MINS * 14;
      window = getPeriod();
    });

    test('returns the earliest peark period with highest count WITHIN the window', () => {
      const peakStartTime = countStartTime.plus({ minutes: INTERVAL_MINS * 10 });
      const peakEndTime = peakStartTime.plus(PEAK_DURATION);
      expect(getTotalsForPeak().timeRange.start).toEqual(peakStartTime);
      expect(getTotalsForPeak().timeRange.end).toEqual(peakEndTime);
    });

    test('returns the correct totals', () => {
      expect(getTotalsForPeak().sum.VEHICLE_TOTAL).toEqual(1);
    });

    describe('when the peak is missing interval counts at the end of the period', () => {
      beforeAll(() => {
        turningMovementCounts[1].VEHICLE_TOTAL = 10;
        turningMovementCounts[2].VEHICLE_TOTAL = 10;
      });

      afterAll(() => {
        turningMovementCounts[1].VEHICLE_TOTAL = 0;
        turningMovementCounts[2].VEHICLE_TOTAL = 0;
      });

      test('the time range returned is the duration of a peak', () => {
        const peakStartTime = countStartTime.plus({ minutes: INTERVAL_MINS * 1 });
        const peakEndTime = peakStartTime.plus(PEAK_DURATION);
        expect(getTotalsForPeak().timeRange.start).toEqual(peakStartTime);
        expect(getTotalsForPeak().timeRange.end).toEqual(peakEndTime);
      });

      test('returns the correct totals', () => {
        expect(getTotalsForPeak().sum.VEHICLE_TOTAL).toEqual(20);
      });
    });

    describe('when the peak is missing interval counts in the middle of the period', () => {
      beforeAll(() => {
        turningMovementCounts[3].VEHICLE_TOTAL = 20;
        turningMovementCounts[4].VEHICLE_TOTAL = 20;
      });

      afterAll(() => {
        turningMovementCounts[3].VEHICLE_TOTAL = 0;
        turningMovementCounts[4].VEHICLE_TOTAL = 0;
      });

      test('the time range returned is the duration of a peak', () => {
        const peakStartTime = countStartTime.plus({ minutes: INTERVAL_MINS * 6 });
        const peakEndTime = peakStartTime.plus(PEAK_DURATION);
        expect(getTotalsForPeak().timeRange.start).toEqual(peakStartTime);
        expect(getTotalsForPeak().timeRange.end).toEqual(peakEndTime);
      });

      test('returns the correct totals', () => {
        expect(getTotalsForPeak().sum.VEHICLE_TOTAL).toEqual(40);
      });
    });

    describe('when the peak is missing interval counts at the start of the period', () => {
      beforeAll(() => {
        turningMovementCounts[4].VEHICLE_TOTAL = 10;
        turningMovementCounts[5].VEHICLE_TOTAL = 10;
        turningMovementCounts[6].VEHICLE_TOTAL = 10;
      });

      afterAll(() => {
        turningMovementCounts[4].VEHICLE_TOTAL = 0;
        turningMovementCounts[5].VEHICLE_TOTAL = 0;
        turningMovementCounts[6].VEHICLE_TOTAL = 0;
      });

      test('the time range returned is the duration of a peak', () => {
        const peakStartTime = countStartTime.plus({ minutes: INTERVAL_MINS * 8 });
        const peakEndTime = peakStartTime.plus(PEAK_DURATION);
        expect(getTotalsForPeak().timeRange.start).toEqual(peakStartTime);
        expect(getTotalsForPeak().timeRange.end).toEqual(peakEndTime);
      });

      test('returns the correct totals', () => {
        expect(getTotalsForPeak().sum.VEHICLE_TOTAL).toEqual(30);
      });
    });

    describe('when there are no intervals in the window', () => {
      beforeAll(() => {
        periodStartMinute = INTERVAL_MINS * 16;
        periodEndMinute = INTERVAL_MINS * 20;
        window = getPeriod();
      });

      test('returns a null count summary', () => {
        expect(getTotalsForPeak()).toEqual(nullSummary);
      });
    });
  });

  describe('averagesForPeriod', () => {
    const totalVehicles = 107;
    const numberOfIntervals = 5;
    const periodTotals = {
      sum: { VEHICLE_TOTAL: totalVehicles },
      timeRange: {
        nIntervals: numberOfIntervals,
        start: countStartTime,
        end: countStartTime.plus({ hours: 6 }),
      },
    };

    test('returns an integer representing the average per hour', () => {
      const hoursInPeriod = numberOfIntervals / 4;
      const avgVehicleCountPerHour = Math.round(totalVehicles / hoursInPeriod);
      const avgSummaryRecieved = ReportTMC.averagesForPeriod(periodTotals);
      expect(avgSummaryRecieved.avg.VEHICLE_TOTAL).toEqual(avgVehicleCountPerHour);
    });
  });
});
