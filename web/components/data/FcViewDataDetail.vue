<template>
  <div class="fc-view-data-detail">
    <v-progress-linear
      v-if="loading || location === null"
      indeterminate />
    <template v-else>
      <section>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import {
  getCollisionsByCentrelineSummary,
  getCollisionsByCentrelineTotal,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineTotal,
  getStudyRequestsByCentrelinePending,
} from '@/lib/api/WebApi';
import FcDataTableCollisions from '@/web/components/FcDataTableCollisions.vue';
import FcDataTableStudies from '@/web/components/FcDataTableStudies.vue';
import FcDialogCollisionFilters from '@/web/components/dialogs/FcDialogCollisionFilters.vue';
import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcViewDataDetail',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcButton,
    FcDataTableCollisions,
    FcDataTableStudies,
    FcDialogCollisionFilters,
    FcDialogStudyFilters,
  },
  props: {
    location: Object,
  },
  data() {
    return {
      collisionSummary: {
        amount: 0,
        ksi: 0,
        validated: 0,
      },
      collisionTotal: 0,
      loading: false,
      loadingCollisions: false,
      loadingStudies: false,
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
    ...mapGetters('viewData', [
      'filterChipsCollision',
      'filterChipsStudy',
      'filterParamsCollision',
      'filterParamsStudy',
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
    location() {
      this.syncLocation();
    },
  },
  created() {
    this.syncLocation();
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
    async syncLocation() {
      this.loading = true;

      const locations = [this.location];

      const tasks = [
        getCollisionsByCentrelineSummary(locations, this.filterParamsCollision),
        getCollisionsByCentrelineTotal(locations),
        getStudiesByCentrelineSummary(locations, this.filterParamsStudy),
        getStudiesByCentrelineTotal(locations),
      ];
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
        tasks.push(getStudyRequestsByCentrelinePending(locations));
      }
      const [
        collisionSummary,
        collisionTotal,
        studySummary,
        studyTotal,
        studyRequestsPending = [],
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.collisionTotal = collisionTotal;
      this.studyRequestsPending = studyRequestsPending;
      this.studySummary = studySummary;
      this.studyTotal = studyTotal;

      this.loading = false;
    },
  },
};
</script>
