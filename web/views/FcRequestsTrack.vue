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
            color="primary">
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
          <v-simple-checkbox class="mr-6"></v-simple-checkbox>

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
            :items="items"
            :loading="loading"
            :loading-items="loadingSaveStudyRequest"
            @assign-to="actionAssignTo"
            @show-request="actionShowRequest" />
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
  StudyRequestStatus,
} from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import { getStudyRequests } from '@/lib/api/WebApi';
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
      { value: 'LOCATION', text: 'Location' },
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
      studyRequests: [],
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
        const userOnly = !this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
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
        const { text } = status;
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
    items() {
      // TODO: implement filtering
      return this.itemsNormalized;
    },
    itemsNormalized() {
      return this.studyRequests.map((studyRequest) => {
        const {
          centrelineId,
          centrelineType,
          id,
          userId,
        } = studyRequest;

        const key = centrelineKey(centrelineType, centrelineId);
        let location = null;
        if (this.studyRequestLocations.has(key)) {
          location = this.studyRequestLocations.get(key);
        }

        let requestedBy = null;
        if (this.studyRequestUsers.has(userId)) {
          requestedBy = this.studyRequestUsers.get(userId);
        }

        return {
          id,
          location,
          requestedBy,
          studyRequest,
        };
      });
    },
    ...mapState(['auth']),
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
      const studyRequestUpdated = await this.saveStudyRequest(studyRequest);
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
    actionShowRequest({ studyRequest }) {
      const route = {
        name: 'requestStudyView',
        params: { id: studyRequest.id },
      };
      this.$router.push(route);
    },
    async loadAsyncForRoute() {
      const {
        studyRequests,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequests();

      this.studyRequests = studyRequests;
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
  max-height: 100vh;
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
