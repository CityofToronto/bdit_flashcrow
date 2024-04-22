import { StudyType } from '@/lib/Constants';

function getCentrelineFilter(features) {
  if (features.length === 0) {
    return 'FALSE';
  }
  const featureIds = features.map(
    ({ centrelineId, centrelineType }) => `(${centrelineType}, ${centrelineId})`,
  );
  const featureIdsStr = featureIds.join(', ');
  return `("centrelineType", "centrelineId") IN (${featureIdsStr})`;
}

function getExcludedStudiesFilter() {
  const excludedStudyNames = StudyType.enumValues.filter(element => element.maskStudy)
    .map(element => `'${element.name}'`);
  const formattedSQLFilter = excludedStudyNames.join(',');
  return formattedSQLFilter;
}

function getStudyFilters(features, studyQuery) {
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
    filters.push('"startDate" >= $(dateRangeStart)');
  }
  if (dateRangeEnd !== null) {
    params.dateRangeEnd = dateRangeEnd;
    filters.push('"startDate" < $(dateRangeEnd)');
  }
  if (daysOfWeek.length > 0) {
    params.daysOfWeek = daysOfWeek;
    filters.push('"daysOfWeek" && \'{$(daysOfWeek:csv)}\'');
  }
  if (hours.length > 0) {
    params.hours = hours;
    filters.push('"hours" IN ($(hours:csv))');
  }
  if (studyTypes.length > 0) {
    params.studyTypes = studyTypes;
    filters.push('"studyType" IN ($(studyTypes:csv))');
  }
  return { filters, params };
}

/**
 * @namespace
 */
const StudyFiltersSql = {
  getCentrelineFilter,
  getExcludedStudiesFilter,
  getStudyFilters,
};

export {
  StudyFiltersSql as default,
  getCentrelineFilter,
  getStudyFilters,
  getExcludedStudiesFilter,
};
