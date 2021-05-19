function defaultCollisionFilters() {
  return {
    details: [],
    drivact: [],
    drivcond: [],
    emphasisAreas: [],
    hoursOfDayStart: 0,
    hoursOfDayEnd: 24,
    impactype: [],
    initdir: [],
    injury: [],
    manoeuver: [],
    mvcr: null,
    rdsfcond: [],
    validated: null,
    vehtype: [],
  };
}

function defaultCommonFilters() {
  return {
    dateRangeStart: null,
    dateRangeEnd: null,
    daysOfWeek: [],
  };
}

function defaultStudyFilters() {
  return {
    hours: [],
    studyTypes: [],
  };
}

function defaultStudyRequestFilters() {
  return {
    assignees: [],
    createdAtStart: null,
    createdAtEnd: null,
    dueDateStart: null,
    dueDateEnd: null,
    statuses: [],
    studyTypes: [],
    studyTypeOther: false,
    userOnly: false,
  };
}

/**
 * @namespace
 */
const DefaultFilters = {
  defaultCollisionFilters,
  defaultCommonFilters,
  defaultStudyFilters,
  defaultStudyRequestFilters,
};

export {
  DefaultFilters as default,
  defaultCollisionFilters,
  defaultCommonFilters,
  defaultStudyFilters,
  defaultStudyRequestFilters,
};
