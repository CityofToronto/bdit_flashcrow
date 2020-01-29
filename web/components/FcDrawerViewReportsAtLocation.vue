<template>
  <div class="fc-drawer-view-reports-at-location d-flex flex-column">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div>
        <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
          <v-btn
            icon
            @click="actionNavigateBack">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <h1 class="subtitle-1">Turning Movement Count</h1>
          <div class="mx-1">&#x2022;</div>
          <div>{{location.description}}</div>

          <div
            v-if="filterChips.length > 0">
            <v-chip
              v-for="(filterChip, i) in filterChips"
              :key="i"
              class="ml-2"
              close
              color="blue lighten-4"
              @click:close="removeFilter(filterChip)">
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
        <v-progress-linear
          v-if="loadingReportLayout"
          indeterminate />
        <div
          v-else
          class="fc-report-wrapper pa-3">
          <FcReport v-bind="reportLayout" />
          <v-menu>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                class="fc-report-download ma-1"
                :loading="loadingDownload">
                <v-icon left>mdi-download</v-icon> Download
              </v-btn>
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
      </section>
    </template>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import { mapGetters, mapMutations, mapState } from 'vuex';

import {
  COUNT_TYPES,
  ReportBlock,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import { reporterFetch } from '@/lib/api/BackendClient';
import {
  getCountsByCentreline,
  getLocationByFeature,
} from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcReport from '@/web/components/reports/FcReport.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

const OPTIONS_REPORTS_ATR_VOLUME = [
  ReportType.COUNT_SUMMARY_24H_GRAPHICAL,
  ReportType.COUNT_SUMMARY_24H_DETAILED,
  ReportType.COUNT_SUMMARY_24H,
];
const OPTIONS_REPORTS = {
  ATR_VOLUME_BICYCLE: OPTIONS_REPORTS_ATR_VOLUME,
  TMC: [
    ReportType.COUNT_SUMMARY_TURNING_MOVEMENT,
    ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED,
    ReportType.INTERSECTION_SUMMARY,
    ReportType.WARRANT_TRAFFIC_SIGNAL_CONTROL,
  ],
  RESCU: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_VOLUME: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_SPEED_VOLUME: [
    ReportType.SPEED_PERCENTILE,
    ...OPTIONS_REPORTS_ATR_VOLUME,
  ],
  PXO_OBSERVE: [
    ReportType.CROSSWALK_OBSERVANCE_SUMMARY,
  ],
  PED_DELAY: [
    ReportType.PED_DELAY_SUMMARY,
  ],
};

export default {
  name: 'FcDrawerViewReportsAtLocation',
  mixins: [FcMixinRouteAsync],
  components: {
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
    countType() {
      const { categoryValue } = this.$route.params;
      return COUNT_TYPES.find(({ value }) => value === categoryValue);
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
    reportParameters() {
      const { activeReportType, reportUserParameters } = this;
      if (activeReportType === null) {
        return {};
      }
      const { name: type } = activeReportType;
      return reportUserParameters[type];
    },
    reportTypes() {
      const { value } = this.countType;
      if (value === undefined) {
        return [];
      }
      return OPTIONS_REPORTS[value].filter(({ disabled }) => !disabled);
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
      const { centrelineId, centrelineType, categoryValue: studyType } = to.params;
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

<style lang="postcss">
.fc-drawer-view-reports-at-location {
  max-height: 50vh;

  .fc-select-active-count {
    width: 250px;
  }

  .fc-report-wrapper {
    position: relative;
    & > .fc-report-download {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}

.drawer-open .fc-drawer-view-reports-at-location {
  max-height: 100vh;
}
</style>
