<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <div class="flex-grow-0 flex-shrink-0 pa-5">
      <SearchBarLocation />
    </div>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <template v-else>
        <header class="px-5 pt-1 pb-5">
          <h1 class="display-2">{{location.description}}</h1>
          <div class="mt-2">
            <span v-if="locationFeatureType !== null">
              {{locationFeatureType.description}} &#x2022;
            </span>
            <span>{{countSummaryHeaderText}}</span>
          </div>
          <v-row class="mt-5">
            <v-col cols="2">
              <div>KSI</div>
              <div class="headline">
                {{collisionSummary.ksi}}
              </div>
            </v-col>
            <v-col cols="2">
              <div>Collisions</div>
              <div class="headline">
                {{collisionSummary.total}}
              </div>
            </v-col>
          </v-row>
          <div class="mt-5">
            <div>Nearby</div>
            <div class="mt-1">
              <div v-if="!hasPoisNearby">
                No points of interest nearby
              </div>
              <v-tooltip
                v-if="poiSummary.school !== null"
                bottom>
                <template v-slot:activator="{ on }">
                  <v-chip
                    v-on="on"
                    class="mr-2"
                    color="teal lighten-4"
                    text-color="teal darken-1">
                    <v-avatar left>
                      <v-icon>mdi-school</v-icon>
                    </v-avatar>
                    School Zone
                  </v-chip>
                </template>
                <span>{{Math.round(poiSummary.school.geom_dist)}} m</span>
              </v-tooltip>
            </div>
          </div>
        </header>
        <v-divider></v-divider>
        <section>
          <header class="pa-5">
            <div class="align-center d-flex">
              <h2 class="subtitle-1">Studies</h2>
              <div class="caption pl-3">{{numCountsText}}</div>
              <v-spacer></v-spacer>
              <FcDialogStudyFilters
                v-if="showFilters"
                v-model="showFilters"
                v-bind="filters"
                @set-filters="setFilters">
              </FcDialogStudyFilters>
              <v-btn
                color="primary"
                outlined
                @click.stop="showFilters = true">
                <v-icon left>mdi-filter-variant</v-icon>
                Filter
              </v-btn>
              <v-btn
                class="ml-3"
                color="primary"
                @click="actionRequestStudy">
                Request Study
              </v-btn>
            </div>

            <div
              v-if="filterChips.length > 0"
              class="mt-5">
              <v-chip
                v-for="(filterChip, i) in filterChips"
                :key="i"
                class="mr-2"
                close
                color="blue lighten-4"
                @click:close="removeFilter(filterChip)">
                {{filterChip.label}}
              </v-chip>
            </div>
          </header>
          <FcDataTableStudies
            :count-summary="countSummary"
            :loading="loadingCounts"
            @show-reports="actionShowReports" />
        </section>
      </template>
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

import {
  getCollisionsByCentrelineSummary,
  getCountsByCentrelineSummary,
  getLocationByFeature,
  getPoiByCentrelineSummary,
} from '@/lib/api/WebApi';
import ArrayStats from '@/lib/math/ArrayStats';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTableStudies from '@/web/components/FcDataTableStudies.vue';
import SearchBarLocation from '@/web/components/SearchBarLocation.vue';
import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewData',
  mixins: [FcMixinRouteAsync],
  components: {
    FcDataTableStudies,
    FcDialogStudyFilters,
    SearchBarLocation,
  },
  data() {
    return {
      collisionSummary: {
        total: 0,
        ksi: 0,
      },
      countSummary: [],
      loadingCounts: false,
      poiSummary: {
        school: null,
      },
      showFilters: false,
    };
  },
  computed: {
    countSummaryHeaderText() {
      const n = this.countSummary.length;
      if (n === 0) {
        return 'No Studies';
      }
      const nStr = n === 1 ? '1 Study Type' : `${n} Study Types`;
      const mostRecentDate = DateTime.max(
        ...this.countSummary.map(({ count: { date } }) => date),
      );
      const mostRecentDateStr = TimeFormatters.formatDefault(mostRecentDate);
      return `${nStr} (${mostRecentDateStr})`;
    },
    hasPoisNearby() {
      // TODO: expand this to multiple types of POIs
      return this.poiSummary.school !== null;
    },
    numCountsText() {
      const n = ArrayStats.sum(
        this.countSummary.map(({ numPerCategory }) => numPerCategory),
      );
      return `${n} total`;
    },
    ...mapState('viewData', ['filters']),
    ...mapState(['auth', 'location']),
    ...mapGetters('viewData', ['filterChips', 'filterParams']),
    ...mapGetters(['locationFeatureType']),
  },
  watch: {
    async filterParams() {
      this.loadingCounts = true;
      const {
        centrelineId,
        centrelineType,
      } = this.location;
      const countSummary = await getCountsByCentrelineSummary(
        { centrelineId, centrelineType },
        this.filterParams,
      );
      this.countSummary = countSummary;
      this.loadingCounts = false;
    },
    location(location, locationPrev) {
      if (location === null) {
        this.$router.push({
          name: 'viewData',
        });
        return;
      }
      const { centrelineId, centrelineType } = location;
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
  methods: {
    actionRequestStudy() {
      this.$router.push({ name: 'requestStudyNew' });
    },
    actionShowReports({ category: { value: categoryValue } }) {
      const { centrelineId, centrelineType } = this.$route.params;
      const params = {
        centrelineId,
        centrelineType,
        categoryValue,
      };
      this.$router.push({
        name: 'viewReportsAtLocation',
        params,
      });
    },
    async loadAsyncForRoute(to) {
      const { centrelineId, centrelineType } = to.params;
      const now = DateTime.local();
      const collisionsDateRange = {
        start: now.minus({ years: 1 }),
        end: now,
      };
      const collisionsFilters = {
        ...collisionsDateRange,
      };
      const tasks = [
        getCollisionsByCentrelineSummary({ centrelineId, centrelineType }, collisionsFilters),
        getCountsByCentrelineSummary({ centrelineId, centrelineType }, this.filterParams),
        getLocationByFeature({ centrelineId, centrelineType }),
        getPoiByCentrelineSummary({ centrelineId, centrelineType }),
      ];
      const [
        collisionSummary,
        countSummary,
        location,
        poiSummary,
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.countSummary = countSummary;
      this.poiSummary = poiSummary;

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
    ...mapMutations('viewData', [
      'removeFilter',
      'setFilters',
    ]),
    ...mapMutations([
      'setFilterCountTypes',
      'setLocation',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-drawer-view-data {
  max-height: 100vh;
}
</style>
