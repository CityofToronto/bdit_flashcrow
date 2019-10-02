<template>
  <TdsModal
    class="fc-modal-show-reports"
    :data="data"
    v-on="$listeners">
    <template v-slot:header>
      <div class="flex-container-row">
        <h2>
          <span>{{activeCount.type.label}} at </span>
          <i class="fa fa-map-marker-alt"></i>
          <span class="px-s">{{locationQuery}}</span>
        </h2>
      </div>
    </template>
    <template v-slot:content>
      <div class="flex-container-column full-height">
        <div class="fc-modal-show-reports-master-detail flex-container-row flex-fill mt-m">
          <div class="fc-modal-show-reports-master flex-1 px-m">
            <div class="fc-modal-show-reports-filters flex-container-row">
              <TdsActionDropdown
                class="font-size-l mb-m"
                :options="optionsCounts"
                @action-selected="onSelectActiveCount">
                <template v-slot:default>
                  <span>
                    {{activeCount.date | date}} ({{activeCount.date | dayOfWeek}})
                  </span>
                </template>
              </TdsActionDropdown>
              <div class="flex-fill"></div>
              <span
                class="font-size-l mb-m tds-label uppercase"
                :class="'tds-label-' + STATUS_META[activeCount.status].class">
                <i
                  class="fa"
                  :class="'fa-' + STATUS_META[activeCount.status].icon"></i>
                <span> {{STATUS_META[activeCount.status].label}}</span>
              </span>
            </div>
            <TdsPanel
              v-if="optionsReportsEnabled.length === 0"
              variant="warning">
              <p>
                The alpha launch of MOVE doesn't yet support
                {{activeCount.type.label}} reports.
              </p>
            </TdsPanel>
            <div
              v-else
              class="flex-fill flex-container-row">
              <div class="flex-cross-scroll">
                <div
                  v-for="{ label, value, disabled } in optionsReports"
                  :key="value.name"
                  class="py-m">
                  <label class="tds-radio">
                    <input
                      v-model="report"
                      type="radio"
                      :disabled="activeCount.status === Status.REQUEST_IN_PROGRESS || disabled"
                      name="report"
                      :value="value" />
                    <span>{{label}}</span>
                    <span v-if="disabled"> (coming soon)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <section class="fc-modal-show-reports-detail flex-container-column flex-3 px-m">
            <div class="flex-container-row flex-fill">
              <div class="flex-cross-scroll px-m">
                <TdsPanel
                  v-if="activeCount.status === Status.REQUEST_IN_PROGRESS"
                  variant="info">
                  <p>
                    This study is in progress.  You will be notified when data is available
                    for viewing.  You can also keep updated on its progress
                    <router-link
                      :to="{
                        name: 'requestStudyView',
                        params: { id: activeCount.studyRequestId }
                      }"
                      @click.native="clearModal">
                      here.
                    </router-link>
                  </p>
                </TdsPanel>
                <TdsPanel
                  v-else-if="optionsReportsEnabled.length === 0"
                  variant="warning">
                  <p>
                    When we release {{activeCount.type.label}} reports, you'll be able to
                    view them from here.  We're also working on download and print
                    functionality for reports.
                  </p>
                </TdsPanel>
                <TdsPanel
                  v-else-if="report === null"
                  variant="warning">
                  <p>
                    Select a report type from the list.
                  </p>
                </TdsPanel>
                <section
                  v-else
                  class="mb-xl">
                  <header class="mb-m flex-container-row">
                    <h3>{{selectedReport.label}}</h3>
                    <div class="flex-fill"></div>
                    <TdsActionDropdown
                      class="font-size-l"
                      :options="optionsDownloadFormats"
                      @action-selected="onSelectDownloadFormat">
                      <template v-slot:default>
                        <template v-if="downloadLoading">
                          <div class="download-loading-spinner">
                            <TdsLoadingSpinner />
                          </div>
                          <span> Downloading&hellip;</span>
                        </template>
                        <span v-else>
                          <i class="fa fa-download"></i>
                          <span> Download</span>
                        </span>
                      </template>
                    </TdsActionDropdown>
                  </header>
                  <div
                    v-if="activeReportData === null"
                    class="report-loading-spinner">
                    <TdsLoadingSpinner />
                  </div>
                  <component
                    v-else
                    :is="selectedReport.reportComponent"
                    :count="activeCount"
                    :report-data="activeReportData" />
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
  </TdsModal>
</template>

<script>
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';

import FcReportCountSummary24hGraphical from
  '@/components/reports/FcReportCountSummary24hGraphical.vue';
import FcReportCountSummaryTurningMovement from
  '@/components/reports/FcReportCountSummaryTurningMovement.vue';
import FcReportIntersectionWarrantSummary from
  '@/components/reports/FcReportIntersectionWarrantSummary.vue';
import FcReportSpeedPercentile from
  '@/components/reports/FcReportSpeedPercentile.vue';
import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import TdsLoadingSpinner from '@/components/tds/TdsLoadingSpinner.vue';
import TdsMixinModal from '@/components/tds/TdsMixinModal';
import TdsPanel from '@/components/tds/TdsPanel.vue';
import { reporterFetch } from '@/lib/BackendClient';
import {
  ReportFormat,
  ReportType,
  Status,
  STATUS_META,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

const OPTIONS_REPORTS_ATR_VOLUME = [
  {
    label: '24-Hour Graphical Report',
    value: ReportType.COUNT_SUMMARY_24H_GRAPHICAL,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
  },
  {
    label: '24-Hour Summary Report',
    value: ReportType.COUNT_SUMMARY_24H,
    disabled: true,
  },
  {
    label: '24-Hour Detailed Report',
    value: ReportType.COUNT_SUMMARY_24H_DETAILED,
    disabled: true,
  },
];
const OPTIONS_REPORTS = {
  ATR_VOLUME_BICYCLE: OPTIONS_REPORTS_ATR_VOLUME,
  TMC: [
    {
      label: 'TMC Summary Report',
      value: ReportType.COUNT_SUMMARY_TURNING_MOVEMENT,
      formats: [ReportFormat.CSV],
    },
    {
      label: 'Intersection Warrant Summary Report',
      value: ReportType.INTERSECTION_WARRANT_SUMMARY,
      formats: [ReportFormat.CSV],
    },
    {
      label: 'TMC Illustrated Report',
      value: ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED,
      disabled: true,
    },
  ],
  RESCU: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_VOLUME: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_SPEED_VOLUME: [
    {
      label: 'Speed Percentile Report',
      value: ReportType.SPEED_PERCENTILE,
      formats: [ReportFormat.CSV],
    },
    ...OPTIONS_REPORTS_ATR_VOLUME,
  ],
  PXO_OBSERVE: [
    {
      label: 'Crosswalk Observation Report',
      value: ReportType.CROSSWALK_OBSERVANCE_SUMMARY,
      disabled: true,
    },
  ],
  PED_DELAY: [
    {
      label: 'Ped Delay Report',
      value: ReportType.PED_DELAY_SUMMARY,
      disabled: true,
    },
  ],
};

export default {
  name: 'FcModalShowReports',
  mixins: [TdsMixinModal],
  components: {
    FcReportCountSummary24hGraphical,
    FcReportCountSummaryTurningMovement,
    FcReportIntersectionWarrantSummary,
    FcReportSpeedPercentile,
    TdsActionDropdown,
    TdsLoadingSpinner,
    TdsPanel,
  },
  data() {
    return {
      activeReportData: null,
      downloadLoading: false,
      report: null,
      Status,
      STATUS_META,
      studies: [],
    };
  },
  computed: {
    activeCount() {
      return this.counts[this.activeIndex];
    },
    activeIndex: {
      get() {
        return this.data.activeIndex;
      },
      set(activeIndex) {
        this.data.activeIndex = activeIndex;
      },
    },
    counts() {
      return this.data.counts;
    },
    optionsCounts() {
      return this.counts.map((count, i) => {
        const date = TimeFormatters.formatDefault(count.date);
        const dayOfWeek = TimeFormatters.formatDayOfWeek(count.date);
        const label = `${date} (${dayOfWeek})`;
        return { label, value: i };
      });
    },
    optionsDownloadFormats() {
      if (this.selectedReport === null || this.downloadLoading) {
        return [];
      }
      return DOWNLOAD_FORMATS_SUPPORTED.map((reportFormat) => {
        const disabled = !this.selectedReport.formats.includes(reportFormat);
        const { name } = reportFormat;
        return { label: name, value: name, disabled };
      });
    },
    optionsReports() {
      const { value } = this.activeCount.type;
      if (value === undefined) {
        return [];
      }
      return OPTIONS_REPORTS[value];
    },
    optionsReportsEnabled() {
      return this.optionsReports
        .filter(({ disabled }) => !disabled);
    },
    selectedReport() {
      if (this.report === null) {
        return null;
      }
      const { label, formats = [] } = this.optionsReports
        .find(({ value }) => this.report === value);
      const reportComponent = `FcReport${this.report.suffix}`;
      return {
        label,
        value: this.report,
        formats,
        reportComponent,
      };
    },
    ...mapState(['locationQuery']),
  },
  watch: {
    report() {
      if (this.report === null) {
        return;
      }
      this.activeReportData = null;
      const type = this.report;
      const countInfoId = this.activeCount.id;
      const categoryId = this.activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
      const options = {
        method: 'GET',
        data: { type, id, format: ReportFormat.JSON },
      };
      reporterFetch('/reports', options)
        .then(({ data: activeReportData }) => {
          this.activeReportData = activeReportData;
        });
    },
  },
  created() {
    if (this.optionsReports.length > 0) {
      const { value } = this.optionsReports[0];
      this.report = value;
    }
  },
  methods: {
    onSelectActiveCount(i) {
      this.activeIndex = i;
    },
    onSelectDownloadFormat(format) {
      if (this.report === null || this.downloadLoading) {
        return;
      }
      const type = this.report;
      const countInfoId = this.activeCount.id;
      const categoryId = this.activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
      const options = {
        method: 'GET',
        data: { type, id, format },
      };
      this.downloadLoading = true;
      reporterFetch('/reports', options)
        .then((reportData) => {
          const filename = `report.${format}`;
          saveAs(reportData, filename);
          this.downloadLoading = false;
        });
    },
  },
};
</script>

<style lang="postcss">
.fc-modal-show-reports {
  & > .tds-modal {
    height: calc(100% - var(--space-3xl));
    width: calc(100% - var(--space-3xl));
    & > header > .flex-container-row {
      align-items: center;
    }
    .report-loading-spinner {
      height: var(--space-2xl);
      width: var(--space-2xl);
    }
    .download-loading-spinner {
      display: inline-block;
      height: var(--space-l);
      width: var(--space-l);
    }
    .fc-modal-show-reports-filters {
      align-items: center;
      & > .fc-filter-reports > .dropdown {
        width: 400px;
      }
    }
    .fc-modal-show-reports-actions {
      align-items: center;
      background-color: var(--base-lighter);
      padding: var(--space-s) var(--space-l);
    }
    .fc-modal-show-reports-master-detail {
      align-items: stretch;
      & > .fc-modal-show-reports-master {
        border-right: var(--border-default);
      }
      & > .fc-modal-show-reports-detail {
        max-width: 75%;
        & > .flex-container-row > .flex-cross-scroll {
          overflow: auto;
          & > section > header {
            align-items: center;
          }
        }
      }
    }
  }
}
</style>
