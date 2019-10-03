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
        <button
          class="tds-button-primary"
          @click="onActionBulk('request-study')"
          :disabled="$v.$invalid">
          <i class="fa fa-plus"></i>
          <span> Request Study</span>
        </button>
        <button class="tds-button-secondary" disabled>
          <i class="fa fa-download"></i>
        </button>
      </header>
      <FcCardTableCounts
        v-model="selection"
        @action-item="onActionItem" />
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import FcCardTableCounts from '@/src/components/FcCardTableCounts.vue';
import { COUNT_TYPES, Status } from '@/lib/Constants';

function idIsCount(id) {
  return Number.isInteger(id);
}

function idIsStudy(id) {
  return id.indexOf('STUDY:') === 0;
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
    selectableIds() {
      const selectableIds = [];
      this.itemsCounts.forEach(({ counts }) => {
        counts.forEach(({ id }) => {
          selectableIds.push(id);
        });
      });
      return selectableIds;
    },
    selectedCounts() {
      return this.selection
        .filter(idIsCount)
        .map(id => this.counts.find(c => c.id === id));
    },
    selectedTypes() {
      const studyTypes = new Set(this.selection.map((id) => {
        if (idIsCount(id)) {
          const count = this.counts.find(c => c.id);
          return count.type.value;
        }
        if (idIsStudy(id)) {
          const studyId = parseInt(id.slice('STUDY:'.length), 10);
          const study = this.studies.find(s => s.id === studyId);
          return study.studyType;
        }
        return id;
      }));
      return Array.from(studyTypes);
    },
    selectionAll() {
      return this.selectableIds
        .every(id => this.selection.includes(id));
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapGetters([
      'itemsCounts',
      'studyTypesRelevantToLocation',
    ]),
    ...mapState([
      'counts',
      'location',
      'showMap',
      'studies',
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
      /*
       * Update the URL to match the new location.  This allows the user to navigate between
       * recently selected locations with the back / forward browser buttons.
       */
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      });
    },
    studyTypesRelevantToLocation: {
      handler() {
        const studyTypesIndices = this.studyTypesRelevantToLocation
          .map(value => COUNT_TYPES.findIndex(({ value: typeValue }) => typeValue === value));
        this.setFilterCountTypes(studyTypesIndices);
      },
      immediate: true,
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
    actionDownload(counts, { formats }) {
      const downloadFormats = formats || ['CSV'];
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
    actionRequestStudy(studyTypes) {
      if (studyTypes.size === 0) {
        return;
      }
      this.setNewStudyRequest(Array.from(studyTypes));
      this.$router.push({ name: 'requestStudy' });
      this.setShowMap(true);
    },
    actionShowReports(item) {
      if (item.counts.length === 0) {
        return;
      }
      const [count] = item.counts;
      if (count.status === Status.NO_EXISTING_COUNT) {
        return;
      }
      this.setModal({
        component: 'FcModalShowReports',
        data: item,
      });
    },
    onActionBulk(type, options) {
      const actionOptions = options || {};
      if (type === 'download') {
        const counts = this.selectedCounts;
        this.actionDownload(counts, actionOptions);
      } else if (type === 'request-study') {
        const studyTypes = this.selectedTypes;
        this.actionRequestStudy(studyTypes, actionOptions);
      }
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'download') {
        const count = item.counts[item.activeIndex];
        this.actionDownload([count], actionOptions);
      } else if (type === 'request-study') {
        const studyType = item.id;
        this.actionRequestStudy([studyType], actionOptions);
      } else if (type === 'show-reports') {
        this.actionShowReports(item, actionOptions);
      }
    },
    onChangeSelectAll() {
      if (this.selectionAll) {
        this.selection = [];
      } else {
        this.selection = this.selectableIds;
      }
    },
    async syncFromRoute(to) {
      const { centrelineId, centrelineType } = to.params;
      const promiseCounts = this.fetchCountsByCentreline({
        centrelineId,
        centrelineType,
      });
      const promiseLocation = this.fetchLocationFromCentreline({
        centrelineId,
        centrelineType,
      });
      const result = await Promise.all([promiseCounts, promiseLocation]);
      const location = result[1];
      if (this.location === null
          || location.centrelineId !== this.location.centrelineId
          || location.centrelineType !== this.location.centrelineType) {
        this.setLocation(location);
      }
    },
    ...mapActions([
      'fetchCountsByCentreline',
      'fetchLocationFromCentreline',
      'newStudyRequest',
    ]),
    ...mapMutations([
      'setFilterCountTypes',
      'setLocation',
      'setModal',
      'setNewStudyRequest',
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
