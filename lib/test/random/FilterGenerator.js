import ArrayUtils from '@/lib/ArrayUtils';
import {
  CollisionDetail,
  CollisionEmphasisArea,
  StudyHours,
  StudyRequestAssignee,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import DateTime from '@/lib/time/DateTime';

const ks = [0, 0, 0, 0, 1, 1, 2, 3];
const factorValues = {
  drivact: [1, 2, 3, 4, 99],
  drivcond: [1, 2, 3, 4, 99],
  impactype: [1, 2, 3, 4, 99],
  initdir: [0, 1, 2, 3, 4],
  injury: [0, 1, 2, 3, 4],
  manoeuver: [1, 2, 3, 4, 99],
  rdsfcond: [1, 2, 3, 4, 99],
  vehtype: [1, 2, 14, 36, 99],
};

// UTILITY METHODS

function generateTernaryBool() {
  const applyFilter = Random.bool();
  if (!applyFilter) {
    return null;
  }
  return Random.bool();
}

function generateSample(values) {
  const applySample = Random.bool();
  if (!applySample) {
    return [];
  }
  const k = Random.choice(ks);
  return Random.sample(values, k);
}

function generateEnumSample(enumClass, extraValues = []) {
  const values = [
    ...enumClass.enumValues,
    ...extraValues,
  ];
  return generateSample(values);
}

// COLLISION FILTERS

function generateMvcrFilter(fieldName) {
  const applyMvcrFilter = Random.bool();
  if (!applyMvcrFilter) {
    return [];
  }
  const k = Random.choice(ks);
  return Random.sample(factorValues[fieldName], k);
}

function generateHoursOfDay() {
  let a = 0;
  let b = 24;
  if (Random.bool()) {
    a = Random.range(25);
    b = Random.range(25);
  }
  if (a < b) {
    return {
      hoursOfDayStart: a,
      hoursOfDayEnd: b,
    };
  }
  return {
    hoursOfDayStart: b,
    hoursOfDayEnd: a,
  };
}

function generateFiltersCollision() {
  const details = generateEnumSample(CollisionDetail);
  const drivact = generateMvcrFilter('drivact');
  const drivcond = generateMvcrFilter('drivcond');
  const emphasisAreas = generateEnumSample(CollisionEmphasisArea);
  const hoursOfDay = generateHoursOfDay();
  const impactype = generateMvcrFilter('impactype');
  const initdir = generateMvcrFilter('initdir');
  const injury = generateMvcrFilter('injury');
  const manoeuver = generateMvcrFilter('manoeuver');
  const mvcr = generateTernaryBool();
  const rdsfcond = generateMvcrFilter('rdsfcond');
  const validated = generateTernaryBool();
  const vehtype = generateMvcrFilter('vehtype');

  return {
    details,
    drivact,
    drivcond,
    emphasisAreas,
    ...hoursOfDay,
    impactype,
    initdir,
    injury,
    manoeuver,
    mvcr,
    rdsfcond,
    validated,
    vehtype,
  };
}

// COMMON FILTERS

function generateDateRange() {
  const now = DateTime.local();
  const nowMinus20Years = now.minus({ years: 20 });

  const ta = Random.range(nowMinus20Years.valueOf(), now.valueOf());
  const a = DateTime.fromMillis(ta);
  const tb = Random.range(nowMinus20Years.valueOf(), now.valueOf());
  const b = DateTime.fromMillis(tb);

  if (ta < tb) {
    return { start: a, end: b };
  }
  return { start: b, end: a };
}

function generateFiltersCommon() {
  let dateRangeStart = null;
  let dateRangeEnd = null;
  if (Random.bool()) {
    const { start, end } = generateDateRange();
    if (Random.bool()) {
      dateRangeStart = start;
    }
    if (Random.bool()) {
      dateRangeEnd = end;
    }
  }

  const k = Random.choice(ks);
  const daysOfWeek = Random.sample(ArrayUtils.range(7), k);

  return {
    dateRangeStart,
    dateRangeEnd,
    daysOfWeek,
  };
}

// STUDY FILTERS

function generateFiltersStudy() {
  const hours = generateEnumSample(StudyHours);
  const studyTypes = generateEnumSample(StudyType);
  return { hours, studyTypes };
}

// VIEW DATA FILTER FUNCTIONS

function generateFilters() {
  const filtersCollision = generateFiltersCollision();
  const filtersCommon = generateFiltersCommon();
  const filtersStudy = generateFiltersStudy();
  return {
    filtersCollision,
    filtersCommon,
    filtersStudy,
  };
}

// STUDY REQUEST FILTERS

function generateQueryFilter() {
  const applyQuery = Random.bool();
  if (!applyQuery) {
    return { column: null, query: null };
  }
  const column = Random.choice([
    'ID',
    'LOCATION',
    'REQUESTER',
    null,
  ]);
  const query = column === 'ID' ? '73' : 'esavage';
  return { column, query };
}

function generateFiltersStudyRequest() {
  const assignees = generateEnumSample(StudyRequestAssignee, ['']);
  const queryFilter = generateQueryFilter();
  const sortBy = Random.choice([
    'CREATED_AT',
    'DUE_DATE',
    'ID',
    'LOCATION',
    'REQUESTER',
  ]);
  const sortDesc = Random.bool();
  const statuses = generateEnumSample(StudyRequestStatus);
  const studyTypes = generateEnumSample(StudyType);
  const studyTypeOther = Random.bool();
  const userOnly = Random.bool();

  return {
    assignees,
    limit: 10,
    offset: 0,
    sortBy,
    sortDesc,
    statuses,
    studyTypes,
    studyTypeOther,
    userOnly,
    ...queryFilter,
  };
}

/**
 * @namespace
 */
const FilterGenerator = {
  generateFilters,
  generateFiltersCollision,
  generateFiltersCommon,
  generateFiltersStudy,
  generateFiltersStudyRequest,
};

export {
  FilterGenerator as default,
  generateFilters,
  generateFiltersCollision,
  generateFiltersCommon,
  generateFiltersStudy,
  generateFiltersStudyRequest,
};
