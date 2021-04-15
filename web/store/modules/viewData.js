import { getCollisionFactors } from '@/lib/api/WebApi';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    collisionFactors: new Map(),
    detailView: false,
    filtersCollision: {
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
    },
    filtersCommon: {
      dateRangeStart: null,
      dateRangeEnd: null,
      daysOfWeek: [],
    },
    filtersStudy: {
      hours: [],
      studyTypes: [],
    },
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
      daysOfWeek.forEach((value) => {
        const label = TimeFormatters.DAYS_OF_WEEK[value];
        const filterChip = { filter: 'daysOfWeek', label, value };
        filterChipsCommon.push(filterChip);
      });
      return filterChipsCommon;
    },
    filterChipsCollision(state) {
      const {
        details,
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
      details.forEach((value) => {
        const { text: label } = value;
        const filterChip = { filter: 'details', label, value };
        filterChipsCollision.push(filterChip);
      });
      if (mvcr !== null) {
        const label = mvcr ? 'MVCR Available' : 'MVCR Missing';
        const filterChip = { filter: 'mvcr', label, value: mvcr };
        filterChipsCollision.push(filterChip);
      }
      if (validated !== null) {
        const label = mvcr ? 'Validated' : 'Not Validated';
        const filterChip = { filter: 'validated', label, value: validated };
        filterChipsCollision.push(filterChip);
      }
      emphasisAreas.forEach((value) => {
        const { text: label } = value;
        const filterChip = { filter: 'emphasisAreas', label, value };
        filterChipsCollision.push(filterChip);
      });
      if (hoursOfDayStart !== 0 || hoursOfDayEnd !== 24) {
        const dtStart = DateTime.fromObject({ hour: hoursOfDayStart });
        const dtEnd = DateTime.fromObject({ hour: hoursOfDayEnd });
        const label = TimeFormatters.formatRangeTimeOfDay({ start: dtStart, end: dtEnd });
        const value = { hoursOfDayStart, hoursOfDayEnd };
        const filterChip = { filter: 'hoursOfDay', label, value };
        filterChipsCollision.push(filterChip);
      }
      drivact.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('drivact');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'drivact', label, value };
        filterChipsCollision.push(filterChip);
      });
      drivcond.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('drivcond');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'drivcond', label, value };
        filterChipsCollision.push(filterChip);
      });
      impactype.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('impactype');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'impactype', label, value };
        filterChipsCollision.push(filterChip);
      });
      initdir.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('initdir');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'initdir', label, value };
        filterChipsCollision.push(filterChip);
      });
      injury.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('injury');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'injury', label, value };
        filterChipsCollision.push(filterChip);
      });
      manoeuver.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('manoeuver');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'manoeuver', label, value };
        filterChipsCollision.push(filterChip);
      });
      rdsfcond.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('rdsfcond');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'rdsfcond', label, value };
        filterChipsCollision.push(filterChip);
      });
      vehtype.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('vehtype');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'vehtype', label, value };
        filterChipsCollision.push(filterChip);
      });
      return filterChipsCollision;
    },
    filterChipsStudy(state) {
      const {
        hours,
        studyTypes,
      } = state.filtersStudy;
      const filterChipsStudy = [];
      studyTypes.forEach((studyType) => {
        const { label } = studyType;
        const filterChip = { filter: 'studyTypes', label, value: studyType };
        filterChipsStudy.push(filterChip);
      });
      hours.forEach((studyHours) => {
        const label = studyHours.description;
        const filterChip = { filter: 'hours', label, value: studyHours };
        filterChipsStudy.push(filterChip);
      });
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
    filtersIncludeOlderData(state, getters, rootState) {
      const { dateRangeStart } = state.filtersCommon;
      const { now } = rootState;
      if (dateRangeStart === null) {
        return true;
      }
      return dateRangeStart.valueOf() < now.minus({ years: 10 }).valueOf();
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
    removeFilterCollision(state, { filter, value }) {
      if (filter === 'hoursOfDay') {
        state.filtersCollision.hoursOfDayStart = 0;
        state.filtersCollision.hoursOfDayEnd = 24;
      } else if (filter === 'mvcr' || filter === 'mvcr') {
        state.filtersCollision[filter] = null;
      } else {
        const values = state.filtersCollision[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
    },
    removeFilterCommon(state, { filter, value }) {
      if (filter === 'dateRange') {
        state.filtersCommon.dateRangeStart = null;
        state.filtersCommon.dateRangeEnd = null;
      } else {
        const values = state.filtersCommon[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
    },
    removeFilterStudy(state, { filter, value }) {
      const values = state.filtersStudy[filter];
      const i = values.indexOf(value);
      if (i !== -1) {
        values.splice(i, 1);
      }
    },
    setCollisionFactors(state, collisionFactors) {
      state.collisionFactors = collisionFactors;
    },
    setDetailView(state, detailView) {
      state.detailView = detailView;
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
