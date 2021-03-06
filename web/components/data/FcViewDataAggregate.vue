<template>
  <div class="fc-view-data-aggregate">
    <FcProgressLinear
      v-if="loading || locations.length === 0"
      aria-label="Loading Aggregate View for View Data" />
    <template v-else>
      <section>
        <FcHeaderCollisions
          :collision-total="collisionTotal"
          :disabled="reportExportMode === ReportExportMode.STUDIES">
          <template v-slot:action>
            <FcButton
              class="ml-2"
              :disabled="
                collisionSummary.amount === 0
                || reportExportMode === ReportExportMode.STUDIES"
              :scope="[]"
              type="secondary"
              @click="actionToggleReportExportMode(ReportExportMode.COLLISIONS)">
              <template v-if="reportExportMode === ReportExportMode.COLLISIONS">
                <v-icon color="primary" left>mdi-file-cancel-outline</v-icon>
                <span>Cancel Export <span class="sr-only">of Collision Reports</span></span>
              </template>
              <template v-else>
                <v-icon color="primary" left>mdi-file-export</v-icon>
                <span>Export <span class="sr-only">Collision</span> Reports</span>
              </template>
            </FcButton>
            <FcButton
              v-if="reportExportMode !== ReportExportMode.COLLISIONS"
              class="ml-2"
              :disabled="
                collisionSummary.amount === 0
                || reportExportMode === ReportExportMode.STUDIES"
              type="secondary"
              @click="actionShowReportsCollision">
              <v-icon color="primary" left>mdi-file-eye</v-icon>
              <span>View <span class="sr-only">Collision</span> Report</span>
            </FcButton>
            <FcMenuDownloadReportFormat
              v-else
              :require-auth="true"
              text-screen-reader="Collision Reports"
              @download-report-format="actionDownloadReportFormatCollisions" />
          </template>
        </FcHeaderCollisions>

        <FcAggregateCollisions
          :collision-summary="collisionSummary"
          :collision-summary-unfiltered="collisionSummaryUnfiltered"
          :collision-summary-per-location="collisionSummaryPerLocation"
          :collision-summary-per-location-unfiltered="collisionSummaryPerLocationUnfiltered"
          :loading="loadingCollisions"
          :locations="locations"
          :locations-selection="locationsSelection" />
      </section>

      <v-divider></v-divider>

      <section>
        <FcHeaderStudies
          :disabled="reportExportMode === ReportExportMode.COLLISIONS"
          :study-total="studyTotal">
          <template v-slot:action>
            <FcButton
              class="ml-2"
              :disabled="
                studySummary.length === 0
                || reportExportMode === ReportExportMode.COLLISIONS"
              :scope="[]"
              type="secondary"
              @click="actionToggleReportExportMode(ReportExportMode.STUDIES)">
              <template v-if="reportExportMode === ReportExportMode.STUDIES">
                <v-icon color="primary" left>mdi-file-cancel-outline</v-icon>
                <span>Cancel Export <span class="sr-only">of Study Reports</span></span>
              </template>
              <template v-else>
                <v-icon color="primary" left>mdi-file-export</v-icon>
                <span>Export <span class="sr-only">Study</span> Reports</span>
              </template>
            </FcButton>
            <FcButton
              v-if="reportExportMode !== ReportExportMode.STUDIES"
              class="ml-2"
              :disabled="reportExportMode === ReportExportMode.COLLISIONS"
              type="secondary"
              @click="actionRequestStudy">
              <v-icon color="primary" left>mdi-plus-box</v-icon>
              Request New <span class="sr-only">Studies</span>
            </FcButton>
            <FcMenuDownloadReportFormat
              v-else
              :require-auth="true"
              text-screen-reader="Study Reports"
              @download-report-format="actionDownloadReportFormatStudies" />
          </template>
        </FcHeaderStudies>

        <FcAggregateStudies
          :study-summary="studySummary"
          :study-summary-unfiltered="studySummaryUnfiltered"
          :study-summary-per-location="studySummaryPerLocation"
          :study-summary-per-location-unfiltered="studySummaryPerLocationUnfiltered"
          :loading="loadingStudies"
          :locations="locations"
          :locations-selection="locationsSelection"
          @show-reports="actionShowReportsStudy" />

        <v-divider></v-divider>

        <FcSectionStudyRequestsBulkPending
          :study-requests-bulk-pending="studyRequestsBulkPending" />
      </section>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import { AuthScope, ReportExportMode } from '@/lib/Constants';
import {
  getCollisionsByCentrelineSummary,
  getCollisionsByCentrelineSummaryPerLocation,
  getCollisionsByCentrelineTotal,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
  getStudyRequestsBulkByLocationsSelectionPending,
  postJobGenerateCollisionReports,
  postJobGenerateStudyReports,
} from '@/lib/api/WebApi';
import FcAggregateCollisions from '@/web/components/data/FcAggregateCollisions.vue';
import FcAggregateStudies from '@/web/components/data/FcAggregateStudies.vue';
import FcHeaderCollisions from '@/web/components/data/FcHeaderCollisions.vue';
import FcHeaderStudies from '@/web/components/data/FcHeaderStudies.vue';
import FcSectionStudyRequestsBulkPending
  from '@/web/components/data/FcSectionStudyRequestsBulkPending.vue';
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
    FcSectionStudyRequestsBulkPending,
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
      collisionSummaryPerLocation,
      collisionSummaryPerLocationUnfiltered,
      collisionTotal: 0,
      reportExportMode: null,
      ReportExportMode,
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
      const job = await postJobGenerateCollisionReports(
        this.auth.csrf,
        this.locationsSelection,
        this.filterParamsCollision,
        reportFormat,
      );

      this.setToast({
        toast: 'Job',
        toastData: { job },
      });

      this.reportExportMode = null;
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

      this.reportExportMode = null;
    },
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
    actionShowReportsStudy({
      item: { category: { studyType } },
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
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
        tasks.push(getStudyRequestsBulkByLocationsSelectionPending(this.locationsSelection));
      }
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
        studyRequestsBulkPending = [],
      ] = await Promise.all(tasks);
      this.collisionSummary = collisionSummary;
      this.collisionSummaryUnfiltered = collisionSummaryUnfiltered;
      this.collisionSummaryPerLocation = collisionSummaryPerLocation;
      this.collisionSummaryPerLocationUnfiltered = collisionSummaryPerLocationUnfiltered;
      this.collisionTotal = collisionTotal;
      this.studyRequestsBulkPending = studyRequestsBulkPending;
      this.studySummary = studySummary;
      this.studySummaryUnfiltered = studySummaryUnfiltered;
      this.studySummaryPerLocation = studySummaryPerLocation;
      this.studySummaryPerLocationUnfiltered = studySummaryPerLocationUnfiltered;
      this.studyTotal = studyTotal;

      this.loading = false;
    },
    actionToggleReportExportMode(reportExportMode) {
      if (this.reportExportMode === reportExportMode) {
        this.reportExportMode = null;
        this.setToastInfo('You\'re no longer in Export Report Mode.');
      } else {
        this.reportExportMode = reportExportMode;
        this.setToastInfo('You\'re currently in Export Report Mode.');
      }
    },
    ...mapMutations([
      'setLocationsIndex',
      'setToast',
      'setToastInfo',
    ]),
  },
};
</script>
