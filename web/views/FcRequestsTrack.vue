<template>
  <div class="fc-requests-track flex-container-column flex-fill">
    <section>
      <header>
        <div class="bar-tabs flex-container-row bb">
          <button
            class="font-size-l px-4 uppercase"
            :class="{
              'tab-selected': !closed
            }"
            @click="setClosed(false)">Open</button>
          <button
            class="font-size-l px-4 uppercase"
            :class="{
              'tab-selected': closed
            }"
            @click="setClosed(true)">Closed</button>
        </div>
        <h1 class="my-4">
          <span v-if="closed">Closed Requests</span>
          <span v-else>Open Requests</span>
        </h1>
        <div class="bar-actions-bulk flex-container-row pa-4 mb-8">
          <template v-if="selectedItems.length > 0">
            <div
              v-if="closed"
              class="py-1">
              <button
                class="font-size-m ml-2 uppercase"
                @click="actionReopen(selectedItems)">
                <v-icon>mdi-door-open</v-icon>
                <span> Reopen</span>
              </button>
            </div>
            <template v-else>
              <div
                v-if="isSupervisor"
                class="br py-1">
                <button
                  class="font-size-m mr-2 uppercase"
                  @click="actionApprove(selectedItems)">
                  <v-icon>mdi-thumb-up</v-icon>
                  <span> Approve</span>
                </button>
                <button
                  class="font-size-m mr-2 uppercase"
                  @click="actionComplete(selectedItems)">
                  <v-icon>mdi-clipboard-check</v-icon>
                  <span> Complete</span>
                </button>
              </div>
              <div class="py-1">
                <button
                  class="font-size-m ml-2 uppercase"
                  @click="actionDownload(selectedItems)">
                  <v-icon>mdi-download</v-icon>
                  <span> Download</span>
                </button>
                <button
                  class="font-size-m ml-2 uppercase"
                  @click="actionClose(selectedItems)">
                  <v-icon>mdi-door-closed-lock</v-icon>
                  <span> Close</span>
                </button>
              </div>
            </template>
          </template>
          <div
            v-else
            class="py-1">
            <button
              class="font-size-m uppercase"
              @click="actionRefresh()">
              <v-icon>mdi-refresh</v-icon>
              <span> Refresh</span>
            </button>
          </div>
        </div>
      </header>
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
          <div
            class="flex-container-row"
            :title="'Show Request #' + item.id"
            @click.prevent="actionShowRequest(item)">
            <u>{{item.id}}</u>
          </div>
        </template>
        <template v-slot:item.LOCATION="{ item }">
          <div class="text-ellipsis">
            <span
              v-if="item.location === null"
              class="text-muted">
              N/A
            </span>
            <span
              v-else
              :title="item.location.description">
              {{item.location.description}}
            </span>
          </div>
        </template>
        <template v-slot:item.REQUESTER="{ item }">
          <span
            v-if="item.requestedBy === null"
            class="text-muted">
            N/A
          </span>
          <span v-else>
            {{item.requestedBy.uniqueName}}
          </span>
        </template>
        <template v-slot:item.DATE="{ item }">
          <span>{{item.dueDate | date}}</span>
        </template>
        <template v-slot:item.PRIORITY="{ item }">
          <TdsActionDropdown
            v-if="isSupervisor"
            class="font-size-m full-width"
            :options="[
              { label: 'STANDARD', value: { item, priority: 'STANDARD' } },
              { label: 'URGENT', value: { item, priority: 'URGENT' } },
            ]"
            @action-selected="actionSetPriority">
            <span
              :class="{
                'priority-urgent': item.priority === 'URGENT',
              }">
              <v-icon v-if="item.priority === 'URGENT'">mdi-exclamation</v-icon>
              <span> {{item.priority}}</span>
            </span>
          </TdsActionDropdown>
          <span
            v-else
            :class="{
              'priority-urgent': item.priority === 'URGENT',
            }">
            <v-icon v-if="item.priority === 'URGENT'">mdi-exclamation</v-icon>
            <span> {{item.priority}}</span>
          </span>
        </template>
        <template v-slot:item.ASSIGNED_TO="{ item }">
          <TdsActionDropdown
            v-if="isSupervisor"
            class="font-size-m full-width"
            :options="[
              { label: 'NONE', value: { item, assignedTo: null } },
              { label: 'OTI', value: { item, assignedTo: 'OTI' } },
              { label: 'FIELD STAFF', value: { item, assignedTo: 'FIELD_STAFF' } },
            ]"
            @action-selected="actionSetAssignedTo">
            <span
              v-if="item.assignedTo === null">
              NONE
            </span>
            <span v-else>{{item.assignedTo.replace('_', ' ')}}</span>
          </TdsActionDropdown>
          <span
            v-else-if="item.assignedTo === null"
            class="text-muted">
            NONE
          </span>
          <span v-else>{{item.assignedTo.replace('_', ' ')}}</span>
        </template>
        <template v-slot:item.STATUS="{ item }">
          <TdsLabel
            v-bind="RequestStatus[item.status]"
            class="full-width uppercase">
            {{RequestStatus[item.status].text}}
          </TdsLabel>
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
  </div>
</template>

<script>
import { csvFormat } from 'd3-dsv';
import { saveAs } from 'file-saver';
import {
  mapActions,
  mapMutations,
  mapState,
} from 'vuex';

import {
  centrelineKey,
  CentrelineType,
  COUNT_TYPES,
  RequestStatus,
  SearchKeys,
  SortKeys,
} from '@/lib/Constants';
import { formatDuration, formatOxfordCommaList } from '@/lib/StringFormatters';
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
import TdsActionDropdown from '@/web/components/tds/TdsActionDropdown.vue';
import TdsLabel from '@/web/components/tds/TdsLabel.vue';

function getItemFields(item) {
  const {
    centrelineType,
    id,
    priority,
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
    priority,
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

export default {
  name: 'FcRequestsTrack',
  components: {
    FcDataTable,
    FcSummaryStudy,
    TdsActionDropdown,
    TdsLabel,
  },
  data() {
    return {
      closed: false,
      loading: false,
      RequestStatus,
      searchKeys: SearchKeys.Requests,
      selectedItems: [],
      sortKeys: SortKeys.Requests,
      studyRequests: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    columns() {
      const columns = [{
        value: 'ID',
        text: 'ID#',
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
        value: 'PRIORITY',
        text: 'Priority',
      }, {
        value: 'ASSIGNED_TO',
        text: 'Assign',
      }, {
        value: 'STATUS',
        text: 'Status',
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
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.syncFromRoute(to)
      .then(() => {
        next();
      }).catch((err) => {
        next(err);
      });
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
        'priority',
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
    actionUpdateStudyRequests(studyRequests, actionName, updates) {
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
      this.setModal({
        component: 'TdsConfirmDialog',
        data: {
          title,
          prompt,
          action,
          textOk: actionUppercase,
        },
      });
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
    async syncFromRoute() {
      this.loading = true;

      const {
        studyRequests,
        studyRequestLocations,
        studyRequestUsers,
      } = await getUserStudyRequests(this.isSupervisor);

      this.studyRequests = studyRequests;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;
      this.loading = false;
    },
    ...mapActions([
      'saveStudyRequest',
      'setToast',
    ]),
    ...mapMutations([
      'setModal',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-requests-track {
  max-height: 100%;
  overflow: auto;
  padding: var(--space-m) var(--space-l);

  header > h1 {
    font-size: 3rem;
  }

  .bar-tabs > button {
    background-color: transparent;
    border: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: none;
    color: var(--base);
    &:hover {
      color: var(--ink);
    }
    &.tab-selected {
      background-color: var(--base-lighter);
      color: var(--ink);
    }
  }

  .bar-actions-bulk {
    align-items: center;
    background-color: var(--base-lighter);
  }

  .fc-data-table-requests {
    .priority-urgent {
      color: var(--error);
    }
  }
}
</style>
