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
import { defaultStudyRequestFilters } from '@/lib/filters/DefaultFilters';
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

function generateDateRangeImpl(yearsMin, yearsMax) {
  const now = DateTime.local();
  const tMin = now.plus({ years: yearsMin }).valueOf();
  const tMax = now.plus({ years: yearsMax }).valueOf();

  const ta = Random.range(tMin, tMax);
  const a = DateTime.fromMillis(ta);
  const tb = Random.range(tMin, tMax);
  const b = DateTime.fromMillis(tb);

  if (ta < tb) {
    return { start: a, end: b };
  }
  return { start: b, end: a };
}

function generateDateRange(yearsMin, yearsMax) {
  const applyDateRange = Random.bool();
  if (applyDateRange) {
    return { start: null, end: null };
  }
  let { start, end } = generateDateRangeImpl(yearsMin, yearsMax);
  if (!Random.bool()) {
    start = null;
  }
  if (!Random.bool()) {
    end = null;
  }
  return { start, end };
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

function generateFiltersCommon() {
  const { start: dateRangeStart, end: dateRangeEnd } = generateDateRange(-20, 0);

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

function generateQuery(column) {
  const idStr = Random.range(1, 1001).toString();
  if (column === 'ID') {
    return idStr;
  }
  if (column === 'LOCATION') {
    return 'Bloor';
  }
  if (column === 'REQUESTER') {
    return 'esavage';
  }
  return Random.choice(['jane', idStr]);
}

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
  const query = generateQuery(column);
  return { column, query };
}

function generateFiltersStudyRequest() {
  const assignees = generateEnumSample(StudyRequestAssignee, ['']);
  const { start: createdAtStart, end: createdAtEnd } = generateDateRange(-1, 0);
  const { start: dueDateStart, end: dueDateEnd } = generateDateRange(-0.25, 0.5);
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
    createdAtEnd,
    createdAtStart,
    dueDateEnd,
    dueDateStart,
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

function generateFiltersStudyRequestForStudyRequestId(studyRequestId) {
  return {
    ...defaultStudyRequestFilters(),
    column: 'ID',
    limit: 10,
    offset: 0,
    query: studyRequestId.toString(),
    sortBy: 'ID',
    sortDesc: true,
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
  generateFiltersStudyRequestForStudyRequestId,
};

export {
  FilterGenerator as default,
  generateFilters,
  generateFiltersCollision,
  generateFiltersCommon,
  generateFiltersStudy,
  generateFiltersStudyRequest,
  generateFiltersStudyRequestForStudyRequestId,
};
