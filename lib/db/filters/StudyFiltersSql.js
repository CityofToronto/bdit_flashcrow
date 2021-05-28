function toCategoryIds(studyTypes, categories) {
  const categoryIds = [];
  categories.forEach(({ studyType }, categoryId) => {
    if (studyTypes.includes(studyType)) {
      categoryIds.push(categoryId);
    }
  });
  return categoryIds;
}

function getCentrelineFilter(features) {
  if (features.length === 0) {
    return 'FALSE';
  }
  const featureIds = features.map(
    ({ centrelineId, centrelineType }) => `(${centrelineType}, ${centrelineId})`,
  );
  const featureIdsStr = featureIds.join(', ');
  return `(centreline_type, centreline_id) IN (${featureIdsStr})`;
}

function getStudyFilters(features, studyQuery, categories) {
  const centrelineFilter = getCentrelineFilter(features);
  const filters = [centrelineFilter];
  const params = {};
  const {
    dateRangeStart,
    dateRangeEnd,
    daysOfWeek,
    hours,
    studyTypes,
  } = studyQuery;
  if (dateRangeStart !== null) {
    params.dateRangeStart = dateRangeStart;
    filters.push('start_date >= $(dateRangeStart)');
  }
  if (dateRangeEnd !== null) {
    params.dateRangeEnd = dateRangeEnd;
    filters.push('start_date < $(dateRangeEnd)');
  }
  if (daysOfWeek.length > 0) {
    params.daysOfWeek = daysOfWeek;
    filters.push('"daysOfWeek" && \'{$(daysOfWeek:csv)}\'');
  }
  if (hours.length > 0) {
    params.hours = hours;
    filters.push('hours IN ($(hours:csv))');
  }
  if (studyTypes.length > 0) {
    const categoryIds = toCategoryIds(studyTypes, categories);
    if (categoryIds.length === 0) {
      // TODO: better error handling
      return { filters, params };
    }
    params.categoryIds = categoryIds;
    filters.push('"CATEGORY_ID" IN ($(categoryIds:csv))');
  }
  return { filters, params };
}

/**
 * @namespace
 */
const StudyFiltersSql = {
  getCentrelineFilter,
  getStudyFilters,
};

export {
  StudyFiltersSql as default,
  getCentrelineFilter,
  getStudyFilters,
};
