<template>
  <div class="fc-display-view-data-at-location flex-2">
    <div class="flex-container-column">
      <header class="flex-container-row">
        <label class="tds-checkbox">
          <input
            type="checkbox"
            disabled
            name="selectAll"
            :checked="selectionAll"
            :indeterminate.prop="selectionIndeterminate"
            @change="onChangeSelectAll" />
        </label>
        <div class="flex-fill"></div>
        <button class="tds-button-secondary" disabled>
          <i class="fa fa-download"></i>
        </button>
        <button class="tds-button-secondary" disabled>
          <i class="fa fa-print"></i>
        </button>
        <button
          class="tds-button-primary"
          @click="onActionBulk('request-study')"
          disabled>
          <i class="fa fa-plus"></i>
          <span> Request Study</span>
        </button>
      </header>
      <FcCardTableCounts
        :sections="sections"
        v-model="selection"
        @action-card="onActionCard"
        @action-item="onActionItem" />
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapActions, mapMutations, mapState } from 'vuex';

import FcCardTableCounts from '@/components/FcCardTableCounts.vue';
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

function idIsCount(id) {
  return Number.isInteger(id);
}

export default {
  name: 'FcDisplayViewDataAtLocation',
  components: {
    FcCardTableCounts,
  },
  data() {
    return {
      selection: [],
    };
  },
  computed: {
    sections() {
      return this.filterCountTypes.map((i) => {
        const type = Constants.COUNT_TYPES[i];
        let countsOfType = this.counts
          .filter(c => c.type.value === type.value);
        if (countsOfType.length === 0) {
          if (this.filterDate !== null) {
            return null;
          }
          return {
            item: {
              id: type.value,
              type,
              date: null,
              status: Constants.Status.NO_EXISTING_COUNT,
            },
            children: null,
          };
        }
        if (this.filterDate !== null) {
          const { start, end } = this.filterDate;
          countsOfType = countsOfType
            .filter(c => start <= c.date && c.date <= end);
          if (countsOfType.length === 0) {
            return null;
          }
        }
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          Constants.SortKeys.Counts.DATE,
          Constants.SortDirection.DESC,
        );
        const item = countsOfTypeSorted[0];
        const children = countsOfTypeSorted.slice(1);
        return { item, children };
      }).filter(section => section !== null);
    },
    selectableIds() {
      const selectableIds = [];
      this.sections.forEach(({ item, children }) => {
        selectableIds.push(item.id);
        if (children !== null) {
          children.forEach(({ id }) => {
            selectableIds.push(id);
          });
        }
      });
      return selectableIds;
    },
    selectionAll() {
      return this.selectableIds
        .every(id => this.selection.includes(id));
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapState([
      'counts',
      'filterCountTypes',
      'filterDate',
      'location',
      'showMap',
    ]),
  },
  validations: {
    selection: {
      required,
    },
  },
  watch: {
    location() {
      if (this.location === null) {
        this.$router.push({
          name: 'viewData',
        });
        return;
      }
      const { centrelineId, centrelineType } = this.location;
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
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
    actionDownload(items, { formats }) {
      const downloadFormats = formats || ['CSV'];
      const counts = items.filter(item => idIsCount(item.id));
      if (counts.length === 0) {
        return;
      }
      if (counts.length === 1 && downloadFormats.length === 1) {
        // TODO: single download
      } else {
        // TODO: multiple download (ZIP)
      }
      this.setModal({
        component: 'ModalComingSoon',
        data: {
          feature: 'download',
        },
      });
    },
    actionRequestStudy(items) {
      const studyTypes = new Set(items.map(item => item.type.value));
      if (studyTypes.size === 0) {
        return;
      }
      this.setNewStudyRequest(Array.from(studyTypes));
      this.$router.push({ name: 'requestStudy' });
      this.setShowMap(true);
    },
    actionShowReports(items) {
      const counts = items.filter(item => idIsCount(item.id));
      if (counts.length === 0) {
        return;
      }
      this.setModal({
        component: 'FcModalShowReports',
        data: { counts, activeIndex: 0 },
      });
    },
    onActionBulk(type, options) {
      const items = this.selection.map((id) => {
        if (idIsCount(id)) {
          return this.counts.find(count => count.id === id);
        }
        const countType = Constants.COUNT_TYPES.find(({ value }) => value === id);
        return {
          id: countType.value,
          type: countType,
          date: null,
          status: Constants.Status.NO_EXISTING_COUNT,
        };
      });
      const actionOptions = options || {};
      if (type === 'download') {
        this.actionDownload(items, actionOptions);
      } else if (type === 'request-study') {
        this.actionRequestStudy(items, actionOptions);
      }
    },
    onActionCard({
      type,
      item,
      children,
      options,
    }) {
      const actionOptions = options || {};
      const items = [item].concat(children);
      if (type === 'show-reports') {
        this.actionShowReports(items, actionOptions);
      }
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'download') {
        this.actionDownload([item], actionOptions);
      } else if (type === 'request-study') {
        this.actionRequestStudy([item], actionOptions);
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
      const { centrelineId, centrelineType } = to.params;
      const promiseCounts = this.fetchCountsByCentreline({
        centrelineId,
        centrelineType,
      });
      const promises = [promiseCounts];
      if (this.location === null) {
        const promiseLocation = this.fetchLocationFromCentreline({
          centrelineId,
          centrelineType,
        });
        promises.push(promiseLocation);
      }
      return Promise.all(promises);
    },
    ...mapActions([
      'fetchCountsByCentreline',
      'fetchLocationFromCentreline',
      'newStudyRequest',
    ]),
    ...mapMutations([
      'setNewStudyRequest',
      'setModal',
      'setShowMap',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-display-view-data-at-location {
  max-height: 100%;
  overflow: auto;
  padding: var(--space-m) var(--space-xl);
  & > .flex-container-column > header {
    align-items: center;
    background-color: var(--base-lighter);
    padding: var(--space-m) var(--space-l);
    & > * {
      margin-right: var(--space-m);
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
