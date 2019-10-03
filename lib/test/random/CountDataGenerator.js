import {
  CardinalDirection,
  CountHours,
  TurningMovement,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

// TODO: should these be moved to Constants?
const TMC_MODES_NON_VEHICLE = ['PEDS', 'BIKE', 'OTHER'];
const TMC_MODES_VEHICLE = ['CARS', 'TRUCK', 'BUS'];

function generateMajorAndMinorDirections() {
  const northSouth = [CardinalDirection.NORTH, CardinalDirection.SOUTH];
  const eastWest = [CardinalDirection.EAST, CardinalDirection.WEST];
  if (Math.random() < 0.5) {
    return {
      majorDirections: northSouth,
      minorDirections: eastWest,
    };
  }
  return {
    majorDirections: eastWest,
    minorDirections: northSouth,
  };
}

function generateTmcDataPoint(volumeLo, volumeHi) {
  const data = {};
  CardinalDirection.enumValues.forEach(({ short: dir }) => {
    TMC_MODES_NON_VEHICLE.forEach((mode) => {
      const key = `${dir}_${mode}`;
      const value = Random.range(volumeLo, volumeHi);
      data[key] = value;
    });
    TurningMovement.enumValues.forEach(({ short: turn }) => {
      TMC_MODES_VEHICLE.forEach((mode) => {
        const key = `${dir}_${mode}_${turn}`;
        const value = Random.range(volumeLo, volumeHi);
        data[key] = value;
      });
    });
  });
  return data;
}

function generateTmcDataRange(start, end, volumeLo, volumeHi) {
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
    const data = generateTmcDataPoint(volumeLo, volumeHi);
    dataRange.push({ t, data });
  }
  return dataRange;
}

function generateTmcDataRanges(timeRanges, volumeLo, volumeHi) {
  const dataRanges = timeRanges.map(([startTime, endTime]) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return generateTmcDataRange(start, end, volumeLo, volumeHi);
  });
  return Array.prototype.concat.apply([], dataRanges);
}

function generateTmc() {
  const countId = Random.range(1000, 100000);
  const volumeLo = Math.pow(2, Random.range(5, 12));
  const volumeHi = volumeLo * Random.range(2, 4);

  const isRoutine = Math.random() < 0.8;
  let dataSet;
  if (isRoutine) {
    dataSet = generateTmcDataRanges(CountHours.ROUTINE, volumeLo, volumeHi);
  } else {
    dataSet = generateTmcDataRanges(CountHours.SCHOOL, volumeLo, volumeHi);
  }

  return dataSet.map(({ t, data }, i) => ({
    id: i + 1,
    countId,
    t,
    data,
  }));
}

/**
 * @namespace
 */
const CountDataGenerator = {
  generateMajorAndMinorDirections,
  generateTmcDataPoint,
  generateTmc,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
};

export {
  CountDataGenerator as default,
  generateMajorAndMinorDirections,
  generateTmcDataPoint,
  generateTmc,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
};
