import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import { getCollisionFilterChip } from '@/web/store/modules/viewData';
import { parseCollisionReportId } from '@/lib/reports/ReportIdParser';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';

function generateDateRange(filters) {
  const { dateRangeStart, dateRangeEnd } = filters;
  if (dateRangeStart !== null && dateRangeEnd !== null) {
    const label = `${dateRangeStart.toString().slice(0, 10)} to ${dateRangeEnd.toString().slice(0, 10)}`;
    return label;
  }
  return '1985 to Present';
}

async function generateCollisionFilters(filters) {
  const collisionFactors = await CollisionFactorDAO.all();
  const {
    daysOfWeek,
    details,
    sources,
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
  } = filters;
  const collisionFilters = [];
  collisionFilters.push({ filter: 'dateRange', label: generateDateRange(filters) });
  if (details.length > 0) {
    const mapDetails = {
      CITY_DAMAGE: 'Damage to City Property',
      RED_LIGHT: 'Running Red Light',
    };
    const label = details
      .map(item => item.text || mapDetails[item])
      .join(', ');
    const collisionFilter = { filter: 'details', label, value: details };
    collisionFilters.push(collisionFilter);
  }
  if (sources.length > 0) {
    const label = sources.map(({ text }) => text).join(', ');
    const collisionFilter = { filter: 'sources', label, value: sources };
    collisionFilters.push(collisionFilter);
  }
  if (mvcr !== null) {
    const label = mvcr ? 'MVCR Available' : 'MVCR Missing';
    const collisionFilter = { filter: 'mvcr', label, value: mvcr };
    collisionFilters.push(collisionFilter);
  }
  if (emphasisAreas.length > 0) {
    const mapAreas = {
      AGGRESSIVE_DRIVING: 'Aggressive Driving',
      CYCLISTS: 'Cyclists',
      PEDESTRIANS: 'Pedestrians',
      MOTORCYCLISTS: 'Motorcyclists',
      OLDER_ADULTS: 'Older Adults',
      SCHOOL_CHILDREN: 'School Children',
    };
    const label = emphasisAreas
      .map(item => item.text || mapAreas[item])
      .join(', ');
    const collisionFilter = { filter: 'emphasisAreas', label, value: emphasisAreas };
    collisionFilters.push(collisionFilter);
  }
  if (hoursOfDayStart !== 0 || hoursOfDayEnd !== 24) {
    const dtStart = DateTime.fromObject({ hour: hoursOfDayStart });
    const dtEnd = DateTime.fromObject({ hour: hoursOfDayEnd });
    const label = TimeFormatters.formatRangeTimeOfDay({ start: dtStart, end: dtEnd });
    const value = { hoursOfDayStart, hoursOfDayEnd };
    const collisionFilter = { filter: 'hoursOfDay', label, value };
    collisionFilters.push(collisionFilter);
  }
  if (daysOfWeek.length > 0) {
    const label = TimeFormatters.formatDaysOfWeek(daysOfWeek);
    const collisionFilter = { filter: 'daysOfWeek', label, value: daysOfWeek };
    collisionFilters.push(collisionFilter);
  }
  if (validated !== null) {
    const label = validated ? 'Verified' : 'Not Verified';
    const collisionFilter = { filter: 'validated', label, value: validated };
    collisionFilters.push(collisionFilter);
  }
  if (drivact.length > 0) {
    const collisionFilter = getCollisionFilterChip('drivact', drivact, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (drivcond.length > 0) {
    const collisionFilter = getCollisionFilterChip('drivcond', drivcond, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (impactype.length > 0) {
    const collisionFilter = getCollisionFilterChip('impactype', impactype, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (initdir.length > 0) {
    const collisionFilter = getCollisionFilterChip('initdir', initdir, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (injury.length > 0) {
    const collisionFilter = getCollisionFilterChip('injury', injury, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (manoeuver.length > 0) {
    const collisionFilter = getCollisionFilterChip('manoeuver', manoeuver, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (rdsfcond.length > 0) {
    const collisionFilter = getCollisionFilterChip('rdsfcond', rdsfcond, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  if (vehtype.length > 0) {
    const collisionFilter = getCollisionFilterChip('vehtype', vehtype, collisionFactors);
    collisionFilters.push(collisionFilter);
  }
  return collisionFilters;
}

function formatFilters(filters) {
  const filtersMap = {
    validated: 'Verification',
    daysOfWeek: 'Days of the Week',
    details: 'Collision Details',
    sources: 'Data Source',
    emphasisAreas: 'Vision Zero Emphasis Areas',
    mvcr: 'MVCR',
    injury: 'Injuries',
    drivact: 'Driver Action',
    drivcond: 'Driver Conditions',
    hoursOfDay: 'Hours of the Day',
    initdir: 'Initial Direction of Travel',
    impactype: 'Initial Impact Type',
    rdsfcond: 'Weather',
    vehtype: 'Vehicle Type',
    manoeuver: 'Manoeuvre',
    dateRange: 'Date Range',
  };

  const formattedFilters = filters.map(item => (
    `${filtersMap[item.filter]}: ${item.label}`));
  return formattedFilters;
}

async function generateFilterFile(filters, id) {
  const { locationsSelection } = await parseCollisionReportId(id);
  const locationDescription = getLocationsSelectionDescription(locationsSelection);
  return ['Collision Directory Report', locationDescription, '', 'The attached CSV file contains collision events that match the following criteria:', '', ...filters];
}

export {
  generateCollisionFilters,
  formatFilters,
  generateDateRange,
  generateFilterFile,
};
