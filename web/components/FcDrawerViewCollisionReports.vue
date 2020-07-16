<template>
  <div class="fc-drawer-view-collision-reports d-flex flex-column">
    <FcDialogConfirm
      v-model="showConfirmLeave"
      textCancel="Stay on this page"
      textOk="Leave"
      title="Leave Reports"
      @action-ok="actionLeave">
      <span class="body-1">
        Leaving this page will cause you to switch to another location.
        Are you sure you want to leave?
      </span>
    </FcDialogConfirm>
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div>
        <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
          <FcButton
            type="secondary"
            @click="actionNavigateBack">
            <v-icon left>mdi-chevron-left</v-icon>
            View Data
          </FcButton>
          <h1 class="headline ml-4">Collisions</h1>
          <div
            class="ml-1 font-weight-regular headline secondary--text">
            <span>&#x2022; {{locationsDescription}}</span>
            <span v-if="filterChipsCollision.length > 0"> &#x2022;</span>
          </div>
          <div
            v-if="filterChipsCollision.length > 0">
            <v-chip
              v-for="(filterChip, i) in filterChipsCollision"
              :key="i"
              class="ml-2 my-1"
              filter
              :input-value="true">
              {{filterChip.label}}
            </v-chip>
          </div>
        </div>

        <v-tabs v-model="indexActiveReportType">
          <v-tab
            v-for="reportType in reportTypes"
            :key="reportType.name">
            {{reportType.label}}
          </v-tab>
        </v-tabs>
        <v-divider></v-divider>
      </div>

      <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pt-2">
        <div
          v-if="loadingReportLayout"
          class="ma-3 text-center">
          <v-progress-circular
            v-if="loadingReportLayout"
            class="ma-3"
            color="primary"
            indeterminate
            size="80" />
          <div class="font-weight-regular headline secondary--text">
            This page is loading, please wait.
          </div>
        </div>
        <div
          v-else
          class="fc-report-wrapper pa-3">
          <FcReport v-bind="reportLayout" />
          <div class="fc-report-actions pa-3">
            <v-menu>
              <template v-slot:activator="{ on, attrs }">
                <FcButton
                  v-bind="attrs"
                  v-on="on"
                  class="ml-2"
                  type="secondary"
                  :loading="loadingDownload">
                  <v-icon color="primary" left>mdi-cloud-download</v-icon> Download
                </FcButton>
              </template>
              <v-list>
                <v-list-item
                  v-for="{ label, value } in itemsDownloadFormats"
                  :key="value"
                  @click="actionDownload(value)">
                  <v-list-item-title>
                    {{label}}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import { mapActions, mapGetters, mapState } from 'vuex';

import { LocationSelectionType, ReportFormat, ReportType } from '@/lib/Constants';
import { getReport, getReportWeb } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcReport from '@/web/components/reports/FcReport.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

export default {
  name: 'FcDrawerViewCollisionReports',
  mixins: [FcMixinRouteAsync],
  components: {
    FcButton,
    FcDialogConfirm,
    FcReport,
  },
  data() {
    return {
      indexActiveReportType: 0,
      leaveConfirmed: false,
      loadingDownload: false,
      loadingReportLayout: false,
      nextRoute: null,
      reportLayout: null,
      reportTypes: [
        ReportType.COLLISION_DIRECTORY,
        ReportType.COLLISION_TABULATION,
      ],
      showConfirmLeave: false,
    };
  },
  computed: {
    activeReportType() {
      const { indexActiveReportType, reportTypes } = this;
      if (indexActiveReportType >= reportTypes.length) {
        return null;
      }
      return reportTypes[indexActiveReportType];
    },
    itemsDownloadFormats() {
      if (this.downloadLoading || this.loadingReportLayout) {
        return [];
      }
      return DOWNLOAD_FORMATS_SUPPORTED
        .filter(reportFormat => this.activeReportType.formats.includes(reportFormat))
        .map(({ name }) => ({ label: name, value: name }));
    },
    reportParameters() {
      // TODO: we'll probably have to figure this one out...
      return {};
    },
    ...mapState(['locations']),
    ...mapGetters(['locationsDescription', 'locationsRouteParams']),
    ...mapGetters('viewData', ['filterChipsCollision', 'filterParamsCollision']),
  },
  watch: {
    activeReportType() {
      this.updateReportLayout();
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.leaveConfirmed) {
      /*
       * The user clicked Leave on the confirmation dialog, and it is safe to leave.
       */
      next();
      return;
    }
    if (to.name === 'viewDataAtLocation') {
      const { s1, selectionTypeName } = from.params;
      const { s1: s1Next, selectionTypeName: selectionTypeNameNext } = to.params;
      if (s1 === s1Next && selectionTypeName === selectionTypeNameNext) {
        next();
        return;
      }
    }
    this.nextRoute = to;
    this.showConfirmLeave = true;
    next(false);
  },
  methods: {
    async actionDownload(format) {
      if (this.activeReportType === null) {
        return;
      }
      this.downloadLoading = true;

      const id = CompositeId.encode(this.locations);
      const reportData = await getReport(
        this.activeReportType,
        id,
        format,
        this.filterParamsCollision,
      );
      const filename = `report.${format}`;
      saveAs(reportData, filename);

      this.downloadLoading = false;
    },
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack() {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewDataAtLocation',
        params,
      });
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });
      this.updateReportLayout();
    },
    async updateReportLayout() {
      if (this.activeReportType === null) {
        return;
      }
      this.loadingReportLayout = true;

      const id = CompositeId.encode(this.locations);
      const reportLayout = await getReportWeb(
        this.activeReportType,
        id,
        this.filterParamsCollision,
      );
      this.reportLayout = reportLayout;

      this.loadingReportLayout = false;
    },
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-collision-reports {
  max-height: 50vh;

  .fc-report-wrapper {
    position: relative;
    & > .fc-report-actions {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}

.drawer-open .fc-drawer-view-collision-reports {
  max-height: calc(100vh - 60px);
}
</style>
