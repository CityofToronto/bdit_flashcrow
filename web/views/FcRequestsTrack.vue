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
        <button
          class="fc-request-download font-size-l"
          @click="actionExport(selectedItems)">
          <i class="fa fa-download"></i>
          <span> Download</span>
        </button>
      </header>
      <FcCardTable
        class="fc-card-table-requests"
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
          <div class="cell-actions">
            <button
              class="tds-button-secondary font-size-m"
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
  RequestStatus,
  SearchKeys,
  SortDirection,
  SortKeys,
} from '@/lib/Constants';
import {
  REQUESTS_STUDY_DOWNLOAD_NO_SELECTION,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcCardTable from '@/web/components/FcCardTable.vue';
import FcSummaryStudy from '@/web/components/FcSummaryStudy.vue';
import TdsActionDropdown from '@/web/components/tds/TdsActionDropdown.vue';
import TdsLabel from '@/web/components/tds/TdsLabel.vue';

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
    actionDelete(studyRequests) {
      const n = studyRequests.length;

      const title = n > 1 ? `Delete ${n} Requests?` : 'Delete Request?';

      const studyRequestsHumanParts = studyRequests.map(({ id, location }, i) => {
        const maybeAnd = i === n - 1 && n > 1 ? 'and ' : '';
        return `${maybeAnd}Request #${id} at ${location.description}`;
      });
      const studyRequestsHuman = studyRequestsHumanParts.join(', ');
      const prompt = `You are about to delete ${studyRequestsHuman}.  Is that OK?`;

      this.setModal({
        component: 'TdsConfirmDialog',
        data: {
          title,
          prompt,
          action: () => {
            this.deleteStudyRequests({
              isSupervisor: this.isSupervisor,
              studyRequests,
            });
          },
        },
      });
    },
    actionExport(studyRequests) {
      if (studyRequests.length === 0) {
        this.setToast(REQUESTS_STUDY_DOWNLOAD_NO_SELECTION);
        return;
      }
      const data = studyRequests.map((item) => {
        const { id, priority, status } = item;
        const location = (item.location && item.location.description) || null;
        const requester = (item.requestedBy && item.requestedBy.name) || null;
        const dueDate = TimeFormatters.formatDefault(item.dueDate);
        const studies = item.studies.map(({ studyType }) => studyType).join(' ');
        return {
          id,
          location,
          requester,
          dueDate,
          priority,
          status,
          studies,
        };
      });
      const columns = [
        'id',
        'location',
        'requester',
        'dueDate',
        'priority',
        'status',
        'studies',
      ];
      const csvStr = csvFormat(data, columns);
      const csvData = new Blob([csvStr], { type: 'text/csv' });
      saveAs(csvData, 'requests.csv');
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
    onChangeSelectAll() {
      if (this.selectionAll) {
        this.selection = [];
      } else {
        this.selection = this.selectableIds;
      }
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
  & > section {
    & > header {
      align-items: center;
      background-color: var(--base-lighter);
      padding: var(--space-m) var(--space-l);
      & > * {
        margin-right: var(--space-m);
        &:last-child {
          margin-right: 0;
        }
      }
      & > button.tds-button-secondary:not(:disabled):hover {
        background-color: var(--base-light);
      }
    }
  }

  .fc-card-table-requests {
    .priority-urgent {
      color: var(--error);
    }
    & > colgroup {
      & > .col-SELECTION {
        width: var(--space-xl);
      }
      & > .col-ID {
        width: var(--space-3xl);
      }
      & > .col-DATE,
      & > .col-PRIORITY {
        width: var(--space-3xl);
      }
      & > .col-STATUS {
        width: calc(var(--space-3xl) * 1.5);
      }
      & > .col-ACTIONS {
        width: var(--space-xl);
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
    .cell-actions {
      & > button:not(:last-child) {
        margin-right: var(--space-s);
      }
    }
  }
}
</style>
