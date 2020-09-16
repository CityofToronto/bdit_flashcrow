<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-divider></v-divider>
      <div class="px-5">
        <h1 class="display-3 mt-8">Track Requests</h1>

        <div class="align-center d-flex mt-6">
          <FcStudyRequestFilterShortcuts
            v-model="filters" />

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

          <FcStudyRequestFilters
            v-model="filters"
            :items="items" />
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

import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import { getStudyRequests } from '@/lib/api/WebApi';
import { filterItem, getFilterChips } from '@/lib/requests/RequestFilters';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSearchBarRequests from '@/web/components/inputs/FcSearchBarRequests.vue';
import FcStudyRequestFilters from '@/web/components/requests/FcStudyRequestFilters.vue';
import FcStudyRequestFilterShortcuts
  from '@/web/components/requests/FcStudyRequestFilterShortcuts.vue';
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
    FcSearchBarRequests,
    FcStudyRequestFilters,
    FcStudyRequestFilterShortcuts,
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
      sortBy: 'DUE_DATE',
      studyRequests: [],
      studyRequestsBulk: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    hasFilters() {
      const filterChips = getFilterChips(this.filters, this.items);
      return filterChips.length > 0 || this.search.query !== null;
    },
    items() {
      return this.itemsNormalized
        .map(item => filterItem(this.filters, this.search, this.user, item))
        .filter(item => item !== null);
    },
    itemsNormalized() {
      const itemsStudyRequests = this.studyRequests.map(
        studyRequest => getStudyRequestItem(
          this.studyRequestLocations,
          this.studyRequestUsers,
          studyRequest,
        ),
      );
      const itemsStudyRequestsBulk = this.studyRequestsBulk.map(
        studyRequestBulk => getStudyRequestBulkItem(
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
      let route;
      if (item.type === ItemType.STUDY_REQUEST_BULK) {
        const id = item.studyRequestBulk;
        route = {
          name: 'requestStudyBulkView',
          params: { id },
        };
      } else {
        const id = item.studyRequest;
        route = {
          name: 'requestStudyBulk',
          params: { id },
        };
      }
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
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-requests-track {
  background-color: var(--v-shading-base);
  max-height: calc(100vh - 52px);
  width: 100%;

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
