const STORAGE_KEY_COLLISION_FILTER_STATE = 'ca.toronto.move.collisionFilterState';
const STORAGE_KEY_COMMON_FILTER_STATE = 'ca.toronto.move.commonFilterState';
const STORAGE_KEY_STUDY_FILTER_STATE = 'ca.toronto.move.studyFilterState';

function saveCollisionFilterState(filterState) {
  const filters = JSON.stringify(filterState);
  window.sessionStorage.setItem(STORAGE_KEY_COLLISION_FILTER_STATE, filters);
}

function saveCommonFilterState(filterState) {
  const filters = JSON.stringify(filterState);
  window.sessionStorage.setItem(STORAGE_KEY_COMMON_FILTER_STATE, filters);
}

function saveStudyFilterState(filterState) {
  const filters = JSON.stringify(filterState);
  window.sessionStorage.setItem(STORAGE_KEY_STUDY_FILTER_STATE, filters);
}

function getCollisionFilterState() {
  return window.sessionStorage.getItem(STORAGE_KEY_COLLISION_FILTER_STATE);
}

function getCommonFilterState() {
  return window.sessionStorage.getItem(STORAGE_KEY_COMMON_FILTER_STATE);
}

function getStudyFilterState() {
  return window.sessionStorage.getItem(STORAGE_KEY_STUDY_FILTER_STATE);
}
function resetCollisionFilterState(filter) {
  const currentFilters = JSON.parse(getCollisionFilterState());
  if (filter === 'hoursOfDay') {
    currentFilters.hoursOfDayStart = 0;
    currentFilters.hoursOfDayEnd = 24;
  } else if (filter === 'mvcr' || filter === 'validated') {
    currentFilters[filter] = null;
  } else {
    currentFilters[filter] = [];
  }
  saveCollisionFilterState(currentFilters);
}

function resetCommonFilterState(filter) {
  const currentFilters = JSON.parse(getCommonFilterState());
  if (filter === 'dateRange') {
    currentFilters.dateRangeStart = null;
    currentFilters.dateRangeEnd = null;
  } else {
    currentFilters[filter] = [];
  }
  saveCommonFilterState(currentFilters);
}

function resetStudyFilterState(filter) {
  const currentFilters = JSON.parse(getStudyFilterState());
  currentFilters[filter] = [];
  saveStudyFilterState(currentFilters);
}

function clearCollisionFilterState() {
  window.sessionStorage.removeItem(STORAGE_KEY_COLLISION_FILTER_STATE);
}

function clearCommonFilterState() {
  window.sessionStorage.removeItem(STORAGE_KEY_COMMON_FILTER_STATE);
}

function clearStudyFilterState() {
  window.sessionStorage.removeItem(STORAGE_KEY_STUDY_FILTER_STATE);
}

const FilterState = {
  clearCollisionFilterState,
  clearCommonFilterState,
  clearStudyFilterState,
  getCollisionFilterState,
  getCommonFilterState,
  getStudyFilterState,
  resetCollisionFilterState,
  resetCommonFilterState,
  resetStudyFilterState,
  saveCollisionFilterState,
  saveCommonFilterState,
  saveStudyFilterState,
};

export {
  FilterState as default,
  clearCollisionFilterState,
  clearCommonFilterState,
  clearStudyFilterState,
  getCollisionFilterState,
  getCommonFilterState,
  getStudyFilterState,
  resetCollisionFilterState,
  resetCommonFilterState,
  resetStudyFilterState,
  saveCollisionFilterState,
  saveCommonFilterState,
  saveStudyFilterState,
};
