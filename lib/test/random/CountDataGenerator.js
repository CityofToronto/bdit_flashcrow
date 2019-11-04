import {
  CardinalDirection,
  CountHours,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';

function generateHourlyMajorAndMinorDirections(hourlyData) {
  const northSouth = [CardinalDirection.NORTH, CardinalDirection.SOUTH];
  const eastWest = [CardinalDirection.EAST, CardinalDirection.WEST];
  const hourlyMajorDirections = [];
  const hourlyMinorDirections = [];
  hourlyData.forEach(() => {
    if (Math.random() < 0.5) {
      hourlyMajorDirections.push(northSouth);
      hourlyMinorDirections.push(eastWest);
    } else {
      hourlyMajorDirections.push(eastWest);
      hourlyMinorDirections.push(northSouth);
    }
  });
  return {
    hourlyMajorDirections,
    hourlyMinorDirections,
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
    t = t.plus({
      minutes: ReportBaseFlow.MINUTES_PER_ROW,
    });
    const data = generateTmcDataPoint(volumeLo, volumeHi);
    dataRange.push({ t, data });
  }
  return dataRange;
}

function generateTmcDataRanges(timeRanges, volumeLo, volumeHi) {
  const dataRanges = timeRanges.map(([startTime, endTime]) => {
    const start = DateTime.fromSQL(`2000-01-01 ${startTime}`);
    const end = DateTime.fromSQL(`2000-01-01 ${endTime}`);
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
  generateHourlyMajorAndMinorDirections,
  generateTmcDataPoint,
  generateTmc,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
};

export {
  CountDataGenerator as default,
  generateHourlyMajorAndMinorDirections,
  generateTmcDataPoint,
  generateTmc,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
};
