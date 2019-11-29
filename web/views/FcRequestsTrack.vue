<template>
  <div class="fc-requests-track flex-container-column flex-fill">
    <section>
      <header class="flex-container-row">
        <label class="tds-checkbox">
          <input
            type="checkbox"
            name="selectAll"
            :checked="selectionAll"
            :indeterminate.prop="selectionIndeterminate"
            @change="onChangeSelectAll" />
        </label>
        <div class="flex-fill"></div>
        <div class="br">
          <template v-if="isSupervisor">
            <button
              class="font-size-l mr-m"
              @click="actionAccept(selectedItems)">
              <i class="fa fa-thumbs-up"></i>
              <span> Approve</span>
            </button>
            <button
              class="font-size-l mr-m"
              @click="actionReject(selectedItems)">
              <i class="fa fa-thumbs-down"></i>
              <span> Reject</span>
            </button>
            <button
              class="font-size-l mr-m"
              @click="actionComplete(selectedItems)">
              <i class="fa fa-check-circle"></i>
              <span> Complete</span>
            </button>
          </template>
          <button
            class="font-size-l mr-m"
            @click="actionExport(selectedItems)">
            <i class="fa fa-download"></i>
            <span> Download</span>
          </button>
        </div>
        <div>
          <button
            class="tds-button-error font-size-l ml-m"
            @click="actionDelete(selectedItems)">
            <i class="fa fa-trash-alt"></i>
            <span> Delete</span>
          </button>
        </div>
      </header>
      <FcCardTable
        class="fc-card-table-requests"
        :class="{ supervisor: isSupervisor }"
        :columns="columns"
        expandable
        :items="itemsStudyRequests"
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
          <span
            v-if="item.location === null"
            class="text-muted">
            N/A
          </span>
          <span v-else>
            {{item.location.description}}
          </span>
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
        <template v-slot:STATUS="{ item }">
          <TdsLabel
            v-bind="RequestStatus[item.status]">
            {{item.status}}
          </TdsLabel>
        </template>
        <template v-slot:ACTIONS="{ item }">
          <div
            v-if="isSupervisor"
            class="br">
            <button
              class="font-size-m mr-m"
              :disabled="item.status === 'ACCEPTED'"
              @click="actionAccept([item])">
              <i class="fa fa-thumbs-up"></i>
            </button>
            <button
              class="font-size-m mr-m"
              :disabled="item.status === 'REJECTED'"
              @click="actionReject([item])">
              <i class="fa fa-thumbs-down"></i>
            </button>
            <button
              class="font-size-m mr-m"
              :disabled="item.status === 'COMPLETED'"
              @click="actionComplete([item])">
              <i class="fa fa-check-circle"></i>
            </button>
          </div>
          <div>
            <button
              class="tds-button-error font-size-m ml-m"
              @click="actionDelete([item])">
              <i class="fa fa-trash-alt"></i>
            </button>
          </div>
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
      name: 'STATUS',
      title: 'Status',
    }, {
      name: 'ACTIONS',
    }];
    return {
      columns,
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
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    selectableIds() {
      return this.itemsNormalized.map(({ id }) => id);
    },
    selectedItems() {
      return this.selection
        .map(id => this.itemsNormalized.find(r => r.id === id));
    },
    selectionAll() {
      return this.selectableIds
        .every(id => this.selection.includes(id));
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
    actionAccept(studyRequests) {
      this.actionSetStatus(studyRequests, 'approve', 'ACCEPTED');
    },
    actionComplete(studyRequests) {
      this.actionSetStatus(studyRequests, 'mark as complete', 'COMPLETED');
    },
    actionDelete(studyRequests) {
      const actionName = 'delete';
      const toast = getStudyRequestsToast(studyRequests, actionName);
      if (toast !== null) {
        this.setToast(toast);
        return;
      }
      const { title, prompt } = getStudyRequestsHuman(studyRequests, actionName);
      const action = () => {
        this.deleteStudyRequests({
          isSupervisor: this.isSupervisor,
          studyRequests,
        });
      };
      this.setModal({
        component: 'TdsConfirmDialog',
        data: { title, prompt, action },
      });
    },
    actionExport(studyRequests) {
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
    actionReject(studyRequests) {
      this.actionSetStatus(studyRequests, 'reject', 'REJECTED');
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
      this.setModal({
        component: 'TdsConfirmDialog',
        data: { title, prompt, action },
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
  padding: var(--space-m) var(--space-xl);
  & > header {
    & > a {
      border-bottom: 1px solid var(--base-light);
      color: var(--ink);
      display: inline-block;
      text-decoration: none;
      &:hover {
        border-color: var(--base);
      }
      &.router-link-exact-active {
        border-color: var(--success);
        &:hover {
          border-color: var(--success-dark);
        }
      }
    }
  }
  & > section > header {
    align-items: center;
    background-color: var(--base-lighter);
    padding: var(--space-m) var(--space-l);
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
      & > .col-PRIORITY {
        width: var(--space-3xl);
      }
      & > .col-ACTIONS {
        width: var(--space-2xl);
      }
    }
    &.supervisor > colgroup {
      & > .col-ACTIONS {
        width: calc(var(--space-3xl) * 1.5);
      }
    }
    .cell-ID {
      & > div {
        align-items: center;
        cursor: pointer;
        & > u {
          color: var(--primary-vivid);
        }
      }
    }
    .cell-ACTIONS {
      & > div {
        display: inline-block;
      }
    }
  }
}
</style>
