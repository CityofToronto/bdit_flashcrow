function getCentrelineFilter(features) {
  if (features.length === 0) {
    return 'FALSE';
  }
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
    details,
    sources,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek,
    drivact,
    drivcond,
    emphasisAreas,
    hoursOfDayEnd,
    hoursOfDayStart,
    impactype,
    initdir,
    injury,
    manoeuver,
    mvcr,
    rdsfcond,
    validated,
    vehtype,
  } = collisionQuery;
  if (dateRangeStart !== null) {
    params.dateRangeStart = dateRangeStart;
    filters.push('e.accdate >= $(dateRangeStart)');
  }
  if (dateRangeEnd !== null) {
    params.dateRangeEnd = dateRangeEnd;
    filters.push('e.accdate < $(dateRangeEnd)');
  }
  if (daysOfWeek.length > 0) {
    params.daysOfWeek = daysOfWeek;
    filters.push('date_part(\'DOW\', e.accdate) IN ($(daysOfWeek:csv))');
  }
  if (details.length > 0) {
    const filterDetails = details
      .map(({ field }) => `e.${field}`)
      .join(' OR ');
    filters.push(`(${filterDetails})`);
  }
  if (sources.length > 0) {
    params.sources = sources;
    const filterSources = sources.map(({ field }) => `'${field}'`).join(', ');
    filters.push(`e.src IN (${filterSources})`);
  }
  if (drivact.length > 0) {
    params.drivact = drivact;
    filters.push('i.drivact IN ($(drivact:csv))');
  }
  if (drivcond.length > 0) {
    params.drivcond = drivcond;
    filters.push('i.drivcond IN ($(drivcond:csv))');
  }
  if (emphasisAreas.length > 0) {
    const filterEmphasisAreas = emphasisAreas
      .map(({ field }) => `e.${field}`)
      .join(' OR ');
    filters.push(`(${filterEmphasisAreas})`);
  }
  if (hoursOfDayStart !== 0) {
    params.hoursOfDayStart = hoursOfDayStart;
    filters.push('date_part(\'HOUR\', e.accdate) >= $(hoursOfDayStart)');
  }
  if (hoursOfDayEnd !== 24) {
    params.hoursOfDayEnd = hoursOfDayEnd;
    filters.push('date_part(\'HOUR\', e.accdate) < $(hoursOfDayEnd)');
  }
  if (impactype.length > 0) {
    params.impactype = impactype;
    filters.push('e.impactype IN ($(impactype:csv))');
  }
  if (initdir.length > 0) {
    params.initdir = initdir;
    filters.push('i.initdir IN ($(initdir:csv))');
  }
  if (injury.length > 0) {
    params.injury = injury;
    filters.push('e.injury IN ($(injury:csv))');
  }
  if (manoeuver.length > 0) {
    params.manoeuver = manoeuver;
    filters.push('i.manoeuver IN ($(manoeuver:csv))');
  }
  if (mvcr !== null) {
    const op = mvcr ? 'IS NOT DISTINCT FROM' : 'IS DISTINCT FROM';
    filters.push(`e.mvaimg ${op} -1`);
  }
  if (rdsfcond.length > 0) {
    params.rdsfcond = rdsfcond;
    filters.push('e.rdsfcond IN ($(rdsfcond:csv))');
  }
  if (validated !== null) {
    const op = validated ? 'IS NOT DISTINCT FROM' : 'IS DISTINCT FROM';
    filters.push(`e.changed ${op} -1`);
  }
  if (vehtype.length > 0) {
    params.vehtype = vehtype;
    filters.push('i.vehtype IN ($(vehtype:csv))');
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
