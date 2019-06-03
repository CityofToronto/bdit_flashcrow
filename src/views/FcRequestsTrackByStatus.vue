<template>
  <div class="fc-requests-track-by-type flex-container-column flex-fill">
    <header class="mb-m">
      <router-link
        class="py-s"
        :to="{
          name: 'requestsTrackByStatus',
          query: { status: [RequestStatus.REQUESTED, RequestStatus.FLAGGED] },
        }">In Review
        <span class="tds-badge">{{numInReview}}</span>
      </router-link>
      <router-link
        class="ml-xl py-s"
        :to="{
          name: 'requestsTrackByStatus',
          query: { status: [RequestStatus.REVIEWED] },
        }">To Submit
        <span class="tds-badge">{{numToSubmit}}</span>
      </router-link>
      <router-link
        class="ml-xl py-s"
        :to="{
          name: 'requestsTrackByStatus',
          query: { status: [RequestStatus.SUBMITTED, RequestStatus.SCHEDULED] },
        }">In Progress
        <span class="tds-badge">{{numInProgress}}</span>
      </router-link>
      <router-link
        class="ml-xl py-s"
        :to="{
          name: 'requestsTrackByStatus',
          query: { status: [RequestStatus.DATA_READY] },
        }">Complete</router-link>
    </header>
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
        <FcFilterRequestStatus
          :active="filterRequestStatus.length > 0"
          class="font-size-l" />
        <button class="tds-button-secondary">
          <i class="fa fa-eye"></i>
        </button>
        <button class="tds-button-secondary">
          <i class="fa fa-check-square"></i>
        </button>
        <button class="tds-button-secondary">
          <i class="fa fa-flag"></i>
        </button>
        <button class="tds-button-secondary">
          <i class="fa fa-user"></i>
        </button>
        <button class="tds-button-secondary">
          <i class="fa fa-external-link-square-alt"></i>
        </button>
      </header>
      <FcCardTableRequests
        :sections="sections"
        v-model="selection"
        @action-item="onActionItem" />
    </section>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import FcCardTableRequests from '@/components/FcCardTableRequests.vue';
import FcFilterRequestStatus from '@/components/FcFilterRequestStatus.vue';
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'FcRequestsTrackByStatus',
  components: {
    FcCardTableRequests,
    FcFilterRequestStatus,
  },
  data() {
    return {
      RequestStatus: Constants.RequestStatus,
      selection: [],
    };
  },
  computed: {
    numInProgress() {
      const statii = [
        Constants.RequestStatus.SUBMITTED,
        Constants.RequestStatus.SCHEDULED,
      ];
      return this.requests
        .filter(({ status }) => statii.includes(status))
        .length;
    },
    numInReview() {
      const statii = [
        Constants.RequestStatus.REQUESTED,
        Constants.RequestStatus.FLAGGED,
      ];
      return this.requests
        .filter(({ status }) => statii.includes(status))
        .length;
    },
    numToSubmit() {
      const statii = [Constants.RequestStatus.REVIEWED];
      return this.requests
        .filter(({ status }) => statii.includes(status))
        .length;
    },
    sections() {
      const sections = this.requests.map(({
        id,
        location,
        dueDate,
        priority,
        requestedBy,
        status,
        counts,
      }) => {
        const item = {
          id,
          location,
          dueDate,
          priority,
          requestedBy,
          status,
        };
        return { item, children: counts };
      });
      return sections.filter(({ item }) => this.filterRequestStatus.includes(item.status));
    },
    selectableIds() {
      return this.sections.map(({ item }) => item.id);
    },
    selectionAll() {
      return this.selectableIds
        .every(id => this.selection.includes(id));
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapState([
      'filterRequestStatus',
      'requests',
    ]),
  },
  watch: {
    filterRequestStatus() {
      const status = ArrayUtils.sortBy(this.filterRequestStatus, x => x);
      this.$router.replace({
        name: 'requestsTrackByStatus',
        query: { status },
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.syncFromRoute(to);
    next();
  },
  methods: {
    actionAccept(/* items */) {
      // TODO: implement this
    },
    actionAssign(/* items */) {
      // TODO: implement this
    },
    actionExport(/* items */) {
      // TODO: implement this
    },
    actionFlag(/* items */) {
      // TODO: implement this
    },
    actionReview(/* items */) {
      // TODO: implement this
    },
    onActionBulk(type, options) {
      const items = this.selection.map(id => ({ id }));
      const actionOptions = options || {};
      if (type === 'review') {
        this.actionReview(items, actionOptions);
      } else if (type === 'accept') {
        this.actionAccept(items, actionOptions);
      } else if (type === 'flag') {
        this.actionFlag(items, actionOptions);
      } else if (type === 'assign') {
        this.actionAssign(items, actionOptions);
      } else if (type === 'export') {
        this.actionExport(items, actionOptions);
      }
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'review') {
        this.actionReview([item], actionOptions);
      } else if (type === 'accept') {
        this.actionAccept([item], actionOptions);
      } else if (type === 'flag') {
        this.actionFlag([item], actionOptions);
      } else if (type === 'assign') {
        this.actionAssign([item], actionOptions);
      } else if (type === 'export') {
        this.actionExport([item], actionOptions);
      }
    },
    onChangeSelectAll() {
      if (this.selectionAll) {
        this.selection = [];
      } else {
        this.selection = this.selectableIds;
      }
    },
    syncFromRoute(to) {
      let { status } = to.query;
      status = status || [];
      if (!Array.isArray(status)) {
        status = [status];
      }
      status = status.map(i => parseInt(i, 10));
      this.setFilterRequestStatus(status);
    },
    ...mapActions(['newStudyRequest']),
    ...mapMutations([
      'setFilterRequestStatus',
      'setModal',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-requests-track-by-type {
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
}
</style>
