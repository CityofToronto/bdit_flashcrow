import { getCollisionFactors } from '@/lib/api/WebApi';
import { getFieldCodes, isLeafFieldCode } from '@/lib/filters/CollisionFilterGroups';
import {
  defaultCollisionFilters,
  defaultCommonFilters,
  defaultStudyFilters,
} from '@/lib/filters/DefaultFilters';
import { resetCollisionFilterState, resetStudyFilterState, resetCommonFilterState } from '@/web/store/FilterState';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

function getCollisionLeafLabelParts(value, fieldCode, fieldEntries) {
  const parts = [];
  if (value.includes(fieldCode)) {
    const { description } = fieldEntries.get(fieldCode);
    parts.push(description);
  }
  return parts;
}

function getCollisionGroupLabelParts(value, fieldCode, fieldEntries) {
  const parts = [];
  const { text, values } = fieldCode;
  const includesAll = values.every(code => value.includes(code));
  if (includesAll) {
    parts.push(text);
  } else {
    values.forEach((code) => {
      if (value.includes(code)) {
        const { description } = fieldEntries.get(code);
        parts.push(description);
      }
    });
  }
  return parts;
}

function getCollisionFilterChipLabel(filter, value, fieldEntries) {
  const fieldCodes = getFieldCodes(filter, fieldEntries);
  const labelParts = [];
  fieldCodes.forEach((fieldCode) => {
    let parts;
    if (isLeafFieldCode(fieldCode)) {
      parts = getCollisionLeafLabelParts(value, fieldCode, fieldEntries);
    } else {
      parts = getCollisionGroupLabelParts(value, fieldCode, fieldEntries);
    }
    labelParts.push(...parts);
  });
  return labelParts.join(', ');
}

function getCollisionFilterChip(filter, value, collisionFactors) {
  const fieldEntries = collisionFactors.get(filter);
  const label = getCollisionFilterChipLabel(filter, value, fieldEntries);
  return { filter, label, value };
}

export default {
  namespaced: true,
  state: {
    // UI TOGGLES
    detailView: false,
    drawerOpen: false,
    // GLOBAL FILTERS
    collisionFactors: new Map(),
    filtersCollision: defaultCollisionFilters(),
    filtersCommon: defaultCommonFilters(),
    filtersStudy: defaultStudyFilters(),
  },
  getters: {
    filterChipsCommon(state) {
      const {
        dateRangeStart,
        dateRangeEnd,
        daysOfWeek,
      } = state.filtersCommon;
      const filterChipsCommon = [];

      if (dateRangeStart !== null || dateRangeEnd !== null) {
        const label = TimeFormatters.formatRangeDate({
          start: dateRangeStart,
          end: dateRangeEnd,
        });
        const value = { dateRangeStart, dateRangeEnd };
        const filterChip = { filter: 'dateRange', label, value };
        filterChipsCommon.push(filterChip);
      }
      if (daysOfWeek.length > 0) {
        const label = TimeFormatters.formatDaysOfWeek(daysOfWeek);
        const filterChip = { filter: 'daysOfWeek', label, value: daysOfWeek };
        filterChipsCommon.push(filterChip);
      }
      return filterChipsCommon;
    },
    filterChipsCollision(state) {
      const {
        details,
        sources,
        drivact,
        drivcond,
        emphasisAreas,
        hoursOfDayStart,
        hoursOfDayEnd,
        impactype,
        initdir,
        injury,
        manoeuver,
        mvcr,
        rdsfcond,
        validated,
        vehtype,
      } = state.filtersCollision;
      const filterChipsCollision = [];
      if (details.length > 0) {
        const label = details
          .map(({ text }) => text)
          .join(', ');
        const filterChip = { filter: 'details', label, value: details };
        filterChipsCollision.push(filterChip);
      }
      if (sources.length > 0) {
        const label = sources.map(({ text }) => text).join(', ');
        const filterChip = { filter: 'sources', label, value: sources };
        filterChipsCollision.push(filterChip);
      }
      if (mvcr !== null) {
        const label = mvcr ? 'MVCR Available' : 'MVCR Missing';
        const filterChip = { filter: 'mvcr', label, value: mvcr };
        filterChipsCollision.push(filterChip);
      }
      if (validated !== null) {
        const label = validated ? 'Verified' : 'Not Verified';
        const filterChip = { filter: 'validated', label, value: validated };
        filterChipsCollision.push(filterChip);
      }
      if (emphasisAreas.length > 0) {
        const label = emphasisAreas
          .map(({ text }) => text)
          .join(', ');
        const filterChip = { filter: 'emphasisAreas', label, value: emphasisAreas };
        filterChipsCollision.push(filterChip);
      }
      if (hoursOfDayStart !== 0 || hoursOfDayEnd !== 24) {
        const dtStart = DateTime.fromObject({ hour: hoursOfDayStart });
        const dtEnd = DateTime.fromObject({ hour: hoursOfDayEnd });
        const label = TimeFormatters.formatRangeTimeOfDay({ start: dtStart, end: dtEnd });
        const value = { hoursOfDayStart, hoursOfDayEnd };
        const filterChip = { filter: 'hoursOfDay', label, value };
        filterChipsCollision.push(filterChip);
      }
      if (drivact.length > 0) {
        const filterChip = getCollisionFilterChip('drivact', drivact, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (drivcond.length > 0) {
        const filterChip = getCollisionFilterChip('drivcond', drivcond, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (impactype.length > 0) {
        const filterChip = getCollisionFilterChip('impactype', impactype, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (initdir.length > 0) {
        const filterChip = getCollisionFilterChip('initdir', initdir, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (injury.length > 0) {
        const filterChip = getCollisionFilterChip('injury', injury, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (manoeuver.length > 0) {
        const filterChip = getCollisionFilterChip('manoeuver', manoeuver, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (rdsfcond.length > 0) {
        const filterChip = getCollisionFilterChip('rdsfcond', rdsfcond, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      if (vehtype.length > 0) {
        const filterChip = getCollisionFilterChip('vehtype', vehtype, state.collisionFactors);
        filterChipsCollision.push(filterChip);
      }
      return filterChipsCollision;
    },
    filterChipsStudy(state) {
      const {
        hours,
        studyTypes,
      } = state.filtersStudy;
      const filterChipsStudy = [];
      if (studyTypes.length > 0) {
        const label = studyTypes
          .map(({ beta, label: studyTypeLabel }) => {
            if (beta === null) {
              return studyTypeLabel;
            }
            return `${studyTypeLabel} (Beta)`;
          })
          .join(', ');
        const filterChip = { filter: 'studyTypes', label, value: studyTypes };
        filterChipsStudy.push(filterChip);
      }
      if (hours.length > 0) {
        const label = hours
          .map(({ description }) => description)
          .join(', ');
        const filterChip = { filter: 'hours', label, value: hours };
        filterChipsStudy.push(filterChip);
      }
      return filterChipsStudy;
    },
    filterParamsCollision(state) {
      const {
        dateRangeStart,
        dateRangeEnd,
        daysOfWeek,
      } = state.filtersCommon;
      const {
        details,
        sources,
        drivact,
        drivcond,
        emphasisAreas,
        hoursOfDayStart,
        hoursOfDayEnd,
        impactype,
        initdir,
        injury,
        manoeuver,
        mvcr,
        rdsfcond,
        validated,
        vehtype,
      } = state.filtersCollision;
      const params = {};
      if (params.dateRangeStart !== null) {
        params.dateRangeStart = dateRangeStart;
      }
      if (params.dateRangeEnd !== null) {
        params.dateRangeEnd = dateRangeEnd;
      }
      if (daysOfWeek.length > 0) {
        params.daysOfWeek = daysOfWeek;
      }
      if (sources.length > 0) {
        params.sources = sources;
      }
      if (details.length > 0) {
        params.details = details;
      }
      if (drivact.length > 0) {
        params.drivact = drivact;
      }
      if (drivcond.length > 0) {
        params.drivcond = drivcond;
      }
      if (emphasisAreas.length > 0) {
        params.emphasisAreas = emphasisAreas;
      }
      if (hoursOfDayStart !== 0 || hoursOfDayEnd !== 24) {
        params.hoursOfDayStart = hoursOfDayStart;
        params.hoursOfDayEnd = hoursOfDayEnd;
      }
      if (impactype.length > 0) {
        params.impactype = impactype;
      }
      if (initdir.length > 0) {
        params.initdir = initdir;
      }
      if (injury.length > 0) {
        params.injury = injury;
      }
      if (manoeuver.length > 0) {
        params.manoeuver = manoeuver;
      }
      if (mvcr !== null) {
        params.mvcr = mvcr;
      }
      if (rdsfcond.length > 0) {
        params.rdsfcond = rdsfcond;
      }
      if (validated !== null) {
        params.validated = validated;
      }
      if (vehtype.length > 0) {
        params.vehtype = vehtype;
      }
      return params;
    },
    filterParamsStudy(state) {
      const {
        dateRangeStart,
        dateRangeEnd,
        daysOfWeek,
      } = state.filtersCommon;
      const {
        hours,
        studyTypes,
      } = state.filtersStudy;
      const params = {};
      if (params.dateRangeStart !== null) {
        params.dateRangeStart = dateRangeStart;
      }
      if (params.dateRangeEnd !== null) {
        params.dateRangeEnd = dateRangeEnd;
      }
      if (daysOfWeek.length > 0) {
        params.daysOfWeek = daysOfWeek;
      }
      if (hours.length > 0) {
        params.hours = hours;
      }
      if (studyTypes.length > 0) {
        params.studyTypes = studyTypes;
      }
      return params;
    },
    hasFilters(state, getters) {
      return getters.hasFiltersCollision || getters.hasFiltersCommon || getters.hasFiltersStudy;
    },
    hasFiltersCollision(state, getters) {
      return getters.filterChipsCollision.length > 0;
    },
    hasFiltersCommon(state, getters) {
      return getters.filterChipsCommon.length > 0;
    },
    hasFiltersStudy(state, getters) {
      return getters.filterChipsStudy.length > 0;
    },
  },
  mutations: {
    removeFilterCollision(state, { filter }) {
      resetCollisionFilterState(filter);
      if (filter === 'hoursOfDay') {
        state.filtersCollision.hoursOfDayStart = 0;
        state.filtersCollision.hoursOfDayEnd = 24;
      } else if (filter === 'mvcr' || filter === 'validated') {
        state.filtersCollision[filter] = null;
      } else {
        state.filtersCollision[filter] = [];
      }
    },
    removeFilterCommon(state, { filter }) {
      resetCommonFilterState(filter);
      if (filter === 'dateRange') {
        state.filtersCommon.dateRangeStart = null;
        state.filtersCommon.dateRangeEnd = null;
      } else {
        state.filtersCommon[filter] = [];
      }
    },
    removeFilterStudy(state, { filter }) {
      resetStudyFilterState(filter);
      state.filtersStudy[filter] = [];
    },
    setCollisionFactors(state, collisionFactors) {
      state.collisionFactors = collisionFactors;
    },
    setDetailView(state, detailView) {
      state.detailView = detailView;
    },
    setDrawerOpen(state, drawerOpen) {
      state.drawerOpen = drawerOpen;
    },
    setFiltersCollision(state, filtersCollision) {
      state.filtersCollision = filtersCollision;
    },
    setFiltersCommon(state, filtersCommon) {
      state.filtersCommon = filtersCommon;
    },
    setFiltersStudy(state, filtersStudy) {
      state.filtersStudy = filtersStudy;
    },
  },
  actions: {
    async initCollisionFactors({ commit }) {
      const collisionFactors = await getCollisionFactors();
      commit('setCollisionFactors', collisionFactors);
    },
  },
};

export {
  getCollisionFilterChip,
};
