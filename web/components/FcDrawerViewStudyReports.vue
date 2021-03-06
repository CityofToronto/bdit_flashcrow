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
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading study reports viewer" />
    <template v-else>
      <div>
        <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
          <FcButton
            type="secondary"
            @click="actionNavigateBack">
            <v-icon left>mdi-chevron-left</v-icon>
            View Data
          </FcButton>
          <h2 class="ml-4">
            <span class="headline">{{studyType.label}}</span>
            <span class="font-weight-regular headline secondary--text">
              &#x2022; {{locationActive.description}}
            </span>
          </h2>
          <template v-if="filterChipsStudyNoStudyTypes.length > 0">
            <span class="ml-1 font-weight-regular headline secondary--text">&#x2022;</span>
            <FcListFilterChips
              class="ml-2 my-1"
              :filter-chips="filterChipsStudyNoStudyTypes"
              :readonly="true" />
          </template>

          <v-spacer></v-spacer>

          <v-menu
            v-if="locationMode !== LocationMode.SINGLE"
            :max-height="320">
            <template v-slot:activator="{ on, attrs }">
              <FcButton
                v-bind="attrs"
                v-on="on"
                class="flex-grow-0 mt-0 mr-2"
                type="secondary">
                <FcIconLocationMulti v-bind="locationsIconProps[locationsIndex]" />
                <span class="pl-2 text-truncate">{{locationActive.description}}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </FcButton>
            </template>
            <FcListLocationMulti
              :disabled="disabledPerLocation"
              icon-classes="mr-2"
              :locations="locations"
              :locations-selection="locationsSelection"
              @click-location="setLocationsIndex" />
          </v-menu>
          <v-menu
            v-if="studies.length > 0"
            :max-height="320">
            <template v-slot:activator="{ on, attrs }">
              <FcButton
                v-bind="attrs"
                v-on="on"
                class="flex-grow-0 mt-0"
                type="secondary">
                <v-icon color="primary" left>mdi-history</v-icon>
                {{labelActiveStudy}}
                <v-icon right>mdi-menu-down</v-icon>
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

        <div class="align-center d-flex">
          <nav>
            <v-tabs v-model="indexActiveReportType">
              <v-tab
                v-for="reportType in reportTypes"
                :key="reportType.name"
                :disabled="studies.length === 0">
                {{reportType.label}}
              </v-tab>
            </v-tabs>
          </nav>

          <v-spacer></v-spacer>

          <FcButton
            v-if="hasReportParameters && !showReportParameters"
            type="secondary"
            @click.stop="showReportParameters = true">
            <v-icon color="primary" left>mdi-cog</v-icon>
            Edit Parameters
          </FcButton>
          <div class="mr-3">
            <FcMenuDownloadReportFormat
              :loading="loadingDownload"
              :report-type="activeReportType"
              text-screen-reader="Study Report"
              type="secondary"
              @download-report-format="actionDownload" />
          </div>
        </div>
        <v-divider></v-divider>
      </div>

      <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pt-2">
        <FcReportParameters
          v-if="showReportParameters"
          :report-parameters="reportParameters"
          :report-type="activeReportType"
          @set-report-parameters="setReportParameters" />
        <div
          v-else-if="loadingReportLayout"
          class="ma-3 text-center">
          <FcProgressCircular
            aria-label="Loading selected report"
            class="ma-3" />
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
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  LocationMode,
  LocationSelectionType,
  ReportFormat,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import {
  getReportDownload,
  getReportWeb,
  getStudiesByCentreline,
  getStudiesByCentrelineSummaryPerLocation,
} from '@/lib/api/WebApi';
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import CompositeId from '@/lib/io/CompositeId';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMenuDownloadReportFormat from '@/web/components/inputs/FcMenuDownloadReportFormat.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import FcListLocationMulti from '@/web/components/location/FcListLocationMulti.vue';
import FcReport from '@/web/components/reports/FcReport.vue';
import FcReportParameters from '@/web/components/reports/FcReportParameters.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewStudyReports',
  mixins: [FcMixinRouteAsync],
  components: {
    FcButton,
    FcDialogConfirm,
    FcIconLocationMulti,
    FcListFilterChips,
    FcListLocationMulti,
    FcMenuDownloadReportFormat,
    FcProgressCircular,
    FcProgressLinear,
    FcReport,
    FcReportParameters,
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
      LocationMode,
      nextRoute: null,
      reportLayout: null,
      reportUserParameters,
      showConfirmLeave: false,
      showReportParameters: false,
      studies: [],
      studySummaryPerLocation: [],
    };
  },
  computed: {
    activeReportId() {
      if (this.activeStudy === null) {
        return null;
      }
      const { countGroupId, type } = this.activeStudy;
      return `${type.id}/${countGroupId}`;
    },
    activeReportType() {
      const { indexActiveReportType, reportTypes } = this;
      if (indexActiveReportType >= reportTypes.length) {
        return null;
      }
      return reportTypes[indexActiveReportType];
    },
    activeStudy() {
      const { indexActiveStudy, studies } = this;
      if (indexActiveStudy >= studies.length) {
        return null;
      }
      return studies[indexActiveStudy];
    },
    disabledPerLocation() {
      return this.studySummaryPerLocation[0].perLocation.map(
        ({ n }) => n === 0,
      );
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
    hasReportParameters() {
      return this.activeReportType === ReportType.WARRANT_TRAFFIC_SIGNAL_CONTROL;
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
      if (this.loadingDownload || this.loadingReportLayout) {
        return [];
      }
      return ReportFormat.enumValues
        .filter(reportFormat => reportFormat.download)
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
    locationsIconProps() {
      const locationsIconProps = getLocationsIconProps(
        this.locations,
        this.locationsSelection.locations,
      );
      locationsIconProps[this.locationsIndex].selected = true;
      return locationsIconProps;
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
    ...mapState([
      'locationMode',
      'locations',
      'locationsIndex',
      'locationsSelection',
    ]),
    ...mapGetters([
      'locationActive',
      'locationsRouteParams',
    ]),
    ...mapGetters('viewData', ['filterChipsStudy', 'filterParamsStudy']),
  },
  watch: {
    activeReportId() {
      if (this.hasReportParameters) {
        this.showReportParameters = true;
      } else {
        this.showReportParameters = false;
        this.updateReportLayout();
      }
    },
    activeReportType() {
      if (this.hasReportParameters) {
        this.showReportParameters = true;
      } else {
        this.showReportParameters = false;
        this.updateReportLayout();
      }
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
      const { activeReportId, activeReportType, reportParameters } = this;
      if (activeReportId === null || activeReportType === null) {
        return;
      }
      this.loadingDownload = true;
      getReportDownload(
        activeReportType,
        activeReportId,
        format,
        reportParameters,
      );
      this.loadingDownload = false;
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

      const tasks = [
        getStudiesByCentreline(
          [this.locationActive],
          studyType,
          this.filterParamsStudyReports,
          { limit: 10, offset: 0 },
        ),
        getStudiesByCentrelineSummaryPerLocation(
          this.locations,
          this.filterParamsStudyReports,
        ),
      ];
      const [
        studies,
        studySummaryPerLocation,
      ] = await Promise.all(tasks);
      this.studies = studies;
      this.studySummaryPerLocation = studySummaryPerLocation;
    },
    setReportParameters(reportParameters) {
      this.reportParameters = reportParameters;
      this.showReportParameters = false;
      this.updateReportLayout();
    },
    async updateReportLayout() {
      const { activeReportId, activeReportType, reportParameters } = this;
      if (activeReportId === null || activeReportType === null) {
        this.reportLayout = null;
        return;
      }
      this.loadingReportLayout = true;

      const reportLayout = await getReportWeb(
        activeReportType,
        activeReportId,
        reportParameters,
      );
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
  max-height: calc(50vh - 26px);

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
  max-height: calc(var(--full-height) - 64px);
}
</style>
