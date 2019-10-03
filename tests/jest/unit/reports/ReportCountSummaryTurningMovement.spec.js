import ArrayUtils from '@/lib/ArrayUtils';
import { CountHours } from '@/lib/Constants';
import Random from '@/lib/Random';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';

const dirs = ['N', 'E', 'S', 'W'];
const turns = ['R', 'T', 'L'];
const dirModes = ['PEDS', 'BIKE', 'OTHER'];
const turnModes = ['CARS', 'TRUCK', 'BUS'];

function randomTmcDataPoint(volumeLo, volumeHi) {
  const data = {};
  dirs.forEach((dir) => {
    dirModes.forEach((mode) => {
      const key = `${dir}_${mode}`;
      const value = Random.range(volumeLo, volumeHi);
      data[key] = value;
    });
    turns.forEach((turn) => {
      turnModes.forEach((mode) => {
        const key = `${dir}_${mode}_${turn}`;
        const value = Random.range(volumeLo, volumeHi);
        data[key] = value;
      });
    });
  });
  return data;
}

function randomTmcDataRange(start, end, volumeLo, volumeHi) {
  const dataRange = [];
  let t = start;
  while (t.valueOf() < end.valueOf()) {
    t = new Date(
      t.getFullYear(),
      t.getMonth(),
      t.getDate(),
      t.getHours(),
      t.getMinutes() + ReportBaseFlow.MINUTES_PER_ROW,
      t.getSeconds(),
    );
    const data = randomTmcDataPoint(volumeLo, volumeHi);
    dataRange.push({ t, data });
  }
  return dataRange;
}

function randomTmcDataRanges(timeRanges, volumeLo, volumeHi) {
  const dataRanges = timeRanges.map(([startTime, endTime]) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return randomTmcDataRange(start, end, volumeLo, volumeHi);
  });
  return Array.prototype.concat.apply([], dataRanges);
}

function randomTmcDataSet() {
  const countId = Random.range(1000, 100000);
  const volumeLo = Math.pow(2, Random.range(5, 12));
  const volumeHi = volumeLo * Random.range(2, 4);

  const isRoutine = Math.random() < 0.8;
  let dataSet;
  if (isRoutine) {
    dataSet = randomTmcDataRanges(CountHours.ROUTINE, volumeLo, volumeHi);
  } else {
    dataSet = randomTmcDataRanges(CountHours.SCHOOL, volumeLo, volumeHi);
  }

  return dataSet.map(({ t, data }, i) => ({
    id: i + 1,
    countId,
    t,
    data,
  }));
}

test('ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals', () => {
  // fuzz test
  for (let i = 0; i < 25; i++) {
    const rawData = randomTmcDataPoint();
    const data = ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals(rawData);

    // every vehicle that enters must exit
    turnModes.forEach((mode) => {
      const sumModeEnters = ArrayStats.sum(dirs.map(
        dir => data[`${dir}_${mode}_TOTAL`],
      ));
      const sumModeExits = ArrayStats.sum(dirs.map(
        dir => data[`${dir}_${mode}_EXITS`],
      ));
      expect(sumModeExits).toBe(sumModeEnters);
    });
    const sumVehicleEnters = ArrayStats.sum(dirs.map(
      dir => data[`${dir}_VEHICLE_TOTAL`],
    ));
    const sumVehicleExits = ArrayStats.sum(dirs.map(
      dir => data[`${dir}_VEHICLE_EXITS`],
    ));
    expect(sumVehicleExits).toBe(sumVehicleEnters);
  }
});

test('ReportCountSummaryTurningMovement.sumIndices', () => {
  // fuzz test
  for (let i = 0; i < 10; i++) {
    const k = 5;
    const countData = randomTmcDataSet();
    const indices = Random.sample(ArrayUtils.range(countData.length), k);
    const sum = ReportCountSummaryTurningMovement.sumIndices(countData, indices);
    const keysToTest = Random.sample(Array.from(Object.keys(countData[0].data)), k);
    keysToTest.forEach((key) => {
      expect(sum[key]).toBe(
        ArrayStats.sum(
          ArrayUtils.selectIndices(countData, indices)
            .map(({ data }) => data[key]),
        ),
      );
    });
  }
});
