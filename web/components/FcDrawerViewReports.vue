<template>
  <div class="fc-drawer-view-reports d-flex flex-column">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div>
        <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
          <FcButton
            title="Back"
            type="icon"
            @click="actionNavigateBack">
            <v-icon>mdi-chevron-left</v-icon>
          </FcButton>
          <h1 class="headline">{{studyType.label}}</h1>
          <div
            class="ml-1 font-weight-regular headline secondary--text">
            <span>&#x2022; {{location.description}}</span>
            <span v-if="filterChipsNoStudyTypes.length > 0"> &#x2022;</span>
          </div>
          <div
            v-if="filterChipsNoStudyTypes.length > 0">
            <v-chip
              v-for="(filterChip, i) in filterChipsNoStudyTypes"
              :key="i"
              class="ml-2 my-1"
              filter
              :input-value="true">
              {{filterChip.label}}
            </v-chip>
          </div>
          <v-spacer></v-spacer>
          <v-overflow-btn
            v-model="indexActiveCount"
            class="fc-select-active-count flex-grow-0 mt-0"
            dense
            hide-details
            :items="itemsCounts"
            :label="labelActiveCount">
          </v-overflow-btn>
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
  ReportBlock,
  ReportFormat,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import { reporterFetch } from '@/lib/api/BackendClient';
import {
  getCountsByCentreline,
  getLocationByFeature,
} from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDialogReportParameters from '@/web/components/dialogs/FcDialogReportParameters.vue';
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
      loadingDownload: false,
      loadingReportLayout: false,
      reportLayout: null,
      reportUserParameters,
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
    filterChipsNoStudyTypes() {
      return this.filterChips
        .filter(({ filter }) => filter !== 'studyTypes');
    },
    filterParamsPaginated() {
      const { filterParams } = this;
      const filters = {
        ...filterParams,
        limit: 10,
        offset: 0,
      };
      delete filters.studyType;
      return filters;
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
    ...mapGetters('viewData', ['filterChips', 'filterParams']),
  },
  watch: {
    activeCount() {
      this.updateReportLayout();
    },
    activeReportType() {
      this.updateReportLayout();
    },
  },
  methods: {
    async actionDownload(format) {
      const { activeCount, activeReportType, reportParameters } = this;
      if (activeCount === null || activeReportType === null) {
        return;
      }
      this.downloadLoading = true;

      const type = activeReportType;
      const countInfoId = activeCount.id;
      const categoryId = activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
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
          this.filterParamsPaginated,
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

      const { name: type } = activeReportType;
      const countInfoId = activeCount.id;
      const categoryId = activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
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

      this.loadingReportLayout = false;
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-reports {
  max-height: 50vh;

  .fc-select-active-count {
    width: 250px;
  }

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
