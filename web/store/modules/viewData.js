import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    filters: {
      datesFrom: -1,
      daysOfWeek: [],
      hours: [],
      studyTypes: [],
    },
    filtersCollision: {
      // TODO: filters here
    },
  },
  getters: {
    filterChips(state) {
      const {
        datesFrom,
        daysOfWeek,
        hours,
        studyTypes,
      } = state.filters;
      const filterChips = [];
      studyTypes.forEach((studyType) => {
        const { label } = studyType;
        const filterChip = { filter: 'studyTypes', label, value: studyType };
        filterChips.push(filterChip);
      });
      daysOfWeek.forEach((value) => {
        const label = TimeFormatters.DAYS_OF_WEEK[value];
        const filterChip = { filter: 'daysOfWeek', label, value };
        filterChips.push(filterChip);
      });
      if (datesFrom !== -1) {
        const label = `Studies \u2264 ${datesFrom} years`;
        const value = datesFrom;
        const filterChip = { filter: 'datesFrom', label, value };
        filterChips.push(filterChip);
      }
      hours.forEach((studyHours) => {
        const label = studyHours.description;
        const filterChip = { filter: 'hours', label, value: studyHours };
        filterChips.push(filterChip);
      });
      return filterChips;
    },
    filterChipsCollision(/* state */) {
      return [];
    },
    filterParams(state, getters, rootState) {
      const {
        datesFrom,
        daysOfWeek,
        hours,
        studyTypes,
      } = state.filters;
      const params = {};
      if (datesFrom !== -1) {
        const { now } = rootState;
        params.start = now.minus({ years: datesFrom });
        params.end = now;
      }
      if (daysOfWeek.length > 0) {
        params.dayOfWeek = daysOfWeek;
      }
      if (hours.length > 0) {
        params.hours = hours;
      }
      if (studyTypes.length > 0) {
        params.studyType = studyTypes;
      }
      return params;
    },
  },
  mutations: {
    removeFilter(state, { filter, value }) {
      if (filter === 'datesFrom') {
        state.filters.datesFrom = -1;
      } else {
        const values = state.filters[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
    },
    removeFilterCollision(/* state, { filter, value } */) {
      // TODO: implement this
    },
    setFilters(state, filters) {
      state.filters = filters;
    },
    setFiltersCollision(state, filtersCollision) {
      state.filtersCollision = filtersCollision;
    },
  },
};
