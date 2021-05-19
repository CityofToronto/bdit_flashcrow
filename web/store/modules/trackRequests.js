import { StudyType } from '@/lib/Constants';
import { defaultStudyRequestFilters } from '@/lib/filters/DefaultFilters';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    filtersRequest: defaultStudyRequestFilters(),
    filtersRequestUserOnlyInited: false,
    searchRequest: {
      column: null,
      query: null,
    },
    sortRequest: {
      sortBy: 'ID',
      sortDesc: true,
    },
  },
  getters: {
    filterChipsRequest(state) {
      const {
        assignees,
        createdAtStart,
        createdAtEnd,
        dueDateStart,
        dueDateEnd,
        statuses,
        studyTypes,
        studyTypeOther,
        userOnly,
      } = state.filtersRequest;
      const filterChipsRequest = [];
      if (createdAtStart !== null || createdAtEnd !== null) {
        const labelDateRange = TimeFormatters.formatRangeDate({
          start: createdAtStart,
          end: createdAtEnd,
        });
        const label = `Requested: ${labelDateRange}`;
        const value = { createdAtStart, createdAtEnd };
        const filterChip = { filter: 'createdAt', label, value };
        filterChipsRequest.push(filterChip);
      }
      if (dueDateStart !== null || dueDateEnd !== null) {
        const labelDateRange = TimeFormatters.formatRangeDate({
          start: dueDateStart,
          end: dueDateEnd,
        });
        const label = `Expected: ${labelDateRange}`;
        const value = { dueDateStart, dueDateEnd };
        const filterChip = { filter: 'dueDate', label, value };
        filterChipsRequest.push(filterChip);
      }
      if (studyTypes.length > 0 || studyTypeOther) {
        const labelsStudyTypes = studyTypes
          .map(({ label }) => label);
        const value = [...studyTypes];
        if (studyTypeOther) {
          labelsStudyTypes.push('Other');
          value.push(
            ...StudyType.enumValues.filter(({ other }) => other),
          );
        }
        const label = labelsStudyTypes.join(', ');
        const filterChip = { filter: 'studyTypes', label, value };
        filterChipsRequest.push(filterChip);
      }
      if (statuses.length > 0) {
        const label = statuses
          .map(({ text }) => text)
          .join(', ');
        const filterChip = { filter: 'statuses', label, value: statuses };
        filterChipsRequest.push(filterChip);
      }
      if (assignees.length > 0) {
        const label = assignees
          .map(assignee => (assignee === null ? 'Unassigned' : assignee.text))
          .join(', ');
        const filterChip = { filter: 'assignees', label, value: assignees };
        filterChipsRequest.push(filterChip);
      }
      if (userOnly) {
        const filterChip = { filter: 'userOnly', label: 'Requested by me', value: true };
        filterChipsRequest.push(filterChip);
      }
      return filterChipsRequest;
    },
    filterParamsRequest(state) {
      const {
        assignees,
        createdAtStart,
        createdAtEnd,
        dueDateStart,
        dueDateEnd,
        statuses,
        studyTypes,
        studyTypeOther,
        userOnly,
      } = state.filtersRequest;
      const { column, query } = state.searchRequest;
      const { sortBy, sortDesc } = state.sortRequest;
      const params = { sortBy, sortDesc };
      if (assignees.length > 0) {
        params.assignees = assignees.map(
          assignee => (assignee === null ? '' : assignee),
        );
      }
      if (createdAtStart !== null) {
        params.createdAtStart = createdAtStart;
      }
      if (createdAtEnd !== null) {
        params.createdAtEnd = createdAtEnd;
      }
      if (dueDateStart !== null) {
        params.dueDateStart = dueDateStart;
      }
      if (dueDateEnd !== null) {
        params.dueDateEnd = dueDateEnd;
      }
      if (statuses.length > 0) {
        params.statuses = statuses;
      }
      if (studyTypes.length > 0) {
        params.studyTypes = studyTypes;
      }
      if (studyTypeOther) {
        params.studyTypeOther = true;
      }
      if (userOnly) {
        params.userOnly = true;
      }
      if (query !== null && query !== '') {
        params.column = column;
        params.query = query;
      }
      return params;
    },
    hasFiltersRequest(state, getters) {
      return getters.filterChipsRequest.length > 0 || state.searchRequest.query !== null;
    },
  },
  mutations: {
    removeFilterRequest(state, { filter }) {
      if (filter === 'createdAt') {
        state.filtersRequest.createdAtStart = null;
        state.filtersRequest.createdAtEnd = null;
      } else if (filter === 'dueDate') {
        state.filtersRequest.dueDateStart = null;
        state.filtersRequest.dueDateEnd = null;
      } else if (filter === 'studyTypes') {
        state.filtersRequest.studyTypes = [];
        state.filtersRequest.studyTypeOther = false;
      } else if (filter === 'userOnly') {
        state.filtersRequest.userOnly = false;
      } else {
        state.filtersRequest[filter] = [];
      }
    },
    setFiltersRequest(state, filtersRequest) {
      state.filtersRequest = filtersRequest;
    },
    setFiltersRequestUserOnly(state, userOnly) {
      if (!state.filtersRequestUserOnlyInited) {
        state.filtersRequest.userOnly = userOnly;
        state.filtersRequestUserOnlyInited = true;
      }
    },
    setSearchRequestColumn(state, column) {
      state.searchRequest.column = column;
    },
    setSearchRequestQuery(state, query) {
      state.searchRequest.query = query;
    },
    setSortRequestSortBy(state, sortBy) {
      state.sortRequest.sortBy = sortBy;
    },
    setSortRequestSortDesc(state, sortDesc) {
      state.sortRequest.sortDesc = sortDesc;
    },
  },
};
