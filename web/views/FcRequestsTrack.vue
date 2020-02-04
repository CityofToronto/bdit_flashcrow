<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-tabs v-model="indexClosed">
        <v-tab>Open</v-tab>
        <v-tab>Closed</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <div class="pa-5">
        <h1 class="display-2">
          <span v-if="closed">Closed Requests</span>
          <span v-else>Open Requests</span>
        </h1>
        <div class="align-center d-flex mt-8 mb-2">
          <v-btn
            v-if="selectedItems.length === 0"
            class="mr-2"
            :loading="loadingRefresh"
            outlined
            @click="actionRefresh()">
            <v-icon left>mdi-refresh</v-icon>
            Refresh
          </v-btn>
          <template v-else>
            <v-btn
              v-if="closed"
              class="mr-2"
              outlined
              @click="actionReopen(selectedItems)">
              <v-icon left>mdi-lock-open-outline</v-icon>
              Reopen
            </v-btn>
            <template v-else>
              <template
                v-if="isSupervisor">
                <v-btn
                  class="mr-2"
                  outlined
                  @click="actionApprove(selectedItems)">
                  <v-icon left>mdi-thumb-up</v-icon>
                  Approve
                </v-btn>
                <v-btn
                  class="mr-2"
                  outlined
                  @click="actionComplete(selectedItems)">
                  <v-icon left>mdi-clipboard-check</v-icon>
                  Complete
                </v-btn>
              </template>
              <v-btn
                class="mr-2"
                outlined
                @click="actionDownload(selectedItems)">
                <v-icon left>mdi-cloud-download</v-icon>
                Download
              </v-btn>
              <v-btn
                class="mr-2"
                outlined
                @click="actionClose(selectedItems)">
                <v-icon left>mdi-lock</v-icon>
                Close
              </v-btn>
            </template>
          </template>
        </div>
        <v-divider></v-divider>
      </div>
    </header>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pa-5">
      <FcDataTable
        v-model="selectedItems"
        class="fc-data-table-requests"
        :class="{ supervisor: isSupervisor }"
        :columns="columns"
        expandable
        :items="items"
        :loading="loading || loadingRefresh"
        must-sort
        show-select
        sort-by="ID"
        :sort-desc="true"
        :sort-keys="sortKeys">
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
        <template v-slot:item.ACTIONS="{ item }">
          <div class="text-right">
            <v-btn
              v-if="isSupervisor && !closed"
              class="mr-2"
              :color="item.urgent ? 'warning' : ''"
              icon
              @click="actionUrgentToggle(item)">
              <v-icon>mdi-clipboard-alert</v-icon>
            </v-btn>
            <v-icon
              v-else-if="item.urgent"
              class="mr-2"
              color="warning"
              title="Urgent">mdi-clipboard-alert</v-icon>

            <template v-if="isSupervisor && !closed">
              <v-btn
                class="mr-2"
                :color="item.status === StudyRequestStatus.ACCEPTED ? 'primary' : ''"
                icon
                :title="'Approve Request #' + item.id"
                @click="actionApprove([item])">
                <v-icon>mdi-thumb-up</v-icon>
              </v-btn>
              <v-btn
                class="mr-2"
                :color="item.status === StudyRequestStatus.REJECTED ? 'error' : ''"
                icon
                :title="'Ask for Changes to Request #' + item.id"
                @click="actionReject([item])">
                <v-icon>mdi-clipboard-arrow-left</v-icon>
              </v-btn>
            </template>

            <v-btn
              icon
              :title="'View Request #' + item.id"
              @click="actionShowRequest(item)">
              <v-icon>mdi-file-eye</v-icon>
            </v-btn>
          </div>
        </template>
      </FcDataTable>
    </section>
  </section>
</template>

<script>
import { csvFormat } from 'd3-dsv';
import { saveAs } from 'file-saver';
import { mapActions, mapState } from 'vuex';

import {
  centrelineKey,
  CentrelineType,
  SearchKeys,
  SortKeys,
  StudyRequestStatus,
} from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import {
  getUserStudyRequests,
  putStudyRequests,
} from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function getItemFields(item) {
  const {
    centrelineType,
    id,
    urgent,
    urgentReason,
    assignedTo,
    status,
  } = item;
  let [lng, lat] = item.geom.coordinates;
  const location = (item.location && item.location.description) || null;
  const requester = (item.requestedBy && item.requestedBy.uniqueName) || null;
  const dueDate = TimeFormatters.formatDefault(item.dueDate);
  const estimatedDeliveryDate = TimeFormatters.formatDefault(item.estimatedDeliveryDate);
  if (centrelineType !== CentrelineType.INTERSECTION) {
    lng = null;
    lat = null;
  }
  return {
    id,
    location,
    requester,
    dueDate,
    estimatedDeliveryDate,
    urgent,
    urgentReason,
    assignedTo,
    status,
    lng,
    lat,
  };
}

function getStudyFields(study, i) {
  const studyIndex = i + 1;
  const {
    id: studyId,
    hours,
    notes,
  } = study;
  const { studyType } = study;
  let { daysOfWeek, duration } = study;
  daysOfWeek = TimeFormatters.formatDaysOfWeek(daysOfWeek);
  if (studyType.automatic) {
    duration = formatDuration(duration);
  } else {
    duration = null;
  }
  return {
    studyId,
    studyIndex,
    studyType: studyType.label,
    daysOfWeek,
    duration,
    hours,
    notes,
  };
}

function getItemRows(item) {
  const itemFields = getItemFields(item);
  return item.studies.map((study, i) => {
    const studyFields = getStudyFields(study, i);
    return {
      ...itemFields,
      ...studyFields,
    };
  });
}

export default {
  name: 'FcRequestsTrack',
  mixins: [FcMixinRouteAsync],
  components: {
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
      indexClosed: 0,
      loadingRefresh: false,
      searchKeys: SearchKeys.Requests,
      selectedItems: [],
      sortKeys: SortKeys.Requests,
      studyRequests: [],
      studyRequestLocations: new Map(),
      StudyRequestStatus,
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    closed() {
      return this.indexClosed === 1;
    },
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    items() {
      return this.itemsStudyRequests
        .filter(({ closed }) => closed === this.closed);
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
  watch: {
    closed() {
      this.selection = [];
    },
  },
  methods: {
    actionApprove(studyRequests) {
      this.setStudyRequests(studyRequests, {
        status: StudyRequestStatus.ACCEPTED,
      });
    },
    actionClose(studyRequests) {
      this.setStudyRequests(studyRequests, {
        closed: true,
      });
    },
    actionComplete(studyRequests) {
      this.setStudyRequests(studyRequests, {
        closed: true,
        status: StudyRequestStatus.COMPLETED,
      });
    },
    actionDownload(studyRequests) {
      const rows = Array.prototype.concat.apply([], studyRequests.map(getItemRows));
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
        'studyId',
        'studyIndex',
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
    actionReject(studyRequests) {
      this.setStudyRequests(studyRequests, {
        status: StudyRequestStatus.REJECTED,
      });
    },
    actionReopen(studyRequests) {
      this.setStudyRequests(studyRequests, {
        closed: false,
      });
    },
    actionShowRequest(item) {
      const route = {
        name: 'requestStudyView',
        params: { id: item.id },
      };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      this.$router.push(route);
    },
    actionUrgentToggle(item) {
      const { urgent } = item;
      this.setStudyRequests([item], {
        urgent: !urgent,
      });
    },
    async loadAsyncForRoute() {
      const {
        studyRequests,
        studyRequestLocations,
        studyRequestUsers,
      } = await getUserStudyRequests(this.isSupervisor);

      this.studyRequests = studyRequests;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;
    },
    async setStudyRequests(items, updates) {
      const { isSupervisor } = this;
      const studyRequests = items.map((item) => {
        const studyRequest = this.studyRequests.find(({ id }) => id === item.id);
        return Object.assign(studyRequest, updates);
      });
      return putStudyRequests(this.auth.csrf, isSupervisor, studyRequests);
    },
    ...mapActions([
      'saveStudyRequest',
      'setToast',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-requests-track {
  max-height: 100%;
  width: 100%;

  .fc-data-table-requests {
    .priority-urgent {
      color: var(--error);
    }
  }
}
</style>
