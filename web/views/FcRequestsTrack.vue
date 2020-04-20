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
            <v-chip outlined>All</v-chip>
            <v-chip outlined>New</v-chip>
            <v-chip outlined>Recently Updated</v-chip>
            <v-chip outlined>Cancelled</v-chip>
            <v-chip outlined>Closed</v-chip>
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

          <FcButton
            v-if="items.length > 0 || filterChips.length > 0"
            type="secondary"
            @click.stop="showFilters = true">
            <v-icon
              :color="colorIconFilter"
              left>mdi-filter-variant</v-icon>
            Filter
          </FcButton>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="fc-data-table-requests-wrapper overflow-y-hidden pa-0">
          <FcDataTableRequests
            v-model="selectedItems"
            :columns="columns"
            :items="items"
            :loading="loading"
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

import { centrelineKey, StudyRequestStatus } from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import { getStudyRequests } from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSearchBarRequests from '@/web/components/inputs/FcSearchBarRequests.vue';
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
      activeShortcutChipTemp: 0, // TODO: get rid of this
      columns,
      search: {
        column: null,
        query: null,
      },
      selectedItems: [],
      showFilters: false,
      studyRequests: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    activeShortcutChip: {
      get() {
        // TODO: implement this
        return this.activeShortcutChipTemp;
      },
      set(activeShortcutChip) {
        // TODO: implement this
        this.activeShortcutChipTemp = activeShortcutChip;
      },
    },
    colorIconFilter() {
      if (this.filterChips.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
    filterChips() {
      // TODO: implement this
      return [];
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
    actionAssignTo({ item, assignedTo }) {
      const { studyRequest } = item;
      studyRequest.assignedTo = assignedTo;
      studyRequest.status = StudyRequestStatus.ASSIGNED;
      this.saveStudyRequest(studyRequest);
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
    ...mapActions([
      'saveStudyRequest',
    ]),
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
