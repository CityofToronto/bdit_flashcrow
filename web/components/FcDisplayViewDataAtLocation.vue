<template>
  <div class="fc-display-view-data-at-location d-flex flex-column">
    <div class="flex-grow-0 flex-shrink-0 px-3 py-2">
      <SearchBarLocation />
    </div>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loadingLocationData"
        indeterminate />
      <div v-else class="pa-3">
        <h1 class="display-2">{{location.description}}</h1>
        <div>
          <span v-if="locationFeatureType === null">&nbsp;</span>
          <span v-else>{{locationFeatureType.description}}</span>
        </div>
        <FcCardTableCounts
          v-model="selection"
          :items-counts="itemsCounts"
          @action-item="onActionItem" />
      </div>
    </section>
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
import SearchBarLocation from '@/web/components/SearchBarLocation.vue';

export default {
  name: 'FcDisplayViewDataAtLocation',
  components: {
    FcCardTableCounts,
    SearchBarLocation,
  },
  data() {
    const itemsCountsActive = {};
    COUNT_TYPES.forEach(({ value }) => {
      itemsCountsActive[value] = 0;
    });
    return {
      counts: [],
      itemsCountsActive,
      loadingLocationData: true,
      selection: [],
      studies: [],
    };
  },
  computed: {
    itemsCounts() {
      const countTypes = [...COUNT_TYPES.keys()];
      return countTypes.map((i) => {
        const type = COUNT_TYPES[i];
        const activeIndex = this.itemsCountsActive[type.value];
        let countsOfType = this.counts
          .filter(c => c.type.value === type.value);
        let studiesOfType = this.studies
          .filter(s => s.studyType === type.value);

        const expandable = false;
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
    ...mapState([
      'auth',
      'location',
    ]),
    ...mapGetters(['locationFeatureType']),
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
  max-height: 100vh;
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
