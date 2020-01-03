<template>
  <div class="fc-display-view-data-at-location">
    <div class="flex-container-column">
      <header>
        <h1 class="my-l">View Data</h1>
        <div class="bar-actions-bulk flex-container-row p-l mb-l">
          <label class="tds-checkbox mr-l">
            <input
              type="checkbox"
              name="selectAll"
              :checked="selectionAll"
              :indeterminate.prop="selectionIndeterminate"
              @change="onChangeSelectAll" />
          </label>
          <div class="py-s">
            <button
              class="font-size-l tds-button-primary uppercase"
              @click="onActionBulk('request-study')">
              <i class="fa fa-plus"></i>
              <span> Request Study</span>
            </button>
          </div>
          <div class="flex-fill"></div>
          <FcFiltersViewDataAtLocation class="py-s" />
        </div>
      </header>
      <div
        v-if="loadingLocationData"
        class="location-data-loading-spinner m-l">
        <TdsLoadingSpinner />
      </div>
      <FcCardTableCounts
        v-else
        v-model="selection"
        @action-item="onActionItem" />
    </div>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { COUNT_TYPES, Status } from '@/lib/Constants';
import { getLocationByFeature } from '@/lib/api/WebApi';
import FcCardTableCounts from '@/web/components/FcCardTableCounts.vue';
import FcFiltersViewDataAtLocation from '@/web/components/FcFiltersViewDataAtLocation.vue';
import TdsLoadingSpinner from '@/web/components/tds/TdsLoadingSpinner.vue';

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
    FcFiltersViewDataAtLocation,
    TdsLoadingSpinner,
  },
  data() {
    return {
      loadingLocationData: true,
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
      'studies',
    ]),
  },
  watch: {
    location(location, locationPrev) {
      if (location === null) {
        this.$router.push({
          name: 'viewData',
        });
        return;
      }
      const {
        centrelineId,
        centrelineType,
      } = location;
      if (locationPrev === null
        || locationPrev.centrelineId !== centrelineId
        || locationPrev.centrelineType !== centrelineType) {
        /*
         * Guard against duplicate navigation, which can happen when first loading the page.
         */
        let {
          centrelineId: centrelineIdRoute,
          centrelineType: centrelineTypeRoute,
        } = this.$route.params;
        centrelineIdRoute = parseInt(centrelineIdRoute, 10);
        centrelineTypeRoute = parseInt(centrelineTypeRoute, 10);
        if (centrelineIdRoute !== centrelineId || centrelineTypeRoute !== centrelineType) {
          /*
           * Update the URL to match the new location.  This allows the user to navigate between
           * recently selected locations with the back / forward browser buttons.
           */
          this.$router.push({
            name: 'viewDataAtLocation',
            params: { centrelineId, centrelineType },
          });
        }
      }
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
      vm.syncFromRoute(to)
        .then(() => {
          /* eslint-disable-next-line no-param-reassign */
          vm.loadingLocationData = false;
        });
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.loadingLocationData = true;
    this.syncFromRoute(to)
      .then(() => {
        next();
        this.loadingLocationData = false;
      }).catch((err) => {
        next(err);
      });
  },
  methods: {
    actionRequestStudy(studyTypes) {
      if (studyTypes.size === 0) {
        return;
      }
      this.setNewStudyRequest(Array.from(studyTypes));
      this.$router.push({ name: 'requestStudy' });
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
      if (type === 'request-study') {
        const studyTypes = this.selectedTypes;
        this.actionRequestStudy(studyTypes, actionOptions);
      }
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'request-study') {
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
      const promiseLocation = getLocationByFeature({
        centrelineId,
        centrelineType,
      });
      const result = await Promise.all([promiseCounts, promiseLocation]);
      const location = result[1];
      if (this.location === null
          || location.centrelineId !== this.location.centrelineId
          || location.centrelineType !== this.location.centrelineType
          || location.description !== this.location.description) {
        this.setLocation(location);
      }
    },
    ...mapActions([
      'fetchCountsByCentreline',
      'newStudyRequest',
    ]),
    ...mapMutations('requestStudy', [
      'setNewStudyRequest',
    ]),
    ...mapMutations([
      'setFilterCountTypes',
      'setLocation',
      'setModal',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-display-view-data-at-location {
  max-height: 100%;
  overflow: auto;
  padding: var(--space-m) var(--space-l);
  header > h1 {
    font-size: 3rem;
  }
  .bar-actions-bulk {
    align-items: center;
    background-color: var(--base-lighter);
  }
  .location-data-loading-spinner {
    height: var(--space-2xl);
    width: var(--space-2xl);
  }
}
</style>
