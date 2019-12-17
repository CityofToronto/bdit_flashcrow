<template>
  <div class="fc-requests-track flex-container-column flex-fill">
    <section>
      <header>
        <div class="bar-tabs flex-container-row bb">
          <button
            class="font-size-l px-l uppercase"
            :class="{
              'tab-selected': !closed
            }"
            @click="setClosed(false)">Open</button>
          <button
            class="font-size-l px-l uppercase"
            :class="{
              'tab-selected': closed
            }"
            @click="setClosed(true)">Closed</button>
        </div>
        <h1 class="my-l">
          <span v-if="closed">Closed Requests</span>
          <span v-else>Open Requests</span>
        </h1>
        <div class="bar-actions-bulk flex-container-row p-l mb-xl">
          <label class="tds-checkbox mr-l">
            <input
              type="checkbox"
              name="selectAll"
              :checked="selectionAll"
              :disabled="selectableIds.length === 0"
              :indeterminate.prop="selectionIndeterminate"
              @change="onChangeSelectAll" />
          </label>
          <template v-if="selectedItems.length > 0">
            <div
              v-if="closed"
              class="py-s">
              <button
                class="font-size-m ml-m uppercase"
                @click="actionReopen(selectedItems)">
                <i class="fa fa-door-open"></i>
                <span> Reopen</span>
              </button>
            </div>
            <template v-else>
              <div
                v-if="isSupervisor"
                class="br py-s">
                <button
                  class="font-size-m mr-m uppercase"
                  @click="actionApprove(selectedItems)">
                  <i class="fa fa-thumbs-up"></i>
                  <span> Approve</span>
                </button>
                <button
                  class="font-size-m mr-m uppercase"
                  @click="actionComplete(selectedItems)">
                  <i class="fa fa-clipboard-check"></i>
                  <span> Complete</span>
                </button>
              </div>
              <div class="py-s">
                <button
                  class="font-size-m ml-m uppercase"
                  @click="actionDownload(selectedItems)">
                  <i class="fa fa-download"></i>
                  <span> Download</span>
                </button>
                <button
                  class="font-size-m ml-m uppercase"
                  @click="actionClose(selectedItems)">
                  <i class="fa fa-door-closed"></i>
                  <span> Close</span>
                </button>
              </div>
            </template>
          </template>
          <div
            v-else
            class="py-s">
            <button
              class="font-size-m uppercase"
              @click="actionRefresh()">
              <i class="fa fa-redo-alt"></i>
              <span> Refresh</span>
            </button>
          </div>
        </div>
      </header>
      <FcCardTable
        class="fc-card-table-requests"
        :class="{ supervisor: isSupervisor }"
        :columns="columns"
        expandable
        :items="itemsStudyRequestsVisible"
        ref="table"
        :search-keys="searchKeys"
        :sort-by="sortBy"
        :sort-direction="sortDirection"
        :sort-keys="sortKeys"
        @update-items-normalized="updateItemsNormalized">
        <template v-slot:SELECTION="{ item, isChild }">
          <label v-if="!isChild" class="tds-checkbox">
            <input
              type="checkbox"
              name="selectionItems"
              :value="item.id"
              v-model="selection" />
          </label>
        </template>
        <template v-slot:ID="{ item }">
          <div
            class="flex-container-row"
            @click.prevent="actionShowRequest(item)">
            <u>{{item.id}}</u>
          </div>
        </template>
        <template v-slot:LOCATION="{ item }">
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
        <template v-slot:REQUESTER="{ item }">
          <span
            v-if="item.requestedBy === null"
            class="text-muted">
            N/A
          </span>
          <span v-else>
            {{item.requestedBy.name}}
          </span>
        </template>
        <template v-slot:DATE="{ item }">
          <span>{{item.dueDate | date}}</span>
        </template>
        <template v-slot:PRIORITY="{ item }">
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
              <i
                v-if="item.priority === 'URGENT'"
                class="fa fa-exclamation"></i>
              <span> {{item.priority}}</span>
            </span>
          </TdsActionDropdown>
          <span
            v-else
            :class="{
              'priority-urgent': item.priority === 'URGENT',
            }">
            <i
              v-if="item.priority === 'URGENT'"
              class="fa fa-exclamation"></i>
            <span> {{item.priority}}</span>
          </span>
        </template>
        <template v-slot:ASSIGNED_TO="{ item }">
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
        <template v-slot:STATUS="{ item }">
          <TdsLabel
            v-bind="RequestStatus[item.status]"
            class="full-width">
            {{item.status.replace('_', ' ')}}
          </TdsLabel>
        </template>
        <template v-slot:ACTIONS="{ item }">
          <template v-if="isSupervisor">
            <button
              class="font-size-m mr-m"
              @click="actionApprove([item])">
              <i class="fa fa-thumbs-up"></i>
            </button>
            <button
              class="font-size-m mr-m"
              @click="actionReject([item])">
              <i class="fa fa-file-import"></i>
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
      </FcCardTable>
    </section>
  </div>
</template>

<script>
import { csvFormat } from 'd3-dsv';
import { saveAs } from 'file-saver';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  CentrelineType,
  COUNT_TYPES,
  RequestStatus,
  SearchKeys,
  SortDirection,
  SortKeys,
} from '@/lib/Constants';
import { formatDuration, formatOxfordCommaList } from '@/lib/StringFormatters';
import {
  REQUESTS_STUDY_DOWNLOAD_NO_SELECTION,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcCardTable from '@/web/components/FcCardTable.vue';
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
  const requester = (item.requestedBy && item.requestedBy.name) || null;
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
    FcCardTable,
    FcSummaryStudy,
    TdsActionDropdown,
    TdsLabel,
  },
  data() {
    return {
      closed: false,
      itemsNormalized: [],
      searchKeys: SearchKeys.Requests,
      selection: [],
      sortBy: 'ID',
      sortDirection: SortDirection.DESC,
      sortKeys: SortKeys.Requests,
      RequestStatus,
    };
  },
  computed: {
    columns() {
      const columns = [{
        name: 'SELECTION',
      }, {
        name: 'ID',
        title: 'ID#',
      }, {
        name: 'LOCATION',
        title: 'Location',
      }, {
        name: 'REQUESTER',
        title: 'Requester',
      }, {
        name: 'DATE',
        title: 'Due Date',
      }, {
        name: 'PRIORITY',
        title: 'Priority',
      }, {
        name: 'ASSIGNED_TO',
        title: 'Assign',
      }, {
        name: 'STATUS',
        title: 'Status',
      }];
      if (this.isSupervisor) {
        columns.push({
          name: 'ACTIONS',
        });
      }
      return columns;
    },
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    itemsStudyRequestsVisible() {
      return this.itemsStudyRequests
        .filter(({ closed }) => closed === this.closed);
    },
    selectableIds() {
      return this.itemsNormalized.map(({ id }) => id);
    },
    selectedItems() {
      return this.selection
        .map(id => this.itemsNormalized.find(r => r.id === id));
    },
    selectionAll() {
      return this.selectableIds.length > 0
        && this.selectableIds.every(id => this.selection.includes(id));
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapGetters(['itemsStudyRequests']),
    ...mapState(['studyRequests']),
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
      this.actionSetStatus(studyRequests, 'approve', 'ACCEPTED');
    },
    actionClose(studyRequests) {
      console.log('close', studyRequests);
    },
    actionComplete(studyRequests) {
      this.actionSetStatus(studyRequests, 'mark as complete', 'COMPLETED');
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
      this.actionSetStatus(studyRequests, 'reject', 'REJECTED');
    },
    actionReopen(studyRequests) {
      console.log('reopen', studyRequests);
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
    actionSetStatus(studyRequests, actionName, status) {
      const toast = getStudyRequestsToast(studyRequests, actionName);
      if (toast !== null) {
        this.setToast(toast);
        return;
      }
      const action = () => {
        this.setStudyRequestsStatus(studyRequests, status);
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
    onChangeSelectAll() {
      if (this.selectionAll) {
        this.selection = [];
      } else {
        this.selection = this.selectableIds;
      }
    },
    setClosed(closed) {
      this.closed = closed;
      this.selection = [];
    },
    setStudyRequestsStatus(items, status) {
      const { isSupervisor } = this;
      const studyRequests = items.map(
        item => this.studyRequests.find(({ id }) => id === item.id),
      );
      return this.saveStudyRequestsStatus({
        isSupervisor,
        studyRequests,
        status,
      });
    },
    syncFromRoute() {
      return this.fetchAllStudyRequests(this.isSupervisor);
    },
    updateItemsNormalized(itemsNormalized) {
      this.itemsNormalized = itemsNormalized;
    },
    ...mapActions([
      'deleteStudyRequests',
      'fetchAllStudyRequests',
      'saveStudyRequest',
      'saveStudyRequestsStatus',
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

  .fc-card-table-requests {
    .priority-urgent {
      color: var(--error);
    }
    & > colgroup {
      & > .col-ID {
        width: calc(var(--space-2xl) * 1.5);
      }
      & > .col-DATE,
      & > .col-PRIORITY,
      & > .col-ASSIGNED_TO {
        width: var(--space-3xl);
      }
    }
    &.supervisor > colgroup {
      & > .col-PRIORITY {
        width: calc(var(--space-3xl) + var(--space-l));
      }
      & > .col-ASSIGNED_TO {
        width: calc(var(--space-3xl) + var(--space-xl));
      }
    }
    .cell-ID > div {
      align-items: center;
      cursor: pointer;
      & > u {
        color: var(--primary-vivid);
      }
    }
    .cell-ACTIONS > div {
      display: inline-block;
    }
    .cell-LOCATION > div {
      width: var(--space-4xl);
    }
  }
}
</style>
