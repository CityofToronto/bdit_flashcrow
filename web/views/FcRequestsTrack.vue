<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-divider></v-divider>
      <div class="px-5">
        <h1 class="display-3 mt-8">Track Requests</h1>

        <div class="align-center d-flex mt-6">
          <v-chip-group
            v-model="activeShortcutChip"
            active-class="fc-shortcut-chip-active"
            class="fc-shortcut-chips"
            color="primary"
            :mandatory="activeShortcutChip !== null">
            <v-chip
              v-for="({ text }, i) in SHORTCUT_CHIPS"
              :key="i"
              outlined>{{text}}</v-chip>
          </v-chip-group>

          <v-spacer></v-spacer>

          <FcSearchBarRequests
            v-model="search"
            :columns="columns" />
        </div>
      </div>
    </header>

    <section class="flex-grow-1 flex-shrink-1 mt-6 mb-8 overflow-y-auto px-5">
      <v-card class="fc-requests-track-card">
        <v-card-title class="align-center d-flex py-2">
          <v-simple-checkbox
            v-model="selectAll"
            class="mr-6"
            :indeterminate="selectAll === null"></v-simple-checkbox>

          <FcButton
            v-if="selectedItems.length === 0"
            class="mr-2"
            :loading="loading"
            type="secondary"
            @click="actionRefresh()">
            <v-icon
              color="primary"
              left>mdi-refresh</v-icon>
            Refresh
          </FcButton>
          <FcButton
            v-else
            class="mr-2"
            type="secondary"
            @click="actionDownload(selectedItems)">
            <v-icon color="primary" left>mdi-cloud-download</v-icon>
            Download
          </FcButton>

           <FcDialogRequestFilters
              v-if="showFilters"
              v-model="showFilters"
              v-bind="filters"
              @set-filters="setFilters">
            </FcDialogRequestFilters>
          <FcButton
            v-if="items.length > 0 || filterChips.length > 0"
            type="secondary"
            @click.stop="showFilters = true">
            <v-icon
              :color="colorIconFilter"
              left>mdi-filter-variant</v-icon>
            Filter
          </FcButton>
          <div
            v-if="filterChips.length > 0"
            class="ml-5">
            <v-chip
              v-for="(filterChip, i) in filterChips"
              :key="i"
              class="mr-2 primary--text"
              color="light-blue lighten-5"
              @click="removeFilter(filterChip)">
              <v-icon left>mdi-check</v-icon>
              {{filterChip.text}}
            </v-chip>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="fc-data-table-requests-wrapper overflow-y-hidden pa-0">
          <FcDataTableRequests
            v-model="selectedItems"
            :columns="columns"
            :has-filters="hasFilters"
            :items="items"
            :loading="loading"
            :loading-items="loadingSaveStudyRequest"
            :sort-by.sync="sortBy"
            @assign-to="actionAssignTo"
            @show-item="actionShowItem" />
        </v-card-text>
      </v-card>
    </section>
  </section>
</template>

<script>
import { csvFormat } from 'd3-dsv';
import { saveAs } from 'file-saver';
import { Ripple } from 'vuetify/lib/directives';
import { mapActions, mapState } from 'vuex';

import {
  AuthScope,
  centrelineKey,
  SearchKeys,
  StudyRequestStatus,
} from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import { getStudyRequests } from '@/lib/api/WebApi';
import { bulkAssignedToStr, bulkStatus, ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSearchBarRequests from '@/web/components/inputs/FcSearchBarRequests.vue';
import FcDialogRequestFilters from '@/web/components/dialogs/FcDialogRequestFilters.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function getItemRow(item) {
  let { location, requestedBy } = item;
  if (location !== null) {
    location = location.description;
  }
  if (requestedBy !== null) {
    requestedBy = requestedBy.uniqueName;
  }

  const { studyRequest } = item;
  const {
    assignedTo,
    geom: {
      coordinates: [lng, lat],
    },
    hours,
    id,
    notes,
    status,
    studyType,
    urgent,
    urgentReason,
  } = studyRequest;

  let {
    createdAt,
    daysOfWeek,
    dueDate,
    duration,
    estimatedDeliveryDate,
    lastEditedAt,
  } = studyRequest;
  createdAt = TimeFormatters.formatDefault(createdAt);
  daysOfWeek = TimeFormatters.formatDaysOfWeek(daysOfWeek);
  dueDate = TimeFormatters.formatDefault(studyRequest.dueDate);
  if (studyType.automatic) {
    duration = formatDuration(duration);
  } else {
    duration = null;
  }
  estimatedDeliveryDate = TimeFormatters.formatDefault(studyRequest.estimatedDeliveryDate);
  if (lastEditedAt !== null) {
    lastEditedAt = TimeFormatters.formatDefault(lastEditedAt);
  }

  return {
    assignedTo,
    createdAt,
    daysOfWeek,
    dueDate,
    duration,
    estimatedDeliveryDate,
    hours,
    id,
    lastEditedAt,
    lat,
    lng,
    location,
    notes,
    requestedBy,
    status,
    studyType,
    urgent,
    urgentReason,
  };
}

const SHORTCUT_CHIPS = [
  {
    filters: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: 0,
      statuses: [],
      studyTypes: [],
    },
    text: 'All',
  }, {
    filters: {
      assignees: [],
      closed: false,
      createdAt: -1,
      lastEditedAt: 0,
      statuses: [],
      studyTypes: [],
    },
    text: 'New',
  }, {
    filters: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: -1,
      statuses: [],
      studyTypes: [],
    },
    text: 'Recently Updated',
  }, {
    filters: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: 0,
      statuses: [StudyRequestStatus.CANCELLED],
      studyTypes: [],
    },
    text: 'Cancelled',
  }, {
    filters: {
      assignees: [],
      closed: true,
      createdAt: 0,
      lastEditedAt: 0,
      statuses: [],
      studyTypes: [],
    },
    text: 'Closed',
  },
];

function filterArrayMatches(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every(x1 => arr2.includes(x1))
    && arr2.every(x2 => arr1.includes(x2));
}

function filtersMatchShortcutChip(filters, { filters: chipFilters }) {
  return filterArrayMatches(filters.assignees, chipFilters.assignees)
    && filters.closed === chipFilters.closed
    && filters.createdAt === chipFilters.createdAt
    && filters.lastEditedAt === chipFilters.lastEditedAt
    && filterArrayMatches(filters.statuses, chipFilters.statuses)
    && filterArrayMatches(filters.studyTypes, chipFilters.studyTypes);
}

function timeAgoFilterText(prefix, value) {
  const monthPlural = Math.abs(value) === 1 ? 'month' : 'months';
  if (value < 0) {
    return `${prefix} \u003c ${-value} ${monthPlural} ago`;
  }
  return `${prefix} \u2265 ${value} ${monthPlural} ago`;
}

function statusFilterText(items, status) {
  const { text } = status;
  let n = 0;
  items.forEach(({ studyRequest }) => {
    if (studyRequest.status === status) {
      n += 1;
    }
  });
  return `${text} (${n})`;
}

function normalizeItemStudyRequest(
  studyRequestLocations,
  studyRequestUsers,
  studyRequest,
) {
  const {
    assignedTo,
    centrelineId,
    centrelineType,
    createdAt,
    dueDate,
    id,
    lastEditedAt,
    status,
    urgent,
    userId,
  } = studyRequest;

  const feature = { centrelineId, centrelineType };
  const key = centrelineKey(feature);
  let location = null;
  if (studyRequestLocations.has(key)) {
    location = studyRequestLocations.get(key);
  }

  let requestedBy = null;
  if (studyRequestUsers.has(userId)) {
    const { uniqueName } = studyRequestUsers.get(userId);
    const i = uniqueName.indexOf('\\');
    requestedBy = i === -1 ? uniqueName : uniqueName.slice(i + 1);
  }

  const assignedToStr = assignedTo === null ? 'None' : assignedTo.text;

  return {
    type: ItemType.STUDY_REQUEST,
    ariaLabel: `View Request #${id}`,
    assignedTo: assignedToStr,
    createdAt,
    dueDate,
    id,
    lastEditedAt,
    location,
    requestedBy,
    status,
    studyRequest,
    urgent,
  };
}

function normalizeItemStudyRequestBulk(
  studyRequestLocations,
  studyRequestUsers,
  studyRequestBulk,
) {
  const {
    id,
    createdAt,
    dueDate,
    lastEditedAt,
    studyRequests,
    urgent,
    userId,
  } = studyRequestBulk;

  const studyRequestsNormalized = studyRequests.map(
    studyRequest => normalizeItemStudyRequest(
      studyRequestLocations,
      studyRequestUsers,
      studyRequest,
    ),
  );

  let requestedBy = null;
  if (studyRequestUsers.has(userId)) {
    const { uniqueName } = studyRequestUsers.get(userId);
    const i = uniqueName.indexOf('\\');
    requestedBy = i === -1 ? uniqueName : uniqueName.slice(i + 1);
  }

  return {
    type: ItemType.STUDY_REQUEST_BULK,
    ariaLabel: `View Bulk Request: ${studyRequestBulk.name}`,
    assignedTo: bulkAssignedToStr(studyRequests),
    createdAt,
    dueDate,
    id: `STUDY_REQUEST_BULK:${id}`,
    lastEditedAt,
    requestedBy,
    status: bulkStatus(studyRequests),
    studyRequestBulk: {
      ...studyRequestBulk,
      studyRequests: studyRequestsNormalized,
    },
    urgent,
  };
}

function filtersMatchItem(filters, user, { studyRequest }) {
  const {
    assignees,
    closed,
    createdAt,
    lastEditedAt,
    statuses,
    studyTypes,
    userOnly,
  } = filters;
  const now = DateTime.local();

  if (assignees.length > 0 && !assignees.includes(studyRequest.assignedTo)) {
    return false;
  }
  if (closed && !studyRequest.closed) {
    return false;
  }
  if (createdAt < 0) {
    const after = now.minus({ months: -createdAt });
    if (studyRequest.createdAt.valueOf() <= after.valueOf()) {
      return false;
    }
  }
  if (createdAt > 0) {
    const before = now.minus({ months: createdAt });
    if (studyRequest.createdAt.valueOf() > before.valueOf()) {
      return false;
    }
  }
  if (lastEditedAt !== 0 && studyRequest.lastEditedAt === null) {
    return false;
  }
  if (lastEditedAt < 0) {
    const after = now.minus({ months: -lastEditedAt });
    if (studyRequest.lastEditedAt.valueOf() <= after.valueOf()) {
      return false;
    }
  }
  if (lastEditedAt > 0) {
    const before = now.minus({ months: lastEditedAt });
    if (studyRequest.lastEditedAt.valueOf() > before.valueOf()) {
      return false;
    }
  }
  if (statuses.length > 0 && !statuses.includes(studyRequest.status)) {
    return false;
  }
  if (studyTypes.length > 0 && !studyTypes.includes(studyRequest.studyType)) {
    return false;
  }
  if (userOnly && studyRequest.userId !== user.id) {
    return false;
  }
  return true;
}

function searchKeyForColumn(column) {
  if (column !== null) {
    return SearchKeys.Requests[column];
  }
  return (q, r) => Object.values(SearchKeys.Requests).some(
    searchKey => searchKey(q, r),
  );
}

export default {
  name: 'FcRequestsTrack',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  directives: {
    Ripple,
  },
  components: {
    FcButton,
    FcDataTableRequests,
    FcDialogRequestFilters,
    FcSearchBarRequests,
  },
  data() {
    const columns = [
      { value: 'ID', text: 'ID' },
      { value: 'data-table-expand', text: 'Location' },
      { value: 'STUDY_TYPE', text: 'Type' },
      { value: 'REQUESTER', text: 'Requester' },
      { value: 'CREATED_AT', text: 'Date Created' },
      { value: 'ASSIGNED_TO', text: 'Assigned To' },
      { value: 'DUE_DATE', text: 'Date Required' },
      { value: 'STATUS', text: 'Status' },
      { value: 'LAST_EDITED_AT', text: 'Last Updated' },
      { value: 'ACTIONS', text: '' },
    ];
    return {
      columns,
      filters: {
        assignees: [],
        closed: false,
        createdAt: 0,
        lastEditedAt: 0,
        statuses: [],
        studyTypes: [],
        userOnly: false,
      },
      loadingSaveStudyRequest: new Set(),
      search: {
        column: null,
        query: null,
      },
      selectedItems: [],
      SHORTCUT_CHIPS,
      showFilters: false,
      sortBy: 'DUE_DATE',
      studyRequests: [],
      studyRequestsBulk: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    activeShortcutChip: {
      get() {
        for (let i = 0; i < SHORTCUT_CHIPS.length; i++) {
          if (filtersMatchShortcutChip(this.filters, SHORTCUT_CHIPS[i])) {
            return i;
          }
        }
        return null;
      },
      set(activeShortcutChip) {
        const { userOnly } = this.filters;
        const { filters } = SHORTCUT_CHIPS[activeShortcutChip];
        this.filters = {
          ...filters,
          userOnly,
        };
      },
    },
    colorIconFilter() {
      if (this.filterChips.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
    filterChips() {
      const {
        assignees,
        closed,
        createdAt,
        lastEditedAt,
        statuses,
        studyTypes,
        userOnly,
      } = this.filters;
      const filterChips = [];
      studyTypes.forEach((studyType) => {
        const { label: text } = studyType;
        const filterChip = { filter: 'studyTypes', text, value: studyType };
        filterChips.push(filterChip);
      });
      statuses.forEach((status) => {
        const text = statusFilterText(this.itemsNormalized, status);
        const filterChip = { filter: 'statuses', text, value: status };
        filterChips.push(filterChip);
      });
      if (closed) {
        const filterChip = { filter: 'closed', text: 'Closed', value: true };
        filterChips.push(filterChip);
      }
      assignees.forEach((assignee) => {
        const text = assignee === null ? 'None' : assignee.text;
        const filterChip = { filter: 'assignees', text, value: assignee };
        filterChips.push(filterChip);
      });
      if (createdAt !== 0) {
        const text = timeAgoFilterText('Created', createdAt);
        const filterChip = { filter: 'createdAt', text, value: createdAt };
        filterChips.push(filterChip);
      }
      if (lastEditedAt !== 0) {
        const text = timeAgoFilterText('Updated', lastEditedAt);
        const filterChip = { filter: 'lastEditedAt', text, value: lastEditedAt };
        filterChips.push(filterChip);
      }
      if (userOnly) {
        const filterChip = { filter: 'userOnly', text: 'User', value: true };
        filterChips.push(filterChip);
      }
      return filterChips;
    },
    hasFilters() {
      return this.filterChips.length > 0 || this.search.query !== null;
    },
    items() {
      let items = this.itemsNormalized.filter(
        item => filtersMatchItem(this.filters, this.auth.user, item),
      );

      const { column, query } = this.search;
      if (query !== null) {
        const searchKey = searchKeyForColumn(column);
        items = items.filter(item => searchKey(query, item));
      }

      return items;
    },
    itemsNormalized() {
      const itemsStudyRequests = this.studyRequests.map(
        studyRequest => normalizeItemStudyRequest(
          this.studyRequestLocations,
          this.studyRequestUsers,
          studyRequest,
        ),
      );
      const itemsStudyRequestsBulk = this.studyRequestsBulk.map(
        studyRequestBulk => normalizeItemStudyRequestBulk(
          this.studyRequestLocations,
          this.studyRequestUsers,
          studyRequestBulk,
        ),
      );
      return [
        ...itemsStudyRequests,
        ...itemsStudyRequestsBulk,
      ];
    },
    selectAll: {
      get() {
        const k = this.selectedItems.length;
        if (k === 0) {
          return false;
        }
        if (k === this.items.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          this.selectedItems = this.items;
        } else {
          this.selectedItems = [];
        }
      },
    },
    ...mapState(['auth']),
  },
  created() {
    const userOnly = !this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
    this.filters.userOnly = userOnly;
  },
  methods: {
    async actionAssignTo({ item, assignedTo }) {
      const { studyRequest } = item;
      studyRequest.assignedTo = assignedTo;
      if (assignedTo === null) {
        studyRequest.status = StudyRequestStatus.REQUESTED;
      } else {
        studyRequest.status = StudyRequestStatus.ASSIGNED;
      }

      this.loadingSaveStudyRequest.add(item.id);
      const {
        studyRequest: studyRequestUpdated,
      } = await this.saveStudyRequest(studyRequest);
      /* eslint-disable-next-line no-param-reassign */
      item.studyRequest = studyRequestUpdated;
      this.loadingSaveStudyRequest.delete(item.id);
    },
    actionDownload(items) {
      const rows = items.map(getItemRow);
      const columns = [
        'id',
        'location',
        'studyType',
        'requestedBy',
        'createdAt',
        'assignedTo',
        'dueDate',
        'status',
        'lastEditedAt',
        'urgent',
        'urgentReason',
        'estimatedDeliveryDate',
        'lng',
        'lat',
        'daysOfWeek',
        'duration',
        'hours',
        'notes',
      ];
      const csvStr = csvFormat(rows, columns);
      const csvData = new Blob([csvStr], { type: 'text/csv' });
      saveAs(csvData, 'requests.csv');
    },
    async actionRefresh() {
      this.loading = true;
      await this.loadAsyncForRoute();
      this.loading = false;
    },
    actionShowItem(item) {
      const { id, type } = item;
      const name = type === ItemType.STUDY_REQUEST_BULK
        ? 'requestStudyBulkView'
        : 'requestStudyView';
      const route = {
        name,
        params: { id },
      };
      this.$router.push(route);
    },
    async loadAsyncForRoute() {
      const {
        studyRequests,
        studyRequestsBulk,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequests();

      this.studyRequests = studyRequests;
      this.studyRequestsBulk = studyRequestsBulk;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;
    },
    removeFilter({ filter, value }) {
      if (filter === 'closed') {
        this.filters.closed = false;
      } else if (filter === 'createdAt') {
        this.filters.createdAt = 0;
      } else if (filter === 'lastEditedAt') {
        this.filters.lastEditedAt = 0;
      } else if (filter === 'userOnly') {
        this.filters.userOnly = false;
      } else {
        const values = this.filters[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
    },
    setFilters(filters) {
      this.filters = filters;
    },
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-requests-track {
  background-color: var(--v-shading-base);
  max-height: calc(100vh - 52px);
  width: 100%;

  & .fc-shortcut-chips .v-chip.v-chip {
    &:not(:hover) {
      background-color: #fff !important;
    }
    &.fc-shortcut-chip-active {
      border: 1px solid var(--v-primary-base);
    }
  }

  & .fc-requests-track-card {
    height: calc(100% - 4px);
  }

  & .fc-data-table-requests-wrapper {
    height: calc(100% - 53px);
    & > .fc-data-table-requests {
      height: calc(100% - 1px);
    }
  }
}
</style>
