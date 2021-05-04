import ArrayUtils from '@/lib/ArrayUtils';

function getFieldCodes(fieldName, fieldEntries) {
  if (fieldName === 'injury') {
    return [{ key: 'KSI', text: 'KSI', values: [4, 3] }, 2, 1, 0];
  }
  if (fieldName === 'vehtype') {
    return [
      1,
      36,
      2,
      3,
      4,
      5,
      6,
      { key: 'TRUCKS', text: 'Commercial Trucks', values: [7, 8, 9, 10, 11, 12, 13, 98] },
      { key: 'BUSES', text: 'Buses', values: [14, 15, 16] },
      { key: 'SCHOOL', text: 'School vehicles', values: [17, 18, 19] },
      20,
      { key: 'OFF_ROAD', text: 'Off-road vehicles', values: [21, 22, 23, 24] },
      { key: 'SPECIAL', text: 'Specialized vehicles', values: [25, 31, 26, 27, 28] },
      29,
      30,
      { key: 'EMS', text: 'Emergency vehicles', values: [32, 33, 34, 35] },
      99,
    ];
  }

  let fieldCodes = [];
  let hasOther = false;
  let hasUnknown = false;
  Array.from(fieldEntries).forEach(([value]) => {
    if (value === 99) {
      hasOther = true;
    } else if (value === 0) {
      hasUnknown = true;
    } else {
      fieldCodes.push(value);
    }
  });
  fieldCodes = ArrayUtils.sortBy(fieldCodes, value => value);
  if (hasOther) {
    fieldCodes.push(99);
  }
  if (hasUnknown) {
    fieldCodes.push(0);
  }
  return fieldCodes;
}

function isLeafFieldCode(fieldCode) {
  return Number.isInteger(fieldCode);
}

/**
 * @namespace
 */
const CollisionFilterGroups = {
  getFieldCodes,
  isLeafFieldCode,
};

export {
  CollisionFilterGroups as default,
  getFieldCodes,
  isLeafFieldCode,
};
