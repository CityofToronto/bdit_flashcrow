<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <div class="flex-grow-0 flex-shrink-0 pa-5">
      <FcSelectorSingleLocation />
    </div>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <template v-else>
        <header class="px-5 pt-1 pb-5">
          <h1
            class="display-3 text-truncate"
            :title="locationsDescription">
            {{locationsDescription}}
          </h1>
          <div class="label mt-5">
            <span v-if="locationFeatureType !== null">
              {{locationFeatureType.description}} &#x2022;
            </span>
            <span>{{studySummaryHeaderText}}</span>
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
              <div class="pl-3 subtitle-1">{{collisionTotal}} total</div>
              <v-spacer></v-spacer>
              <FcDialogCollisionFilters
                v-if="showFiltersCollision"
                v-model="showFiltersCollision"
                v-bind="filtersCollision"
                @set-filters="setFiltersCollision">
              </FcDialogCollisionFilters>
              <FcButton
                v-if="collisionTotal > 0"
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
              <div class="pl-3 subtitle-1">{{studyTotal}} total</div>
              <v-spacer></v-spacer>
              <FcDialogStudyFilters
                v-if="showFiltersStudy"
                v-model="showFiltersStudy"
                v-bind="filtersStudy"
                @set-filters="setFiltersStudy">
              </FcDialogStudyFilters>
              <FcButton
                v-if="studyTotal > 0"
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
            v-if="studyTotal === 0"
            class="my-8 py-12 secondary--text text-center">
            There are no studies for this location,<br>
            please request a study if necessary
          </div>
          <div
            v-else-if="studySummary.length === 0"
            class="my-8 py-12 secondary--text text-center">
            No studies match the active filters,<br>
            clear one or more filters to see studies
          </div>
          <FcDataTableStudies
            v-else
            :loading="loadingStudies"
            :study-summary="studySummary"
            @show-reports="actionShowReportsStudy" />
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
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { AuthScope, LocationSelectionType } from '@/lib/Constants';
import {
  getCollisionsByCentrelineSummary,
  getCollisionsByCentrelineTotal,
  getPoiByCentrelineSummary,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineTotal,
  getStudyRequestsByCentrelinePending,
} from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDataTableCollisions from '@/web/components/FcDataTableCollisions.vue';
import FcDataTableStudies from '@/web/components/FcDataTableStudies.vue';
import FcDialogCollisionFilters from '@/web/components/dialogs/FcDialogCollisionFilters.vue';
import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';
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
    FcSelectorSingleLocation,
  },
  data() {
    return {
      collisionSummary: {
        amount: 0,
        ksi: 0,
        validated: 0,
      },
      collisionTotal: 0,
      loadingCollisions: false,
      loadingStudies: false,
      poiSummary: {
        school: null,
      },
      showFiltersCollision: false,
      showFiltersStudy: false,
      studyRequestsPending: [],
      studySummary: [],
      studyTotal: 0,
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
    studySummaryHeaderText() {
      const n = this.studySummary.length;
      if (n === 0) {
        return 'No Studies';
      }
      const nStr = n === 1 ? '1 Study Type' : `${n} Study Types`;
      const mostRecentDate = DateTime.max(
        ...this.studySummary.map(({ mostRecent: { startDate } }) => startDate),
      );
      const mostRecentDateStr = TimeFormatters.formatDefault(mostRecentDate);
      return `${nStr} (${mostRecentDateStr})`;
    },
    hasPoisNearby() {
      const { hospital, school } = this.poiSummary;
      return hospital !== null || school !== null;
    },
    ...mapState('viewData', ['filtersCollision', 'filtersStudy']),
    ...mapState(['auth', 'legendOptions', 'locations']),
    ...mapGetters('viewData', [
      'filterChipsCollision',
      'filterChipsStudy',
      'filterParamsCollision',
      'filterParamsStudy',
    ]),
    ...mapGetters([
      'locationFeatureType',
      'locationsDescription',
      'locationsEmpty',
      'locationsRouteParams',
    ]),
  },
  watch: {
    async filterParamsCollision() {
      this.loadingCollisions = true;
      const collisionSummary = await getCollisionsByCentrelineSummary(
        this.locations,
        this.filterParamsCollision,
      );
      this.collisionSummary = collisionSummary;
      this.loadingCollisions = false;
    },
    async filterParamsStudy() {
      this.loadingStudies = true;
      const studySummary = await getStudiesByCentrelineSummary(
        this.locations,
        this.filterParamsStudy,
      );
      this.studySummary = studySummary;
      this.loadingStudies = false;
    },
    locationsSelection() {
      if (this.locationsEmpty) {
        /*
         * Normally `this.loading = true` is paired with `this.loading = false` after some
         * asynchronous operation.  In this case, however, we're using it to hide the View Data
         * drawer contents to prevent errors after clearing `FcSelectorSingleLocation`.  This is OK,
         * as the next line jumps to View Map which destroys this drawer component anyways.
         */
        this.loading = true;
        this.$router.push({
          name: 'viewData',
        });
        return;
      }

      const params = this.locationsRouteParams;
      const { s1, selectionTypeName } = this.$route.params;
      /*
       * Guard against duplicate navigation, which can happen when first loading the page.
       */
      if (s1 !== params.s1 || selectionTypeName !== params.selectionTypeName) {
        /*
          * Update the URL to match the new location.  This allows the user to navigate between
          * recently selected locations with the back / forward browser buttons.
          */
        this.$router.push({
          name: 'viewDataAtLocation',
          params,
        });
      }
    },
  },
  methods: {
    actionRequestStudy() {
      this.$router.push({ name: 'requestStudyNew' });
    },
    actionShowReportsCollision() {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewCollisionReportsAtLocation',
        params,
      });
    },
    actionShowReportsStudy({ category: { studyType } }) {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewStudyReportsAtLocation',
        params: {
          ...params,
          studyTypeName: studyType.name,
        },
      });
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });

      const tasks = [
        getCollisionsByCentrelineSummary(this.locations, this.filterParamsCollision),
        getCollisionsByCentrelineTotal(this.locations),
        getPoiByCentrelineSummary(this.locations[0]),
        getStudiesByCentrelineSummary(this.locations, this.filterParamsStudy),
        getStudiesByCentrelineTotal(this.locations),
      ];
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
        tasks.push(getStudyRequestsByCentrelinePending(this.locations));
      }
      const [
        collisionSummary,
        collisionTotal,
        poiSummary,
        studySummary,
        studyTotal,
        studyRequestsPending = [],
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.collisionTotal = collisionTotal;
      this.poiSummary = poiSummary;
      this.studyRequestsPending = studyRequestsPending;
      this.studySummary = studySummary;
      this.studyTotal = studyTotal;
    },
    ...mapMutations('viewData', [
      'removeFilterCollision',
      'removeFilterStudy',
      'setFiltersCollision',
      'setFiltersStudy',
    ]),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-data {
  max-height: 100vh;
}
</style>
