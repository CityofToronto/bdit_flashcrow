<template>
  <div class="fc-drawer-view-study-reports d-flex flex-column">
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
          <h1 class="headline ml-4">{{studyType.label}}</h1>
          <div
            class="ml-1 font-weight-regular headline secondary--text">
            <span>&#x2022; {{location.description}}</span>
            <span v-if="filterChipsStudyNoStudyTypes.length > 0"> &#x2022;</span>
          </div>
          <div
            v-if="filterChipsStudyNoStudyTypes.length > 0">
            <v-chip
              v-for="(filterChip, i) in filterChipsStudyNoStudyTypes"
              :key="i"
              class="ml-2 my-1"
              filter
              :input-value="true">
              {{filterChip.label}}
            </v-chip>
          </div>
          <v-spacer></v-spacer>
          <v-menu>
            <template v-slot:activator="{ on, attrs }">
              <FcButton
                v-bind="attrs"
                v-on="on"
                class="flex-grow-0 mt-0"
                type="secondary">
                <v-icon color="primary" left>mdi-history</v-icon>
                {{labelActiveCount}}
                <v-icon>mdi-menu-down</v-icon>
              </FcButton>
            </template>
            <v-list>
              <v-list-item
                v-for="{ text, value } in itemsCounts"
                :key="value"
                @click="indexActiveCount = value">
                <v-list-item-title>
                  {{text}}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
            <FcDialogReportParameters
              v-if="showReportParameters"
              v-model="showReportParameters"
              :report-parameters="reportParameters"
              :report-type="activeReportType"
              @set-report-parameters="setReportParameters">
            </FcDialogReportParameters>
            <FcButton
              v-if="activeReportType.name === 'WARRANT_TRAFFIC_SIGNAL_CONTROL'"
              type="secondary"
              @click.stop="showReportParameters = true">
              <v-icon color="primary" left>mdi-settings</v-icon>
              Set Parameters
            </FcButton>
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

import {
  ReportFormat,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import {
  getCountsByCentreline,
  getLocationByFeature,
  getReport,
  getReportWeb,
} from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcDialogReportParameters from '@/web/components/dialogs/FcDialogReportParameters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcReport from '@/web/components/reports/FcReport.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

export default {
  name: 'FcDrawerViewStudyReports',
  mixins: [FcMixinRouteAsync],
  components: {
    FcButton,
    FcDialogConfirm,
    FcDialogReportParameters,
    FcReport,
  },
  data() {
    const reportUserParameters = {};
    ReportType.enumValues.forEach(({ name, options = {} }) => {
      const defaultParameters = {};
      Object.entries(options).forEach(([parameterName, reportParameter]) => {
        const defaultParameterValue = reportParameter.defaultValue(this.$store);
        defaultParameters[parameterName] = defaultParameterValue;
      });
      reportUserParameters[name] = defaultParameters;
    });
    return {
      counts: [],
      indexActiveCount: 0,
      indexActiveReportType: 0,
      leaveConfirmed: false,
      loadingDownload: false,
      loadingReportLayout: false,
      nextRoute: null,
      reportLayout: null,
      reportUserParameters,
      showConfirmLeave: false,
      showReportParameters: false,
    };
  },
  computed: {
    activeCount() {
      const { indexActiveCount, counts } = this;
      if (indexActiveCount >= counts.length) {
        return null;
      }
      return counts[indexActiveCount];
    },
    activeReportType() {
      const { indexActiveReportType, reportTypes } = this;
      if (indexActiveReportType >= reportTypes.length) {
        return null;
      }
      return reportTypes[indexActiveReportType];
    },
    filterChipsStudyNoStudyTypes() {
      return this.filterChipsStudy
        .filter(({ filter }) => filter !== 'studyTypes');
    },
    filterParamsStudyPaginated() {
      const { filterParamsStudy } = this;
      const params = {
        ...filterParamsStudy,
        limit: 10,
        offset: 0,
      };
      delete params.studyType;
      return params;
    },
    itemsCounts() {
      return this.counts.map((count, i) => {
        const date = TimeFormatters.formatDefault(count.date);
        const dayOfWeek = TimeFormatters.formatDayOfWeek(count.date);
        const text = `${date} (${dayOfWeek})`;
        return { text, value: i };
      });
    },
    itemsDownloadFormats() {
      if (this.downloadLoading || this.loadingReportLayout) {
        return [];
      }
      return DOWNLOAD_FORMATS_SUPPORTED
        .filter(reportFormat => this.activeReportType.formats.includes(reportFormat))
        .map(({ name }) => ({ label: name, value: name }));
    },
    labelActiveCount() {
      const { activeCount } = this;
      if (activeCount === null) {
        return null;
      }
      const date = TimeFormatters.formatDefault(activeCount.date);
      const dayOfWeek = TimeFormatters.formatDayOfWeek(activeCount.date);
      return `${date} (${dayOfWeek})`;
    },
    reportParameters: {
      get() {
        const { activeReportType, reportUserParameters } = this;
        if (activeReportType === null) {
          return {};
        }
        const { name: type } = activeReportType;
        return reportUserParameters[type];
      },
      set(reportParameters) {
        const { activeReportType, reportUserParameters } = this;
        if (activeReportType === null) {
          return;
        }
        const { name: type } = activeReportType;
        reportUserParameters[type] = reportParameters;
      },
    },
    reportTypes() {
      return this.studyType.reportTypes;
    },
    studyType() {
      const { studyTypeName } = this.$route.params;
      return StudyType.enumValueOf(studyTypeName);
    },
    ...mapState(['location']),
    ...mapGetters('viewData', ['filterChipsStudy', 'filterParamsStudy']),
  },
  watch: {
    activeCount() {
      this.updateReportLayout();
    },
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
      const { activeCount, activeReportType, reportParameters } = this;
      if (activeCount === null || activeReportType === null) {
        return;
      }
      this.downloadLoading = true;

      const countInfoId = activeCount.id;
      const categoryId = activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
      const reportData = await getReport(activeReportType, id, format, reportParameters);
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
      const { centrelineId, centrelineType, studyTypeName } = to.params;
      const studyType = StudyType.enumValueOf(studyTypeName);
      const tasks = [
        getCountsByCentreline(
          { centrelineId, centrelineType },
          studyType,
          this.filterParamsStudyPaginated,
        ),
        getLocationByFeature({ centrelineId, centrelineType }),
      ];
      const [counts, location] = await Promise.all(tasks);
      this.counts = counts;

      if (this.location === null
          || location.centrelineId !== this.location.centrelineId
          || location.centrelineType !== this.location.centrelineType
          || location.description !== this.location.description) {
        this.setLocation(location);
      }
    },
    setReportParameters(reportParameters) {
      this.reportParameters = reportParameters;
      this.updateReportLayout();
    },
    async updateReportLayout() {
      const { activeCount, activeReportType, reportParameters } = this;
      if (activeCount === null || activeReportType === null) {
        return;
      }
      this.loadingReportLayout = true;

      const countInfoId = activeCount.id;
      const categoryId = activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
      const reportLayout = await getReportWeb(activeReportType, id, reportParameters);
      this.reportLayout = reportLayout;

      this.loadingReportLayout = false;
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-study-reports {
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

.drawer-open .fc-drawer-view-study-reports {
  max-height: 100vh;
}
</style>
