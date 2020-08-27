import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    detailView: false,
    filtersCollision: {
      datesFrom: -1,
      daysOfWeek: [],
      emphasisAreas: [],
      hoursOfDay: [0, 24],
      roadSurfaceConditions: [],
    },
    filtersStudy: {
      datesFrom: -1,
      daysOfWeek: [],
      hours: [],
      studyTypes: [],
    },
  },
  getters: {
    filterChipsCollision(state) {
      const {
        datesFrom,
        daysOfWeek,
        emphasisAreas,
        hoursOfDay,
        roadSurfaceConditions,
      } = state.filtersCollision;
      const [start, end] = hoursOfDay;
      const filterChipsCollision = [];
      emphasisAreas.forEach((value) => {
        const { text: label } = value;
        const filterChip = { filter: 'emphasisAreas', label, value };
        filterChipsCollision.push(filterChip);
      });
      if (datesFrom !== -1) {
        const label = `Collisions \u2264 ${datesFrom} years`;
        const value = datesFrom;
        const filterChip = { filter: 'datesFrom', label, value };
        filterChipsCollision.push(filterChip);
      }
      daysOfWeek.forEach((value) => {
        const label = TimeFormatters.DAYS_OF_WEEK[value];
        const filterChip = { filter: 'daysOfWeek', label, value };
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
      roadSurfaceConditions.forEach((value) => {
        const { text: label } = value;
        const filterChip = { filter: 'roadSurfaceConditions', label, value };
        filterChipsCollision.push(filterChip);
      });
      return filterChipsCollision;
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
    filterParamsCollision(state, getters, rootState) {
      const {
        datesFrom,
        daysOfWeek,
        emphasisAreas,
        hoursOfDay: [hoursOfDayStart, hoursOfDayEnd],
        roadSurfaceConditions,
      } = state.filtersCollision;
      const params = {};
      if (datesFrom !== -1) {
        const { now } = rootState;
        params.dateRangeStart = now.minus({ years: datesFrom });
        params.dateRangeEnd = now;
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
      if (roadSurfaceConditions.length > 0) {
        params.roadSurfaceConditions = roadSurfaceConditions;
      }
      return params;
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
        params.dateRangeStart = now.minus({ years: datesFrom });
        params.dateRangeEnd = now;
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
    hasFiltersCollision(state, getters) {
      return getters.filterChipsCollision.length > 0;
    },
    hasFiltersStudy(state, getters) {
      return getters.filterChipsStudy.length > 0;
    },
  },
  mutations: {
    removeFilterCollision(state, { filter, value }) {
      if (filter === 'datesFrom') {
        state.filtersCollision.datesFrom = -1;
      } else if (filter === 'hoursOfDay') {
        state.filtersCollision.hoursOfDay = [0, 24];
      } else {
        const values = state.filtersCollision[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
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
    setDetailView(state, detailView) {
      state.detailView = detailView;
    },
    setFiltersCollision(state, filtersCollision) {
      state.filtersCollision = filtersCollision;
    },
    setFiltersStudy(state, filtersStudy) {
      state.filtersStudy = filtersStudy;
    },
  },
};
