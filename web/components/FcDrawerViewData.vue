<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <div class="flex-grow-0 flex-shrink-0 pa-5">
      <FcSearchBarLocation />
    </div>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <template v-else>
        <header class="px-5 pt-1 pb-5">
          <h1
            class="display-3 text-truncate"
            :title="location.description">
            {{location.description}}
          </h1>
          <div class="label mt-5">
            <span v-if="locationFeatureType !== null">
              {{locationFeatureType.description}} &#x2022;
            </span>
            <span>{{countSummaryHeaderText}}</span>
          </div>
          <div class="mt-4">
            <div class="label mb-1">Nearby</div>
            <div>
              <div
                v-if="!hasPoisNearby"
                class="display-2">
                None
              </div>
              <v-tooltip
                v-if="poiSummary.hospital !== null"
                bottom>
                <template v-slot:activator="{ on }">
                  <v-chip
                    v-on="on"
                    class="mr-2"
                    color="pink lighten-4"
                    text-color="pink darken-4">
                    <v-avatar left>
                      <v-icon>mdi-hospital-box</v-icon>
                    </v-avatar>
                    Hospital Zone
                  </v-chip>
                </template>
                <span>{{Math.round(poiSummary.hospital.geom_dist)}} m</span>
              </v-tooltip>
              <v-tooltip
                v-if="poiSummary.school !== null"
                bottom>
                <template v-slot:activator="{ on }">
                  <v-chip
                    v-on="on"
                    class="mr-2"
                    color="teal lighten-4"
                    text-color="teal darken-4">
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

        <section class="shading">
          <header class="pa-5">
            <div class="align-center d-flex">
              <h2 class="headline">Collisions</h2>
              <div class="pl-3 subtitle-1">{{collisionSummary.total}} total</div>
              <v-spacer></v-spacer>
              <FcDialogCollisionFilters
                v-if="showFiltersCollision"
                v-model="showFiltersCollision"
                v-bind="filtersCollision"
                @set-filters="setFiltersCollision">
              </FcDialogCollisionFilters>
              <FcButton
                type="secondary"
                @click.stop="showFiltersCollision = true">
                <v-icon
                  :color="colorIconFilterCollision"
                  left>mdi-filter-variant</v-icon>
                Filter
              </FcButton>
            </div>

            <div
              v-if="filterChipsCollision.length > 0"
              class="mt-5">
              <v-chip
                v-for="(filterChip, i) in filterChipsCollision"
                :key="i"
                class="mb-2 mr-2 primary--text"
                color="light-blue lighten-5"
                @click="removeFilterCollision(filterChip)">
                <v-icon left>mdi-check</v-icon>
                {{filterChip.label}}
              </v-chip>
            </div>
          </header>

          <FcDataTableCollisions
            class="shading"
            :collision-summary="collisionSummary"
            :loading="loadingCollisions"
            @show-reports="actionShowReportsCollision" />
        </section>

        <v-divider></v-divider>

        <section>
          <header class="pa-5">
            <div class="align-center d-flex">
              <h2 class="headline">Studies</h2>
              <div class="pl-3 subtitle-1">{{numCountsText}}</div>
              <v-spacer></v-spacer>
              <FcDialogStudyFilters
                v-if="showFiltersStudy"
                v-model="showFiltersStudy"
                v-bind="filtersStudy"
                @set-filters="setFiltersStudy">
              </FcDialogStudyFilters>
              <FcButton
                v-if="countSummary.length > 0 || filterChipsStudy.length > 0"
                type="secondary"
                @click.stop="showFiltersStudy = true">
                <v-icon
                  :color="colorIconFilterStudy"
                  left>mdi-filter-variant</v-icon>
                Filter
              </FcButton>
              <FcButton
                class="ml-3"
                type="primary"
                @click="actionRequestStudy">
                <v-icon left>mdi-plus-box</v-icon>
                Request Study
              </FcButton>
            </div>

            <div
              v-if="filterChipsStudy.length > 0"
              class="mt-5">
              <v-chip
                v-for="(filterChip, i) in filterChipsStudy"
                :key="i"
                class="mb-2 mr-2 primary--text"
                color="light-blue lighten-5"
                @click="removeFilterStudy(filterChip)">
                <v-icon left>mdi-check</v-icon>
                {{filterChip.label}}
              </v-chip>
            </div>
          </header>
          <div
            v-if="countSummary.length === 0"
            class="my-8 py-12 secondary--text text-center">
            There are no studies for this location,<br>
            please request a study if necessary
          </div>
          <FcDataTableStudies
            v-else
            :count-summary="countSummary"
            :loading="loadingCounts"
            @show-reports="actionShowReports" />
          <div class="pa-5">
            <div
              v-for="studyRequest in studyRequestsPending"
              :key="studyRequest.id"
              class="align-center d-flex">
              <v-icon
                color="warning"
                left>mdi-information</v-icon>
              <div>
                {{studyRequest.studyType.label}}
                has been requested on {{studyRequest.createdAt | date}}.
                <router-link :to="{
                  name: 'requestStudyView',
                  params: { id: studyRequest.id },
                }">View details.</router-link>
              </div>
            </div>
          </div>
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

import { AuthScope } from '@/lib/Constants';
import {
  getCollisionsByCentrelineSummary,
  getCountsByCentrelineSummary,
  getLocationByFeature,
  getPoiByCentrelineSummary,
  getStudyRequestsByCentrelinePending,
} from '@/lib/api/WebApi';
import ArrayStats from '@/lib/math/ArrayStats';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTableCollisions from '@/web/components/FcDataTableCollisions.vue';
import FcDataTableStudies from '@/web/components/FcDataTableStudies.vue';
import FcDialogCollisionFilters from '@/web/components/dialogs/FcDialogCollisionFilters.vue';
import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSearchBarLocation from '@/web/components/inputs/FcSearchBarLocation.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewData',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcDataTableCollisions,
    FcDataTableStudies,
    FcDialogCollisionFilters,
    FcDialogStudyFilters,
    FcSearchBarLocation,
  },
  data() {
    return {
      collisionSummary: {
        total: 0,
        ksi: 0,
      },
      countSummary: [],
      loadingCollisions: false,
      loadingCounts: false,
      poiSummary: {
        school: null,
      },
      showFiltersCollision: false,
      showFiltersStudy: false,
      studyRequestsPending: [],
    };
  },
  computed: {
    colorIconFilterCollision() {
      if (this.filterChipsCollision.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
    colorIconFilterStudy() {
      if (this.filterChipsStudy.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
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
      const { hospital, school } = this.poiSummary;
      return hospital !== null || school !== null;
    },
    numCountsText() {
      const n = ArrayStats.sum(
        this.countSummary.map(({ numPerCategory }) => numPerCategory),
      );
      if (n === 0) {
        return 'None';
      }
      return `${n} total`;
    },
    ...mapState('viewData', ['filtersCollision', 'filtersStudy']),
    ...mapState(['auth', 'legendOptions', 'location']),
    ...mapGetters('viewData', [
      'filterChipsCollision',
      'filterChipsStudy',
      'filterParamsStudy',
    ]),
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
    'legendOptions.datesFrom': async function legendOptionsDatesFrom() {
      this.loadingCollisions = true;
      const { datesFrom } = this.legendOptions;

      const { centrelineId, centrelineType } = this.$route.params;
      const now = DateTime.local();
      const collisionsDateRange = {
        start: now.minus({ years: datesFrom }),
        end: now,
      };
      const collisionsFilters = {
        ...collisionsDateRange,
      };

      const collisionSummary = await getCollisionsByCentrelineSummary(
        { centrelineId, centrelineType },
        collisionsFilters,
      );
      this.collisionSummary = collisionSummary;
      this.loadingCollisions = false;
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
    actionShowReports({ category: { studyType } }) {
      const { centrelineId, centrelineType } = this.$route.params;
      const params = {
        centrelineId,
        centrelineType,
        studyTypeName: studyType.name,
      };
      this.$router.push({
        name: 'viewReportsAtLocation',
        params,
      });
    },
    actionShowReportsCollision() {
      const { centrelineId, centrelineType } = this.$route.params;
      const params = {
        centrelineId,
        centrelineType,
      };
      this.$router.push({
        name: 'viewCollisionReportsAtLocation',
        params,
      });
    },
    async loadAsyncForRoute(to) {
      const { datesFrom } = this.legendOptions;
      const { centrelineId, centrelineType } = to.params;
      const now = DateTime.local();
      const collisionsDateRange = {
        start: now.minus({ years: datesFrom }),
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
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
        tasks.push(getStudyRequestsByCentrelinePending({ centrelineId, centrelineType }));
      }
      const [
        collisionSummary,
        countSummary,
        location,
        poiSummary,
        studyRequestsPending = [],
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.countSummary = countSummary;
      this.poiSummary = poiSummary;
      this.studyRequestsPending = studyRequestsPending;

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
      'removeFilterCollision',
      'removeFilterStudy',
      'setFiltersCollision',
      'setFiltersStudy',
    ]),
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-data {
  max-height: 100vh;
}
</style>
