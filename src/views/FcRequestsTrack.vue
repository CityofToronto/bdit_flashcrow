<template>
  <div class="fc-requests-track-by-type flex-container-column flex-fill">
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
          class="font-size-l"
          :class="{
            'tds-button-success': hasFilterRequestStatus,
          }" />
        <button
          class="tds-button-secondary"
          disabled>
          <i class="fa fa-eye"></i>
        </button>
        <button
          class="tds-button-secondary"
          disabled>
          <i class="fa fa-check-square"></i>
        </button>
        <button
          class="tds-button-secondary"
          disabled>
          <i class="fa fa-flag"></i>
        </button>
        <button
          class="tds-button-secondary"
          disabled>
          <i class="fa fa-user"></i>
        </button>
        <button
          class="tds-button-secondary"
          disabled>
          <i class="fa fa-external-link-square-alt"></i>
        </button>
      </header>
      <FcCardTableRequests
        v-model="selection"
        @action-item="onActionItem" />
    </section>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import FcCardTableRequests from '@/components/FcCardTableRequests.vue';
import FcFilterRequestStatus from '@/components/FcFilterRequestStatus.vue';
import ArrayUtils from '@/lib/ArrayUtils';

export default {
  name: 'FcRequestsTrackByStatus',
  components: {
    FcCardTableRequests,
    FcFilterRequestStatus,
  },
  data() {
    return {
      selection: [],
    };
  },
  computed: {
    selectableIds() {
      return this.itemsStudyRequests.map(({ id }) => id);
    },
    selectionAll() {
      return this.selectableIds
        .every(id => this.selection.includes(id));
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapGetters([
      'hasFilterRequestStatus',
      'itemsStudyRequests',
    ]),
    ...mapState([
      'filterRequestStatus',
      'studyRequests',
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
    this.syncFromRoute(to)
      .then(() => {
        next();
      }).catch((err) => {
        next(err);
      });
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
    syncFromRoute() {
      this.fetchAllStudyRequests();
    },
    ...mapActions(['fetchAllStudyRequests']),
    ...mapMutations(['setFilterRequestStatus']),
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
