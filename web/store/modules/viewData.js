import { getCollisionFactors } from '@/lib/api/WebApi';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    collisionFactors: new Map(),
    detailView: false,
    filtersCollision: {
      emphasisAreas: [],
      hoursOfDay: [0, 24],
      rdsfcond: [],
    },
    filtersCommon: {
      applyDateRange: false,
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
        applyDateRange,
        dateRangeStart,
        dateRangeEnd,
        daysOfWeek,
      } = state.filtersCommon;
      const filterChipsCommon = [];
      if (applyDateRange) {
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
        emphasisAreas,
        hoursOfDay,
        rdsfcond,
      } = state.filtersCollision;
      const [start, end] = hoursOfDay;
      const filterChipsCollision = [];
      emphasisAreas.forEach((value) => {
        const { text: label } = value;
        const filterChip = { filter: 'emphasisAreas', label, value };
        filterChipsCollision.push(filterChip);
      });
      if (start !== 0 || end !== 24) {
        const dtStart = DateTime.fromObject({ hour: start });
        const dtEnd = DateTime.fromObject({ hour: end });
        const label = TimeFormatters.formatRangeTimeOfDay({ start: dtStart, end: dtEnd });
        const value = hoursOfDay;
        const filterChip = { filter: 'hoursOfDay', label, value };
        filterChipsCollision.push(filterChip);
      }
      rdsfcond.forEach((value) => {
        const fieldEntries = state.collisionFactors.get('rdsfcond');
        const { description: label } = fieldEntries.get(value);
        const filterChip = { filter: 'rdsfcond', label, value };
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
        applyDateRange,
        dateRangeStart,
        dateRangeEnd,
        daysOfWeek,
      } = state.filtersCommon;
      const {
        emphasisAreas,
        hoursOfDay: [hoursOfDayStart, hoursOfDayEnd],
        rdsfcond,
      } = state.filtersCollision;
      const params = {};
      if (applyDateRange) {
        params.dateRangeStart = dateRangeStart;
        params.dateRangeEnd = dateRangeEnd;
      }
      if (daysOfWeek.length > 0) {
        params.daysOfWeek = daysOfWeek;
      }
      if (emphasisAreas.length > 0) {
        params.emphasisAreas = emphasisAreas;
      }
      if (hoursOfDayStart !== 0 || hoursOfDayEnd !== 24) {
        params.hoursOfDayStart = hoursOfDayStart;
        params.hoursOfDayEnd = hoursOfDayEnd;
      }
      if (rdsfcond.length > 0) {
        params.rdsfcond = rdsfcond;
      }
      return params;
    },
    filterParamsStudy(state) {
      const {
        applyDateRange,
        dateRangeStart,
        dateRangeEnd,
        daysOfWeek,
      } = state.filtersCommon;
      const {
        hours,
        studyTypes,
      } = state.filtersStudy;
      const params = {};
      if (applyDateRange) {
        params.dateRangeStart = dateRangeStart;
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
    removeFilterCollision(state, { filter, value }) {
      if (filter === 'hoursOfDay') {
        state.filtersCollision.hoursOfDay = [0, 24];
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
        state.filtersCommon.applyDateRange = false;
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
