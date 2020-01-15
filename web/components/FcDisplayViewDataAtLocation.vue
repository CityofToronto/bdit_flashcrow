<template>
  <div class="fc-display-view-data-at-location">
    <div class="flex-container-column">
      <header>
        <h1 class="my-l">View Data</h1>
        <div class="bar-actions-bulk flex-container-row p-l mb-l">
          <v-checkbox
            v-model="selectionAll"
            :indeterminate="selectionIndeterminate"
            name="selectAll"></v-checkbox>
          <div class="py-s">
            <v-btn
              @click="onActionBulk('request-study')">
              <v-icon left>mdi-plus</v-icon> Request Study
            </v-btn>
          </div>
          <div class="flex-fill"></div>
          <FcFiltersViewDataAtLocation
            v-model="filter"
            class="py-s" />
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
        :items-counts="itemsCounts"
        @action-item="onActionItem" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import {
  COUNT_TYPES,
  SortDirection,
  SortKeys,
  Status,
} from '@/lib/Constants';
import {
  getCountsByCentreline,
  getLocationByFeature,
  getStudiesByCentreline,
} from '@/lib/api/WebApi';
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
    const itemsCountsActive = {};
    COUNT_TYPES.forEach(({ value }) => {
      itemsCountsActive[value] = 0;
    });
    return {
      counts: [],
      filter: {
        countTypes: [...COUNT_TYPES.keys()],
        date: null,
        dayOfWeek: [...Array(7).keys()],
      },
      itemsCountsActive,
      loadingLocationData: true,
      selection: [],
      studies: [],
    };
  },
  computed: {
    itemsCounts() {
      const { countTypes, date, dayOfWeek } = this.filter;
      return countTypes.map((i) => {
        const type = COUNT_TYPES[i];
        const activeIndex = this.itemsCountsActive[type.value];
        let countsOfType = this.counts
          .filter(c => c.type.value === type.value);
        let studiesOfType = this.studies
          .filter(s => s.studyType === type.value);
        if (date !== null) {
          const [start, end] = date;
          countsOfType = countsOfType
            .filter(c => start <= c.date && c.date <= end);
          /*
           * TODO: determine if we should instead filter by estimated date here (e.g. from
           * the study request).
           */
          studiesOfType = studiesOfType
            .filter(c => start <= c.createdAt && c.createdAt <= end);
        }
        countsOfType = countsOfType
          .filter(c => dayOfWeek.includes(c.date.weekday));
        studiesOfType = studiesOfType
          .filter(({ daysOfWeek }) => daysOfWeek.some(d => dayOfWeek.includes(d)));

        const expandable = countsOfType.length > 0;

        if (countsOfType.length === 0 && studiesOfType.length === 0) {
          const noExistingCount = {
            id: type.value,
            type,
            date: null,
            status: Status.NO_EXISTING_COUNT,
          };
          return {
            activeIndex,
            counts: [noExistingCount],
            expandable,
            id: type.value,
          };
        }
        studiesOfType = studiesOfType.map((study) => {
          const {
            id,
            createdAt,
            studyRequestId,
          } = study;
          return {
            id: `STUDY:${id}`,
            type,
            date: createdAt,
            status: Status.REQUEST_IN_PROGRESS,
            studyRequestId,
          };
        });
        countsOfType = studiesOfType.concat(countsOfType);
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          SortKeys.Counts.DATE,
          SortDirection.DESC,
        );
        return {
          activeIndex,
          counts: countsOfTypeSorted,
          expandable,
          id: type.value,
        };
      });
    },
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
    selectionAll: {
      get() {
        return this.selectableIds.length > 0
          && this.selectableIds.every(id => this.selection.includes(id));
      },
      set(selectionAll) {
        if (selectionAll) {
          this.selection = this.selectableIds;
        } else {
          this.selection = [];
        }
      },
    },
    selectionIndeterminate() {
      return this.selection.length > 0 && !this.selectionAll;
    },
    ...mapGetters([
      'studyTypesRelevantToLocation',
    ]),
    ...mapState([
      'auth',
      'location',
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
        this.filter.countTypes = studyTypesIndices;
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
      this.$router.push({ name: 'requestStudyNew' });
    },
    actionSelectActiveIndex(item, { activeIndex }) {
      const { id } = item;
      Vue.set(this.itemsCountsActive, id, activeIndex);
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
      } else if (type === 'select-active-index') {
        this.actionSelectActiveIndex(item, actionOptions);
      } else if (type === 'show-reports') {
        this.actionShowReports(item, actionOptions);
      }
    },
    async syncFromRoute(to) {
      const { centrelineId, centrelineType } = to.params;
      const tasks = [
        getCountsByCentreline({ centrelineId, centrelineType }),
        getLocationByFeature({ centrelineId, centrelineType }),
      ];
      if (this.auth.loggedIn) {
        tasks.push(
          getStudiesByCentreline({ centrelineId, centrelineType }),
        );
      }
      const [
        counts,
        location,
        studies = [],
      ] = await Promise.all(tasks);
      this.counts = counts;
      this.studies = studies;

      const itemsCountsActive = {};
      COUNT_TYPES.forEach(({ value }) => {
        itemsCountsActive[value] = 0;
      });
      this.itemsCountsActive = itemsCountsActive;

      if (this.location === null
          || location.centrelineId !== this.location.centrelineId
          || location.centrelineType !== this.location.centrelineType
          || location.description !== this.location.description) {
        this.setLocation(location);
      }
    },
    ...mapActions([
      'fetchCountsByCentreline',
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
