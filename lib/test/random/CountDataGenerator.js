import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  SPEED_CLASSES,
  StudyHours,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';
import DateTime from '@/lib/time/DateTime';

function generateIndexRange(countData) {
  const n = countData.length;
  const a = Random.range(0, n);
  let b = a;
  while (b === a) {
    b = Random.range(0, n);
  }
  if (a < b) {
    return { lo: a, hi: b };
  }
  return { lo: b, hi: a };
}

function generateHourOfDayRange() {
  const a = Random.range(0, 24);
  const b = Random.range(0, 24);
  if (a < b) {
    return { start: a, end: b };
  }
  return { start: b, end: a };
}

function generateWithMissing(countData) {
  const n = countData.length;
  const k = Random.choice([1, 1, 2, 3]);
  const is = Random.sample(ArrayUtils.range(n), k);
  return countData.filter((_, i) => !is.includes(i));
}

// ATR VOLUME DATA

function generateAtrDataPoint(volumeLo, volumeHi, speedClass) {
  const value = Random.range(volumeLo, volumeHi);
  const data = { COUNT: value };
  if (speedClass !== null) {
    data.SPEED_CLASS = speedClass;
  }
  return data;
}

function generateAtrSpeedVolume() {
  const volumeLo = Math.pow(2, Random.range(5, 12));
  const volumeHi = volumeLo * Random.range(2, 4);

  const countData = [];
  const start = DateTime.fromSQL('2000-01-01 00:00');
  const end = DateTime.fromSQL('2000-01-02 00:00');
  let t = start;
  while (t.valueOf() < end.valueOf()) {
    for (let i = 0; i < SPEED_CLASSES.length; i++) {
      const speedClass = i + 1;
      const data = generateAtrDataPoint(volumeLo, volumeHi, speedClass);
      countData.push({ t, data });
    }
    t = t.plus({
      minutes: ReportBaseFlow.MINUTES_PER_ROW,
    });
  }
  return countData;
}

function generateAtrVolume() {
  const volumeLo = Math.pow(2, Random.range(5, 12));
  const volumeHi = volumeLo * Random.range(2, 4);

  const countData = [];
  const start = DateTime.fromSQL('2000-01-01 00:00');
  const end = DateTime.fromSQL('2000-01-02 00:00');
  let t = start;
  while (t.valueOf() < end.valueOf()) {
    const data = generateAtrDataPoint(volumeLo, volumeHi, null);
    countData.push({ t, data });
    t = t.plus({
      minutes: ReportBaseFlow.MINUTES_PER_ROW,
    });
  }
  return countData;
}

// RANDOM

function generateRandomCountDataPoint(keys) {
  const data = {};
  Object.entries(keys).forEach(([key, [volumeLo, volumeHi]]) => {
    const value = Random.range(volumeLo, volumeHi);
    data[key] = value;
  });
  return data;
}

function generateRandomCountData(keys) {
  const countData = [];
  const k = Random.range(10, 20);
  for (let i = 0; i < k; i++) {
    const t = DateTime.fromObject({
      year: 2012,
      month: 4,
      day: 1,
      hour: Random.range(0, 24),
      minute: Random.range(0, 60),
    });
    const data = generateRandomCountDataPoint(keys);
    countData.push({ t, data });
  }
  countData.sort(({ t: ta }, { t: tb }) => ta.valueOf() - tb.valueOf());
  return countData;
}

// TMC DATA

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

function generateTmcDataRanges(studyHours, volumeLo, volumeHi) {
  const dataRanges = studyHours.times.map(([startTime, endTime]) => {
    const start = DateTime.fromSQL(`2000-01-01 ${startTime}`);
    const end = DateTime.fromSQL(`2000-01-01 ${endTime}`);
    return generateTmcDataRange(start, end, volumeLo, volumeHi);
  });
  return Array.prototype.concat.apply([], dataRanges);
}

function generateTmc() {
  const volumeLo = Math.pow(2, Random.range(5, 12));
  const volumeHi = volumeLo * Random.range(2, 4);

  const isRoutine = Math.random() < 0.8;
  if (isRoutine) {
    return generateTmcDataRanges(StudyHours.ROUTINE, volumeLo, volumeHi);
  }
  return generateTmcDataRanges(StudyHours.SCHOOL, volumeLo, volumeHi);
}

function generateTmc14Hour() {
  const volumeLo = Math.pow(2, Random.range(5, 12));
  const volumeHi = volumeLo * Random.range(2, 4);
  const times = [['06:00', '20:00']];
  return generateTmcDataRanges({ times }, volumeLo, volumeHi);
}

/**
 * @namespace
 */
const CountDataGenerator = {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateHourOfDayRange,
  generateIndexRange,
  generateRandomCountData,
  generateTmcDataPoint,
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
};

export {
  CountDataGenerator as default,
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateHourOfDayRange,
  generateIndexRange,
  generateRandomCountData,
  generateTmcDataPoint,
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
};
