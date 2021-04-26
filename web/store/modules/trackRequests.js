import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  namespaced: true,
  state: {
    filtersRequest: {
      assignees: [],
      createdAtStart: null,
      createdAtEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      statuses: [],
      studyTypes: [],
      studyTypeOther: false,
      userOnly: false,
    },
    filtersRequestUserOnlyInited: false,
    searchRequest: {
      column: null,
      query: null,
    },
    sortRequest: {
      sortBy: 'DUE_DATE',
      sortDesc: false,
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
      studyTypes.forEach((studyType) => {
        const { label } = studyType;
        const filterChip = { filter: 'studyTypes', label, value: studyType };
        filterChipsRequest.push(filterChip);
      });
      if (studyTypeOther) {
        const filterChip = { filter: 'studyTypeOther', label: 'Other', value: true };
        filterChipsRequest.push(filterChip);
      }
      statuses.forEach((status) => {
        const label = status.text;
        const filterChip = { filter: 'statuses', label, value: status };
        filterChipsRequest.push(filterChip);
      });
      assignees.forEach((assignee) => {
        const label = assignee === null ? 'Unassigned' : assignee.text;
        const filterChip = { filter: 'assignees', label, value: assignee };
        filterChipsRequest.push(filterChip);
      });
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
    removeFilterRequest(state, { filter, value }) {
      if (filter === 'createdAt') {
        state.filtersRequest.createdAtStart = null;
        state.filtersRequest.createdAtEnd = null;
      } else if (filter === 'dueDate') {
        state.filtersRequest.dueDateStart = null;
        state.filtersRequest.dueDateEnd = null;
      } else if (filter === 'studyTypeOther') {
        state.filtersRequest.studyTypeOther = false;
      } else if (filter === 'userOnly') {
        state.filtersRequest.userOnly = false;
      } else {
        const values = state.filtersRequest[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
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
