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
        <button
          class="fc-request-download font-size-l"
          @click="onActionBulk('export')">
          <i class="fa fa-download"></i>
          <span> Download</span>
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

import FcCardTableRequests from '@/web/components/FcCardTableRequests.vue';

export default {
  name: 'FcRequestsTrackByStatus',
  components: {
    FcCardTableRequests,
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
    selectedStudyRequests() {
      return this.selection
        .map(id => this.studyRequests.find(r => r.id === id));
    },
    selectionAll() {
      return this.selectableIds
        .every(id => this.selection.includes(id));
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapGetters(['itemsStudyRequests']),
    ...mapState([
      'studyRequests',
    ]),
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
        return `${maybeAnd}#${id} at ${location.description}`;
      });
      const studyRequestsHuman = studyRequestsHumanParts.join(', ');
      const prompt = `You are about to delete ${studyRequestsHuman}.  Is that OK?`;

      this.setModal({
        component: 'TdsConfirmDialog',
        data: {
          title,
          prompt,
          action: () => {
            this.deleteStudyRequests(studyRequests);
          },
        },
      });
    },
    actionExport(studyRequests) {
      // TODO: implement export here
      console.log('export', studyRequests);
    },
    onActionBulk(type, options) {
      const studyRequests = this.selectedStudyRequests;
      const actionOptions = options || {};
      if (type === 'export') {
        this.actionExport(studyRequests, actionOptions);
      }
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'delete') {
        this.actionDelete([item], actionOptions);
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
      return this.fetchAllStudyRequests();
    },
    ...mapActions([
      'deleteStudyRequests',
      'fetchAllStudyRequests',
    ]),
    ...mapMutations([
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
