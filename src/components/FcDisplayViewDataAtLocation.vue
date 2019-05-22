<template>
  <div class="fc-display-view-data-at-location flex-2">
    <div class="flex-container-column">
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
        <button class="tds-button-secondary" :disabled="$v.$invalid">
          <i class="fa fa-download"></i>
        </button>
        <button class="tds-button-secondary" :disabled="$v.$invalid">
          <i class="fa fa-print"></i>
        </button>
        <button
          class="tds-button-primary"
          @click="onActionBulk('request-study')"
          :disabled="$v.$invalid">
          <i class="fa fa-plus"></i>
          <span> Request Study</span>
        </button>
      </header>
      <FcCardTableCounts
        :sections="sections"
        v-model="selection"
        @action-item="onActionItem" />
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapMutations, mapState } from 'vuex';

import FcCardTableCounts from '@/components/FcCardTableCounts.vue';
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

function itemIsCount(item) {
  return Number.isInteger(item.id);
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
    countsFiltered() {
      const values = this.filterCountTypes
        .map(i => Constants.COUNT_TYPES[i].value);
      return this.counts.filter(c => values.includes(c.type.value));
    },
    numSelectable() {
      return this.selectableIds.length;
    },
    numSelected() {
      return this.selection.length;
    },
    sections() {
      return Constants.COUNT_TYPES.map((type) => {
        const countsOfType = this.counts
          .filter(c => c.type.value === type.value);
        if (countsOfType.length === 0) {
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
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          Constants.SortKeys.Counts.DATE,
          Constants.SortDirection.DESC,
        );
        const item = countsOfTypeSorted[0];
        const children = countsOfTypeSorted.slice(1);
        return { item, children };
      });
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
      return this.numSelected === this.numSelectable;
    },
    selectionIndeterminate() {
      return this.numSelected > 0 && !this.selectionAll;
    },
    ...mapState([
      'counts',
      'filterCountTypes',
      'filterDate',
      'showMap',
    ]),
  },
  validations: {
    selection: {
      required,
    },
  },
  methods: {
    actionDownload(items, { formats }) {
      const downloadFormats = formats || ['CSV'];
      const counts = items.filter(itemIsCount);
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
      // TODO: move this logic into CountsRequestedTable to show these
      /*
      const requestStudyItems = Constants.COUNT_TYPES
        .filter(({ value }) => studyTypes.has(value))
        .map(type => {
          const countsOfType = this.counts
            .filter(c => c.type.value === type.value);
          if (countsOfType.length === 0) {
            return {
              id: type.value,
              type,
              date: null,
              status: Constants.Status.NO_EXISTING_COUNT,
            };
          }
          const { type, date, status } = ArrayUtils.getMaxBy(
            countsOfType,
            Constants.SortKeys.Counts.DATE,
          );
          return {
            id: type.value,
            type,
            date,
            status,
          };
        });
      */
      this.newStudyRequest({
        studyTypes: Array.from(studyTypes),
      });
      this.$router.push({ name: 'requestStudy' });
      this.setShowMap(true);
    },
    actionShowReports(items) {
      // TODO: we could use options here to load specific report types?
      this.setModal({
        component: 'FcModalShowReports',
        data: {
          items,
        },
      });
    },
    onActionBulk(type, options) {
      const actionOptions = options || {};
      if (type === 'download') {
        this.actionDownload(this.selection, actionOptions);
      } else if (type === 'request-study') {
        this.actionRequestStudy(this.selection, actionOptions);
      }
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'download') {
        this.actionDownload([item], actionOptions);
      } else if (type === 'request-study') {
        this.actionRequestStudy([item], actionOptions);
      } else if (type === 'show-reports') {
        this.actionShowReports([item], actionOptions);
      }
    },
    onChangeSelectAll() {
      if (this.selectionAll) {
        this.selection = [];
      } else {
        this.selection = this.selectableIds;
      }
    },
    ...mapMutations(['setModal', 'setShowMap']),
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
