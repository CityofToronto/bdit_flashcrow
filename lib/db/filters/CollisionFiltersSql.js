function getCentrelineFilter(features) {
  const featureIds = features.map(
    ({ centrelineId, centrelineType }) => `(${centrelineType}, ${centrelineId})`,
  );
  const featureIdsStr = featureIds.join(', ');
  return `(ec.centreline_type, ec.centreline_id) IN (${featureIdsStr})`;
}

function getCollisionFilters(features, collisionQuery) {
  const centrelineFilter = getCentrelineFilter(features);
  const filters = [centrelineFilter];
  const params = {};
  const {
    dateRange,
    daysOfWeek,
    drivact,
    drivcond,
    emphasisAreas,
    hoursOfDay,
    impactype,
    initdir,
    manoeuver,
    rdsfcond,
  } = collisionQuery;
  if (dateRange !== null) {
    params.dateRangeStart = dateRange.start;
    params.dateRangeEnd = dateRange.end;
    filters.push('e.accdate >= $(dateRangeStart)');
    filters.push('e.accdate < $(dateRangeEnd)');
  }
  if (daysOfWeek !== null) {
    params.daysOfWeek = daysOfWeek;
    filters.push('date_part(\'DOW\', e.accdate) IN ($(daysOfWeek:csv))');
  }
  if (drivact !== null) {
    params.drivact = drivact;
    filters.push('i.drivact IN ($(drivact:csv))');
  }
  if (drivcond !== null) {
    params.drivcond = drivcond;
    filters.push('i.drivcond IN ($(drivcond:csv))');
  }
  if (emphasisAreas !== null) {
    const filterEmphasisAreas = emphasisAreas
      .map(({ field }) => `e.${field}`)
      .join(' OR ');
    filters.push(`(${filterEmphasisAreas})`);
  }
  if (hoursOfDay !== null) {
    const [hourStart, hourEnd] = hoursOfDay;
    params.hourStart = hourStart;
    params.hourEnd = hourEnd - 1;
    filters.push('date_part(\'HOUR\', e.accdate) BETWEEN $(hourStart) AND $(hourEnd)');
  }
  if (impactype !== null) {
    params.impactype = impactype;
    filters.push('e.impactype IN ($(impactype:csv))');
  }
  if (initdir !== null) {
    params.initdir = initdir;
    filters.push('i.initdir IN ($(initdir:csv))');
  }
  if (manoeuver !== null) {
    params.manoeuver = manoeuver;
    filters.push('i.manoeuver IN ($(manoeuver:csv))');
  }
  if (rdsfcond !== null) {
    params.rdsfcond = rdsfcond;
    filters.push('e.rdsfcond IN ($(rdsfcond:csv))');
  }
  return { filters, params };
}

/**
 * @namespace
 */
const CollisionFiltersSql = {
  getCentrelineFilter,
  getCollisionFilters,
};

export {
  CollisionFiltersSql as default,
  getCentrelineFilter,
  getCollisionFilters,
};
