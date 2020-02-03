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
          <template v-if="selectedItems.length > 0">
            <v-btn
              v-if="closed"
              class="mr-2"
              outlined
              @click="actionReopen(selectedItems)">
              <v-icon left>mdi-door-open</v-icon>
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
                <v-icon left>mdi-download</v-icon>
                Download
              </v-btn>
              <v-btn
                class="mr-2"
                outlined
                @click="actionClose(selectedItems)">
                <v-icon left>mdi-door-closed-lock</v-icon>
                Close
              </v-btn>
            </template>
          </template>
          <v-btn
            v-else
            class="mr-2"
            outlined
            @click="actionRefresh()">
            <v-icon left>mdi-refresh</v-icon>
            Refresh
          </v-btn>
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
        :loading="loading"
        show-select
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
          <span>
            {{item.status.text}}
          </span>
        </template>
        <template v-slot:item.ACTIONS="{ item }">
          <template v-if="isSupervisor">
            <button
              class="font-size-m mr-2"
              :title="'Approve Request #' + item.id"
              @click="actionApprove([item])">
              <v-icon>mdi-thumb-up</v-icon>
            </button>
            <button
              class="font-size-m mr-2"
              :title="'Ask for Changes to Request #' + item.id"
              @click="actionReject([item])">
              <v-icon>mdi-file-undo</v-icon>
            </button>
          </template>
        </template>
        <template v-slot:__expanded="{ item }">
          <div>
            <FcSummaryStudy
              v-for="(study, i) in item.studies"
              :key="'study_' + item.id + '_' + i"
              :index="i"
              :study-request="item" />
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
  COUNT_TYPES,
  SearchKeys,
  SortKeys,
} from '@/lib/Constants';
import { formatDuration } from '@/lib/StringFormatters';
import {
  getUserStudyRequests,
  putStudyRequests,
} from '@/lib/api/WebApi';
import {
  REQUESTS_STUDY_DOWNLOAD_NO_SELECTION,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcSummaryStudy from '@/web/components/FcSummaryStudy.vue';
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
  let {
    daysOfWeek,
    duration,
    studyType,
  } = study;
  daysOfWeek = TimeFormatters.formatDaysOfWeek(daysOfWeek);
  studyType = COUNT_TYPES.find(({ value }) => value === studyType);
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

/*
function getStudyRequestsToast(studyRequests, action) {
  if (studyRequests.length > 0) {
    return null;
  }
  // TODO: make it possible to parameterize entries in lib/i18n/Strings
  return {
    variant: 'warning',
    text: `Please select one or more requests to ${action}.`,
  };
}

function getStudyRequestsHuman(studyRequests, action) {
  const n = studyRequests.length;
  const actionUppercase = action[0].toUpperCase() + action.slice(1);
  const title = n > 1 ? `${actionUppercase} ${n} Requests?` : `${actionUppercase} Request?`;

  const studyRequestsHumanParts = studyRequests.map(
    ({ id, location }) => `Request #${id} at ${location.description}`,
  );
  const studyRequestsHuman = formatOxfordCommaList(studyRequestsHumanParts);
  const prompt = `You are about to ${action} ${studyRequestsHuman}.  Is that OK?`;

  return { title, prompt };
}
*/

export default {
  name: 'FcRequestsTrack',
  mixins: [FcMixinRouteAsync],
  components: {
    FcDataTable,
    FcSummaryStudy,
  },
  data() {
    return {
      indexClosed: 0,
      loading: false,
      searchKeys: SearchKeys.Requests,
      selectedItems: [],
      sortKeys: SortKeys.Requests,
      studyRequests: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    closed() {
      return this.indexClosed === 1;
    },
    columns() {
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
      if (this.isSupervisor) {
        columns.push({
          value: 'ACTIONS',
          text: 'Actions',
        });
      }
      return columns;
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
  methods: {
    actionApprove(studyRequests) {
      this.actionUpdateStudyRequests(studyRequests, 'approve', {
        status: 'ACCEPTED',
      });
    },
    actionClose(studyRequests) {
      this.actionUpdateStudyRequests(studyRequests, 'close', {
        closed: true,
      });
    },
    actionComplete(studyRequests) {
      this.actionUpdateStudyRequests(studyRequests, 'approve', {
        closed: true,
        status: 'COMPLETED',
      });
    },
    actionDownload(studyRequests) {
      if (studyRequests.length === 0) {
        this.setToast(REQUESTS_STUDY_DOWNLOAD_NO_SELECTION);
        return;
      }
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
    actionRefresh() {
      this.syncFromRoute(this.$route);
    },
    actionReject(studyRequests) {
      this.actionUpdateStudyRequests(studyRequests, 'reject', {
        status: 'REJECTED',
      });
    },
    actionReopen(studyRequests) {
      this.actionUpdateStudyRequests(studyRequests, 'reopen', {
        closed: false,
      });
    },
    actionSetAssignedTo({ item, assignedTo }) {
      const { isSupervisor } = this;
      const studyRequest = this.studyRequests.find(({ id }) => id === item.id);
      studyRequest.assignedTo = assignedTo;
      if (assignedTo === null) {
        studyRequest.status = 'ACCEPTED';
      } else {
        studyRequest.status = 'IN_PROGRESS';
      }
      this.saveStudyRequest({ isSupervisor, studyRequest });
    },
    actionSetPriority({ item, priority }) {
      const { isSupervisor } = this;
      const studyRequest = this.studyRequests.find(({ id }) => id === item.id);
      studyRequest.priority = priority;
      this.saveStudyRequest({ isSupervisor, studyRequest });
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
    actionUpdateStudyRequests(/* studyRequests, actionName, updates */) {
      /*
      const toast = getStudyRequestsToast(studyRequests, actionName);
      if (toast !== null) {
        this.setToast(toast);
        return;
      }
      const action = () => {
        this.setStudyRequests(studyRequests, updates);
      };
      if (studyRequests.length === 1) {
        action();
        return;
      }
      const { title, prompt } = getStudyRequestsHuman(studyRequests, actionName);
      const actionUppercase = actionName[0].toUpperCase() + actionName.slice(1);
      this.setDialog({
        component: 'TdsConfirmDialog',
        data: {
          title,
          prompt,
          action,
          textOk: actionUppercase,
        },
      });
      */
    },
    setClosed(closed) {
      this.closed = closed;
      this.selection = [];
    },
    async setStudyRequests(items, updates) {
      const { isSupervisor } = this;
      const studyRequests = items.map((item) => {
        const studyRequest = this.studyRequests.find(({ id }) => id === item.id);
        return Object.assign(studyRequest, updates);
      });
      return putStudyRequests(this.auth.csrf, isSupervisor, studyRequests);
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
