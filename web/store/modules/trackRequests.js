function timeAgoFilterText(prefix, value) {
  const monthPlural = Math.abs(value) === 1 ? 'month' : 'months';
  if (value < 0) {
    return `${prefix} \u003c ${-value} ${monthPlural} ago`;
  }
  return `${prefix} \u2265 ${value} ${monthPlural} ago`;
}

export default {
  namespaced: true,
  state: {
    filtersRequest: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: 0,
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
      sortDesc: true,
    },
  },
  getters: {
    filterChipsRequest(state) {
      const {
        assignees,
        closed,
        createdAt,
        lastEditedAt,
        statuses,
        studyTypes,
        studyTypeOther,
        userOnly,
      } = state.filtersRequest;
      const filterChipsRequest = [];
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
      if (closed) {
        const filterChip = { filter: 'closed', label: 'Closed', value: true };
        filterChipsRequest.push(filterChip);
      }
      assignees.forEach((assignee) => {
        const label = assignee === null ? 'Unassigned' : assignee.text;
        const filterChip = { filter: 'assignees', label, value: assignee };
        filterChipsRequest.push(filterChip);
      });
      if (createdAt !== 0) {
        const label = timeAgoFilterText('Created', createdAt);
        const filterChip = { filter: 'createdAt', label, value: createdAt };
        filterChipsRequest.push(filterChip);
      }
      if (lastEditedAt !== 0) {
        const label = timeAgoFilterText('Updated', lastEditedAt);
        const filterChip = { filter: 'lastEditedAt', label, value: lastEditedAt };
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
        closed,
        createdAt,
        lastEditedAt,
        statuses,
        studyTypes,
        studyTypeOther,
        userOnly,
      } = state.filtersRequest;
      const { column, query } = state.searchRequest;
      const { sortBy, sortDesc } = state.sortRequest;
      const params = { sortBy, sortDesc };
      if (assignees.length > 0) {
        params.assignees = assignees;
      }
      if (closed) {
        params.closed = true;
      }
      if (createdAt !== 0) {
        params.createdAt = createdAt;
      }
      if (lastEditedAt !== 0) {
        params.lastEditedAt = lastEditedAt;
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
      if (filter === 'closed') {
        state.filtersRequest.closed = false;
      } else if (filter === 'createdAt') {
        state.filtersRequest.createdAt = 0;
      } else if (filter === 'lastEditedAt') {
        state.filtersRequest.lastEditedAt = 0;
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
