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
            <span>&#x2022; {{locationActive.description}}</span>
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
          <v-menu v-if="studies.length > 0">
            <template v-slot:activator="{ on, attrs }">
              <FcButton
                v-bind="attrs"
                v-on="on"
                class="flex-grow-0 mt-0"
                type="secondary">
                <v-icon color="primary" left>mdi-history</v-icon>
                {{labelActiveStudy}}
                <v-icon>mdi-menu-down</v-icon>
              </FcButton>
            </template>
            <v-list>
              <v-list-item
                v-for="{ text, value } in itemsStudies"
                :key="value"
                @click="indexActiveStudy = value">
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
            :key="reportType.name"
            :disabled="studies.length === 0">
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
          v-else-if="studies.length === 0"
          class="ma-3 text-center">
          <div class="font-weight-regular headline secondary--text">
            Report not available, try a different location.
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
              <v-icon color="primary" left>mdi-cog</v-icon>
              Set Parameters
            </FcButton>
            <FcMenuDownloadReportFormat
              type="secondary"
              @download-report-format="actionDownload" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  LocationSelectionType,
  ReportFormat,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import {
  getReport,
  getReportWeb,
  getStudiesByCentreline,
} from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcDialogReportParameters from '@/web/components/dialogs/FcDialogReportParameters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMenuDownloadReportFormat from '@/web/components/inputs/FcMenuDownloadReportFormat.vue';
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
    FcMenuDownloadReportFormat,
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
      indexActiveReportType: 0,
      indexActiveStudy: 0,
      leaveConfirmed: false,
      loadingDownload: false,
      loadingReportLayout: false,
      nextRoute: null,
      reportLayout: null,
      reportUserParameters,
      showConfirmLeave: false,
      showReportParameters: false,
      studies: [],
    };
  },
  computed: {
    activeStudy() {
      const { indexActiveStudy, studies } = this;
      if (indexActiveStudy >= studies.length) {
        return null;
      }
      return studies[indexActiveStudy];
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
    filterParamsStudyReports() {
      const { filterParamsStudy, studyType } = this;
      return {
        ...filterParamsStudy,
        studyTypes: [studyType],
      };
    },
    itemsStudies() {
      return this.studies.map(({ startDate }, i) => {
        const date = TimeFormatters.formatDefault(startDate);
        const dayOfWeek = TimeFormatters.formatDayOfWeek(startDate);
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
    labelActiveStudy() {
      const { activeStudy } = this;
      if (activeStudy === null) {
        return null;
      }
      const date = TimeFormatters.formatDefault(activeStudy.startDate);
      const dayOfWeek = TimeFormatters.formatDayOfWeek(activeStudy.startDate);
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
    ...mapState(['locations']),
    ...mapGetters([
      'locationActive',
      'locationsRouteParams',
    ]),
    ...mapGetters('viewData', ['filterChipsStudy', 'filterParamsStudy']),
  },
  watch: {
    activeReportType() {
      this.updateReportLayout();
    },
    activeStudy() {
      this.updateReportLayout();
    },
    async locationActive() {
      const studies = await getStudiesByCentreline(
        [this.locationActive],
        this.studyType,
        this.filterParamsStudyReports,
        { limit: 10, offset: 0 },
      );

      this.indexActiveReportType = 0;
      this.indexActiveStudy = 0;
      this.studies = studies;
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
      const { activeReportType, activeStudy, reportParameters } = this;
      if (activeReportType === null || activeStudy === null) {
        return;
      }
      this.downloadLoading = true;

      const { countGroupId, type } = activeStudy;
      const id = `${type.id}/${countGroupId}`;
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
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewDataAtLocation',
        params,
      });
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName, studyTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });

      if (this.locationActive === null) {
        this.setLocationsIndex(0);
      }
      const studyType = StudyType.enumValueOf(studyTypeName);
      const studies = await getStudiesByCentreline(
        [this.locationActive],
        studyType,
        this.filterParamsStudyReports,
        { limit: 10, offset: 0 },
      );
      this.studies = studies;
    },
    setReportParameters(reportParameters) {
      this.reportParameters = reportParameters;
      this.updateReportLayout();
    },
    async updateReportLayout() {
      const { activeReportType, activeStudy, reportParameters } = this;
      if (activeReportType === null || activeStudy === null) {
        this.reportLayout = null;
        return;
      }
      this.loadingReportLayout = true;

      const { countGroupId, type } = activeStudy;
      const id = `${type.id}/${countGroupId}`;
      const reportLayout = await getReportWeb(activeReportType, id, reportParameters);
      this.reportLayout = reportLayout;

      this.loadingReportLayout = false;
    },
    ...mapMutations(['setLocationsIndex']),
    ...mapActions(['initLocations']),
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
  max-height: calc(100vh - 60px);
}
</style>
