<template>
  <div class="fc-view-data-detail">
    <v-progress-linear
      v-if="loading || location === null"
      indeterminate />
    <template v-else>
      <section>
        <FcHeaderCollisions :collision-total="collisionTotal" />

        <FcDetailCollisions
          :collision-summary="collisionSummary"
          :collision-summary-unfiltered="collisionSummaryUnfiltered"
          :loading="loadingCollisions"
          @show-reports="actionShowReportsCollision" />
      </section>

      <v-divider></v-divider>

      <section>
        <FcHeaderStudies :study-total="studyTotal">
          <template v-slot:action>
            <FcButton
              class="ml-3"
              type="secondary"
              @click="actionRequestStudy">
              <v-icon color="primary" left>mdi-plus-box</v-icon>
              Request New
            </FcButton>
          </template>
        </FcHeaderStudies>

        <FcDetailStudies
          :loading="loadingStudies"
          :study-summary="studySummary"
          :study-summary-unfiltered="studySummaryUnfiltered"
          @show-reports="actionShowReportsStudy" />
      </section>

      <v-divider></v-divider>

      <FcSectionStudyRequestsPending
        :study-requests-pending="studyRequestsPending" />
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
import FcDetailCollisions from '@/web/components/data/FcDetailCollisions.vue';
import FcDetailStudies from '@/web/components/data/FcDetailStudies.vue';
import FcHeaderCollisions from '@/web/components/data/FcHeaderCollisions.vue';
import FcHeaderStudies from '@/web/components/data/FcHeaderStudies.vue';
import FcSectionStudyRequestsPending
  from '@/web/components/data/FcSectionStudyRequestsPending.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcViewDataDetail',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcButton,
    FcDetailCollisions,
    FcDetailStudies,
    FcHeaderCollisions,
    FcHeaderStudies,
    FcSectionStudyRequestsPending,
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
      collisionSummaryUnfiltered: {
        amount: 0,
        ksi: 0,
        validated: 0,
      },
      collisionTotal: 0,
      loading: false,
      loadingCollisions: false,
      loadingStudies: false,
      showFiltersStudy: false,
      studyRequestsPending: [],
      studySummary: [],
      studySummaryUnfiltered: [],
      studyTotal: 0,
    };
  },
  computed: {
    ...mapGetters(['locationsRouteParams']),
    ...mapGetters('viewData', [
      'filterParamsCollision',
      'filterParamsStudy',
    ]),
  },
  watch: {
    async filterParamsCollision() {
      if (this.location === null) {
        return;
      }

      this.loadingCollisions = true;
      const locations = [this.location];
      const collisionSummary = await getCollisionsByCentrelineSummary(
        locations,
        this.filterParamsCollision,
      );
      this.collisionSummary = collisionSummary;
      this.loadingCollisions = false;
    },
    async filterParamsStudy() {
      if (this.location === null) {
        return;
      }

      this.loadingStudies = true;
      const locations = [this.location];
      const studySummary = await getStudiesByCentrelineSummary(
        locations,
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
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'requestStudyNew',
        params,
      });
    },
    actionShowReportsCollision() {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewCollisionReportsAtLocation',
        params,
      });
    },
    actionShowReportsStudy({ category: { studyType } }) {
      const params = {
        ...this.locationsRouteParams,
        studyTypeName: studyType.name,
      };
      this.$router.push({
        name: 'viewStudyReportsAtLocation',
        params,
      });
    },
    async syncLocation() {
      if (this.location === null) {
        return;
      }

      this.loading = true;
      const locations = [this.location];
      const tasks = [
        getCollisionsByCentrelineSummary(locations, {}),
        getCollisionsByCentrelineSummary(locations, this.filterParamsCollision),
        getCollisionsByCentrelineTotal(locations),
        getStudiesByCentrelineSummary(locations, {}),
        getStudiesByCentrelineSummary(locations, this.filterParamsStudy),
        getStudiesByCentrelineTotal(locations),
      ];
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
        tasks.push(getStudyRequestsByCentrelinePending(locations));
      }
      const [
        collisionSummaryUnfiltered,
        collisionSummary,
        collisionTotal,
        studySummaryUnfiltered,
        studySummary,
        studyTotal,
        studyRequestsPending = [],
      ] = await Promise.all(tasks);
      this.collisionSummaryUnfiltered = collisionSummaryUnfiltered;
      this.collisionSummary = collisionSummary;
      this.collisionTotal = collisionTotal;
      this.studyRequestsPending = studyRequestsPending;
      this.studySummaryUnfiltered = studySummaryUnfiltered;
      this.studySummary = studySummary;
      this.studyTotal = studyTotal;
      this.loading = false;
    },
  },
};
</script>
