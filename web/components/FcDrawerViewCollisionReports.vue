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
            <span>&#x2022; {{location.description}}</span>
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
        <v-progress-circular
          v-if="loadingReportLayout"
          class="ma-3"
          color="primary"
          indeterminate
          size="64" />
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
import { mapGetters, mapMutations, mapState } from 'vuex';

import { ReportFormat, ReportType } from '@/lib/Constants';
import { reporterFetch } from '@/lib/api/BackendClient';
import {
  getLocationByFeature,
} from '@/lib/api/WebApi';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcReport from '@/web/components/reports/FcReport.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

export default {
  name: 'FcDrawerViewReports',
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
        ReportType.COLLISION_TABULATION,
        ReportType.COLLISION_DIRECTORY,
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
    ...mapState(['location']),
    ...mapGetters('viewData', ['filterChipsCollision']),
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
    const { centrelineId, centrelineType } = from.params;
    const { name } = to;
    if (name === 'viewDataAtLocation') {
      const { centrelineId: nextCentrelineId, centrelineType: nextCentrelineType } = to.params;
      if (centrelineType === nextCentrelineType && centrelineId === nextCentrelineId) {
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
      const { activeReportType, reportParameters } = this;
      if (activeReportType === null) {
        return;
      }
      this.downloadLoading = true;

      const type = activeReportType;
      const { centrelineId, centrelineType } = this.$route.params;
      const id = `${centrelineType}/${centrelineId}`;
      const options = {
        method: 'GET',
        data: {
          type,
          id,
          format,
          ...reportParameters,
        },
      };

      const reportData = await reporterFetch('/reports', options);
      const filename = `report.${format}`;
      saveAs(reportData, filename);

      this.downloadLoading = false;
    },
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack() {
      const { centrelineId, centrelineType } = this.$route.params;
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      });
    },
    async loadAsyncForRoute(to) {
      const { centrelineId, centrelineType } = to.params;
      const tasks = [
        getLocationByFeature({ centrelineId, centrelineType }),
      ];
      const [location] = await Promise.all(tasks);

      if (this.location === null
          || location.centrelineId !== this.location.centrelineId
          || location.centrelineType !== this.location.centrelineType
          || location.description !== this.location.description) {
        this.setLocation(location);
      }
    },
    async updateReportLayout() {
      const { activeReportType } = this;
      if (activeReportType === null) {
        return;
      }
      this.loadingReportLayout = true;

      /*
      const { name: type } = activeReportType;
      const { centrelineId, centrelineType } = this.$route.params;
      const id = `${centrelineType}/${centrelineId}`;
      const options = {
        method: 'GET',
        data: {
          type,
          id,
          format: ReportFormat.WEB,
          ...reportParameters,
        },
      };

      const {
        type: reportTypeStr,
        date: reportDate,
        content,
      } = await reporterFetch('/reports', options);
      const reportType = ReportType.enumValueOf(reportTypeStr);
      const reportContent = content.map(({ type: blockTypeStr, options: blockOptions }) => {
        const blockType = ReportBlock.enumValueOf(blockTypeStr);
        return {
          type: blockType,
          options: blockOptions,
        };
      });
      this.reportLayout = {
        type: reportType,
        date: reportDate,
        content: reportContent,
      };
      */

      this.loadingReportLayout = false;
    },
    ...mapMutations(['setLocation']),
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

.drawer-open .fc-drawer-view-reports {
  max-height: 100vh;
}
</style>