<template>
  <div class="fc-view-data-aggregate">
    <FcProgressLinear
      v-if="loading || locations.length === 0"
      aria-label="Loading Aggregate View for View Data" />
    <template v-else>
      <section class="d-flex flex-column">
        <FcHeaderCollisions :collision-total="collisionTotal"/>

        <FcAggregateCollisions
          :collision-summary="collisionSummary"
          :collision-summary-unfiltered="collisionSummaryUnfiltered"
          :collision-summary-per-location="collisionSummaryPerLocation"
          :collision-summary-per-location-unfiltered="collisionSummaryPerLocationUnfiltered"
          :loading="loadingCollisions"
          :locations="locations"
          :locations-selection="locationsSelection"
          @show-collisions="actionShowReportsCollision" >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <FcButton
                v-on="on"
                width="50px"
                height="40px"
                class="fc-view-collision-report"
                :disabled="collisionSummary.amount === 0"
                type="secondary"
                @click="actionShowReportsCollision">
                <v-icon color="primary" x-large>mdi-chevron-right</v-icon>
                <span class="sr-only">View Collision Report</span>
              </FcButton>
              </template>
              <span>View Report</span>
            </v-tooltip>
            <template v-slot:second v-if="collisionSummary.amount > 0">
              <div class=" d-flex flex-column align-end mr-1 mb-4">
                <FcMenuDownloadReportFormat
                  :require-auth="true"
                  type="secondary"
                  text-screen-reader="Collision Reports"
                  @download-report-format="actionDownloadReportFormatCollisions" />
                </div>
            </template>
        </FcAggregateCollisions>

      </section>

      <v-divider></v-divider>

      <section>
        <FcHeaderStudies :study-total="studyTotal" />
        <FcAggregateStudies
          :study-summary="studySummary"
          :study-summary-unfiltered="studySummaryUnfiltered"
          :study-summary-per-location="studySummaryPerLocation"
          :study-summary-per-location-unfiltered="studySummaryPerLocationUnfiltered"
          :loading="loadingStudies"
          :locations="locations"
          :locations-selection="locationsSelection"
          @show-reports="actionShowReportsStudy"
          />

          <div class="fc-study-buttons d-flex justify-end align-end mr-3 mb-3 mt-1">

            <FcButton
              type="secondary"
              color="primary"
              class="mr-2 mt-1"
              @click="actionRequestStudy">
              Request&nbsp;
              <span class="sr-only">New Study</span>
              <v-icon >mdi-briefcase-plus</v-icon>
            </FcButton>

            <template v-if="studySummary.length > 0">
              <FcMenuDownloadReportFormat
                :require-auth="true"
                type="secondary"
                text-screen-reader="Study Reports"
                @download-report-format="actionDownloadReportFormatStudies" />
            </template>

          </div>
      </section>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import {
  getCollisionsByCentrelineSummary,
  getCollisionsByCentrelineSummaryPerLocation,
  getCollisionsByCentrelineTotal,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
  postJobGenerateCollisionReports,
  postJobGenerateStudyReports,
} from '@/lib/api/WebApi';
import FcAggregateCollisions from '@/web/components/data/FcAggregateCollisions.vue';
import FcAggregateStudies from '@/web/components/data/FcAggregateStudies.vue';
import FcHeaderCollisions from '@/web/components/data/FcHeaderCollisions.vue';
import FcHeaderStudies from '@/web/components/data/FcHeaderStudies.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMenuDownloadReportFormat from '@/web/components/inputs/FcMenuDownloadReportFormat.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcViewDataAggregate',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcAggregateCollisions,
    FcAggregateStudies,
    FcButton,
    FcHeaderCollisions,
    FcHeaderStudies,
    FcMenuDownloadReportFormat,
    FcProgressLinear,
  },
  props: {
    locations: Array,
    locationsSelection: Object,
  },
  data() {
    const collisionSummaryPerLocationUnfiltered = this.locations.map(() => ({
      amount: 0,
      ksi: 0,
      validated: 0,
    }));
    const collisionSummaryPerLocation = this.locations.map(() => ({
      amount: 0,
      ksi: 0,
      validated: 0,
    }));
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
      locationsSelectionForCorridorReport: null,
      collisionSummaryPerLocation,
      collisionSummaryPerLocationUnfiltered,
      collisionTotal: 0,
      loading: false,
      loadingCollisions: false,
      loadingStudies: false,
      studyRequestsBulkPending: [],
      studySummary: [],
      studySummaryUnfiltered: [],
      studySummaryPerLocation: [],
      studySummaryPerLocationUnfiltered: [],
      studyTotal: 0,
    };
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters(['locationsRouteParams']),
    ...mapGetters('viewData', [
      'filterParamsCollision',
      'filterParamsStudy',
    ]),
  },
  watch: {
    async filterParamsCollision() {
      if (this.locations.length === 0) {
        return;
      }

      this.loadingCollisions = true;
      const tasks = [
        getCollisionsByCentrelineSummary(this.locations, this.filterParamsCollision),
        getCollisionsByCentrelineSummaryPerLocation(this.locations, this.filterParamsCollision),
      ];
      const [
        collisionSummary,
        collisionSummaryPerLocation,
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.collisionSummaryPerLocation = collisionSummaryPerLocation;
      this.loadingCollisions = false;
    },
    async filterParamsStudy() {
      if (this.locations.length === 0) {
        return;
      }

      this.loadingStudies = true;
      const tasks = [
        getStudiesByCentrelineSummary(this.locations, this.filterParamsStudy),
        getStudiesByCentrelineSummaryPerLocation(this.locations, this.filterParamsStudy),
      ];
      const [
        studySummary,
        studySummaryPerLocation,
      ] = await Promise.all(tasks);
      this.studySummary = studySummary;
      this.studySummaryPerLocation = studySummaryPerLocation;
      this.loadingStudies = false;
    },
    locations() {
      this.syncLocations();
    },
  },
  created() {
    this.syncLocations();
  },
  methods: {
    async actionDownloadReportFormatCollisions(reportFormat) {
      let job;
      if (this.locationsSelection.selectionType === LocationSelectionType.CORRIDOR) {
        this.locationsSelectionForCorridorReport = JSON.parse(
          JSON.stringify(this.locationsSelection),
        );
        this.locationsSelectionForCorridorReport.locations = this.locations;
        job = await postJobGenerateCollisionReports(
          this.auth.csrf,
          this.locationsSelectionForCorridorReport,
          this.filterParamsCollision,
          reportFormat,
        );
      } else {
        job = await postJobGenerateCollisionReports(
          this.auth.csrf,
          this.locationsSelection,
          this.filterParamsCollision,
          reportFormat,
        );
      }

      this.setToast({
        toast: 'Job',
        toastData: { job },
      });
    },
    async actionDownloadReportFormatStudies(reportFormat) {
      const job = await postJobGenerateStudyReports(
        this.auth.csrf,
        this.locationsSelection,
        this.filterParamsStudy,
        reportFormat,
      );

      this.setToast({
        toast: 'Job',
        toastData: { job },
      });
    },
    actionRequestStudy() {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'requestStudyNew',
        params,
      });
    },
    actionShowReportsCollision() {
      const params = {
        ...this.locationsRouteParams,
      };

      this.$router.push({
        name: 'viewCollisionReportsAtLocation',
        params,
      });
    },
    actionShowReportsStudy({
      item: { studyType },
      locationsIndex,
    }) {
      this.setLocationsIndex(locationsIndex);

      const params = {
        ...this.locationsRouteParams,
        studyTypeName: studyType.name,
      };
      this.$router.push({
        name: 'viewStudyReportsAtLocation',
        params,
      });
    },
    async syncLocations() {
      if (this.locations.length === 0) {
        return;
      }

      this.loading = true;

      const tasks = [
        getCollisionsByCentrelineSummary(this.locations, this.filterParamsCollision),
        getCollisionsByCentrelineSummary(this.locations, {}),
        getCollisionsByCentrelineSummaryPerLocation(this.locations, this.filterParamsCollision),
        getCollisionsByCentrelineSummaryPerLocation(this.locations, {}),
        getCollisionsByCentrelineTotal(this.locations),
        getStudiesByCentrelineSummary(this.locations, this.filterParamsStudy),
        getStudiesByCentrelineSummary(this.locations, {}),
        getStudiesByCentrelineSummaryPerLocation(this.locations, this.filterParamsStudy),
        getStudiesByCentrelineSummaryPerLocation(this.locations, {}),
        getStudiesByCentrelineTotal(this.locations),
      ];
      const [
        collisionSummary,
        collisionSummaryUnfiltered,
        collisionSummaryPerLocation,
        collisionSummaryPerLocationUnfiltered,
        collisionTotal,
        studySummary,
        studySummaryUnfiltered,
        studySummaryPerLocation,
        studySummaryPerLocationUnfiltered,
        studyTotal,
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.collisionSummaryUnfiltered = collisionSummaryUnfiltered;
      this.collisionSummaryPerLocation = collisionSummaryPerLocation;
      this.collisionSummaryPerLocationUnfiltered = collisionSummaryPerLocationUnfiltered;
      this.collisionTotal = collisionTotal;
      this.studySummary = studySummary;
      this.studySummaryUnfiltered = studySummaryUnfiltered;
      this.studySummaryPerLocation = studySummaryPerLocation;
      this.studySummaryPerLocationUnfiltered = studySummaryPerLocationUnfiltered;
      this.studyTotal = studyTotal;

      this.loading = false;
    },
    ...mapMutations([
      'setLocationsIndex',
      'setToast',
      'setToastInfo',
    ]),
  },
};
</script>

<style lang="scss">
.fc-view-collision-report {
  align-self: center;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>
