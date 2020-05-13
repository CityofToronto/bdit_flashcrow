import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    filtersCollision: {
      // TODO: filters here
    },
    filtersStudy: {
      datesFrom: -1,
      daysOfWeek: [],
      hours: [],
      studyTypes: [],
    },
  },
  getters: {
    filterChipsCollision(/* state */) {
      return [];
    },
    filterChipsStudy(state) {
      const {
        datesFrom,
        daysOfWeek,
        hours,
        studyTypes,
      } = state.filtersStudy;
      const filterChipsStudy = [];
      studyTypes.forEach((studyType) => {
        const { label } = studyType;
        const filterChip = { filter: 'studyTypes', label, value: studyType };
        filterChipsStudy.push(filterChip);
      });
      daysOfWeek.forEach((value) => {
        const label = TimeFormatters.DAYS_OF_WEEK[value];
        const filterChip = { filter: 'daysOfWeek', label, value };
        filterChipsStudy.push(filterChip);
      });
      if (datesFrom !== -1) {
        const label = `Studies \u2264 ${datesFrom} years`;
        const value = datesFrom;
        const filterChip = { filter: 'datesFrom', label, value };
        filterChipsStudy.push(filterChip);
      }
      hours.forEach((studyHours) => {
        const label = studyHours.description;
        const filterChip = { filter: 'hours', label, value: studyHours };
        filterChipsStudy.push(filterChip);
      });
      return filterChipsStudy;
    },
    filterParamsStudy(state, getters, rootState) {
      const {
        datesFrom,
        daysOfWeek,
        hours,
        studyTypes,
      } = state.filtersStudy;
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
    removeFilterCollision(/* state, { filter, value } */) {
      // TODO: implement this
    },
    removeFilterStudy(state, { filter, value }) {
      if (filter === 'datesFrom') {
        state.filtersStudy.datesFrom = -1;
      } else {
        const values = state.filtersStudy[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
    },
    setFiltersCollision(state, filtersCollision) {
      state.filtersCollision = filtersCollision;
    },
    setFiltersStudy(state, filtersStudy) {
      state.filtersStudy = filtersStudy;
    },
  },
};
