<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-divider></v-divider>
      <div class="px-5">
        <h1 class="display-3 mt-8">Track Requests</h1>
      </div>
    </header>

    <section class="flex-grow-1 flex-shrink-1 mt-6 mb-8 overflow-y-auto px-5">
      <v-card class="fc-requests-track-card">
        <v-card-title class="align-center d-flex py-2">
          <v-simple-checkbox class="mr-6"></v-simple-checkbox>

          <FcButton
            v-if="selectedItems.length === 0"
            class="mr-2"
            :loading="loadingRefresh"
            type="secondary"
            @click="actionRefresh()">
            <v-icon
              color="primary"
              left>mdi-refresh</v-icon>
            Refresh
          </FcButton>
          <FcButton
            v-else
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
          <FcDataTable
            v-model="selectedItems"
            class="fc-data-table-requests"
            :columns="columns"
            fixed-header
            height="100%"
            :items="items"
            :loading="loading || loadingRefresh"
            must-sort
            show-select
            sort-by="ID"
            :sort-desc="true"
            :sort-keys="sortKeys">
            <template v-slot:no-data>
              <div class="mt-8 pt-7 secondary--text">
                <span v-if="itemsStudyRequests.length === 0">
                  You have not requested a study,<br>
                  please view the map <router-link :to="{name: 'viewData'}">here</router-link>
                </span>
                <span v-else>
                  No requests match the active filters,<br>
                  <a href="#" @click.prevent="actionClearAllFilters">
                    clear filters
                  </a> to see requests
                </span>
              </div>
            </template>
            <template v-slot:header.data-table-select>
            </template>
            <template v-slot:item.ID="{ item }">
              <span>{{item.id}}</span>
            </template>
            <template v-slot:item.LOCATION="{ item }">
              <div class="text-truncate">
                <span
                  v-if="item.location !== null"
                  :title="item.location.description">
                  {{item.location.description}}
                </span>
              </div>
            </template>
            <template v-slot:item.STUDY_TYPE="{ item }">
              <div class="text-truncate">
                {{item.studyType.label}}
              </div>
            </template>
            <template v-slot:item.REQUESTER="{ item }">
              <div class="text-truncate">
                <span
                  v-if="item.requestedBy !== null"
                  :title="item.requestedBy.uniqueName">
                  {{item.requestedBy.uniqueName}}
                </span>
              </div>
            </template>
            <template v-slot:item.DATE="{ item }">
              <span>{{item.dueDate | date}}</span>
            </template>
            <template v-slot:item.ASSIGNED_TO="{ item }">
              <span v-if="item.assignedTo === null">
                NONE
              </span>
              <span v-else>{{item.assignedTo.replace('_', ' ')}}</span>
            </template>
            <template v-slot:item.STATUS="{ item }">
              <div class="align-center d-flex">
                <v-icon
                  :color="item.status.color"
                  left>mdi-circle-medium</v-icon>
                <span>
                  {{item.status.text}}
                </span>
              </div>
            </template>
            <template v-slot:header.ACTIONS>
              <span class="sr-only">Actions</span>
            </template>
            <template v-slot:item.ACTIONS="{ item }">
              <div class="text-right">
                <v-icon
                  v-if="item.urgent"
                  class="mr-2"
                  color="warning"
                  title="Urgent">mdi-clipboard-alert</v-icon>

                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <FcButton
                      :aria-label="'View Request #' + item.id"
                      type="icon"
                      @click="actionShowRequest(item)"
                      v-on="on">
                      <v-icon>mdi-file-eye</v-icon>
                    </FcButton>
                  </template>
                  <span>View Request #{{item.id}}</span>
                </v-tooltip>
              </div>
            </template>
          </FcDataTable>
        </v-card-text>
      </v-card>
    </section>
  </section>
</template>

<script>
import { csvFormat } from 'd3-dsv';
import { saveAs } from 'file-saver';
import { mapActions, mapState } from 'vuex';

import {
  centrelineKey,
  SearchKeys,
  SortKeys,
} from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import {
  getStudyRequests,
  putStudyRequests,
} from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function getItemRow(item) {
  const {
    assignedTo,
    hours,
    id,
    notes,
    status,
    studyType: { label: studyType },
    urgent,
    urgentReason,
  } = item;

  const [lng, lat] = item.geom.coordinates;
  const location = (item.location && item.location.description) || null;
  const requester = (item.requestedBy && item.requestedBy.uniqueName) || null;
  const dueDate = TimeFormatters.formatDefault(item.dueDate);
  const estimatedDeliveryDate = TimeFormatters.formatDefault(item.estimatedDeliveryDate);

  let { daysOfWeek, duration } = item;
  daysOfWeek = TimeFormatters.formatDaysOfWeek(daysOfWeek);
  if (studyType.automatic) {
    duration = formatDuration(duration);
  } else {
    duration = null;
  }

  return {
    assignedTo,
    daysOfWeek,
    dueDate,
    duration,
    estimatedDeliveryDate,
    hours,
    id,
    lat,
    lng,
    location,
    notes,
    requester,
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
  components: {
    FcButton,
    FcDataTable,
  },
  data() {
    const columns = [{
      value: 'ID',
      text: 'ID',
    }, {
      value: 'LOCATION',
      text: 'Location',
    }, {
      value: 'STUDY_TYPE',
      text: 'Type',
    }, {
      value: 'REQUESTER',
      text: 'Requester',
    }, {
      value: 'DATE',
      text: 'Due Date',
    }, {
      value: 'ASSIGNED_TO',
      text: 'Assign',
    }, {
      value: 'STATUS',
      text: 'Status',
    }, {
      value: 'ACTIONS',
      text: '',
    }];
    return {
      columns,
      loadingRefresh: false,
      searchKeys: SearchKeys.Requests,
      selectedItems: [],
      showFilters: false,
      sortKeys: SortKeys.Requests,
      studyRequests: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
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
      // TODO: implement filters
      return this.itemsStudyRequests;
    },
    itemsStudyRequests() {
      return this.studyRequests.map((studyRequest) => {
        const {
          centrelineId,
          centrelineType,
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
          ...studyRequest,
          location,
          requestedBy,
        };
      });
    },
    ...mapState(['auth']),
  },
  methods: {
    actionDownload(studyRequests) {
      const rows = studyRequests.map(getItemRow);
      const columns = [
        'id',
        'location',
        'requester',
        'dueDate',
        'estimatedDeliveryDate',
        'urgent',
        'urgentReason',
        'assignedTo',
        'status',
        'lng',
        'lat',
        'studyType',
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
      this.loadingRefresh = true;
      await this.loadAsyncForRoute();
      this.loadingRefresh = false;
    },
    actionShowRequest(item) {
      const route = {
        name: 'requestStudyView',
        params: { id: item.id },
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
    async setStudyRequests(items, updates) {
      const studyRequests = items.map((item) => {
        const studyRequest = this.studyRequests.find(({ id }) => id === item.id);
        return Object.assign(studyRequest, updates);
      });
      return putStudyRequests(this.auth.csrf, studyRequests);
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
