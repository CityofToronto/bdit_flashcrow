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
        <header class="my-m">
          <div class="fc-modal-show-reports-filters flex-container-row">
            <TdsActionDropdown
              class="font-size-l mb-m"
              :options="optionsCounts"
              @action-selected="onSelectActiveCount">
              <template v-slot:default>
                <span>
                  {{activeCount.date | date}}
                </span>
              </template>
            </TdsActionDropdown>
            <span class="font-size-l mb-m ml-m">
              {{activeCount.date | dayOfWeek}}
            </span>
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
          <div class="fc-modal-show-reports-actions flex-container-row">
            <label class="tds-checkbox">
              <input
                type="checkbox"
                name="selectAll"
                :checked="selectionAll"
                :disabled="optionsReportsEnabled.length === 0"
                :indeterminate.prop="selectionIndeterminate"
                @change="onChangeSelectAll" />
              <span>All</span>
            </label>
            <div class="flex-fill"></div>
            <button
              class="tds-button-secondary font-size-l"
              disabled>
              <i class="fa fa-download"></i>
            </button>
            <button
              class="tds-button-secondary font-size-l ml-m"
              disabled>
              <i class="fa fa-print"></i>
            </button>
          </div>
        </header>
        <div class="fc-modal-show-reports-master-detail flex-container-row flex-fill">
          <div class="fc-modal-show-reports-master flex-1 px-m">
            <div
              v-if="optionsReportsEnabled.length === 0"
              class="tds-panel tds-panel-warning">
              <i class="fa fa-exclamation-triangle"></i>
              <p>
                The alpha launch of MOVE doesn't yet support
                {{activeCount.type.label}} reports.
              </p>
            </div>
            <div
              v-else
              class="flex-fill flex-container-row">
              <div class="flex-cross-scroll">
                <div
                  v-for="{ label, value, disabled } in optionsReports"
                  :key="value"
                  class="p-m">
                  <label class="tds-checkbox">
                    <input
                      v-model="reports"
                      type="checkbox"
                      :disabled="disabled"
                      name="reports"
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
              <div class="flex-cross-scroll">
                <div
                  v-if="optionsReportsEnabled.length === 0"
                  class="tds-panel tds-panel-warning">
                  <i class="fa fa-exclamation-triangle"></i>
                  <p>
                    When we release {{activeCount.type.label}} reports, you'll be able to
                    view them from here.  We're also working on download and print
                    functionality for reports.
                  </p>
                </div>
                <div
                  v-else-if="reports.length === 0"
                  class="tds-panel tds-panel-warning">
                  <i class="fa fa-exclamation-triangle"></i>
                  <p>
                    Select one or more report types from the list.
                  </p>
                </div>
                <section
                  v-for="{ label, value, reportComponent } in selection"
                  :key="value"
                  class="mb-xl">
                  <header class="mb-m">
                    <h3>{{label}}</h3>
                  </header>
                  <component
                    :is="reportComponent"
                    :count="activeCount"
                    :count-data="activeCountData" />
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
import { mapState } from 'vuex';
import FcReportAtrSpeedVolumePct from '@/components/FcReportAtrSpeedVolumePct.vue';
import FcReportAtrVolume24hGraph from '@/components/FcReportAtrVolume24hGraph.vue';
import FcReportTmcSummary from '@/components/FcReportTmcSummary.vue';
import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import TdsMixinModal from '@/components/tds/TdsMixinModal';
import apiFetch from '@/lib/ApiFetch';
import Constants from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

const OPTIONS_REPORTS_ATR_VOLUME = [
  { label: '24-Hour Graphical Report', value: 'ATR_VOLUME_24H_GRAPH' },
  { label: '24-Hour Summary Report', value: 'ATR_VOLUME_24H_SUMMARY', disabled: true },
  { label: '24-Hour Detailed Report', value: 'ATR_VOLUME_24H_DETAIL', disabled: true },
];
const OPTIONS_REPORTS = {
  ATR_VOLUME_BICYCLE: OPTIONS_REPORTS_ATR_VOLUME,
  TMC: [
    { label: 'TMC Summary Report', value: 'TMC_SUMMARY' },
    { label: 'TMC Illustrated Report', value: 'TMC_ILLUSTRATED', disabled: true },
  ],
  RESCU: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_VOLUME: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_SPEED_VOLUME: [
    { label: 'Speed Percentile Report', value: 'ATR_SPEED_VOLUME_PCT' },
    ...OPTIONS_REPORTS_ATR_VOLUME,
  ],
  PXO_OBSERVE: [],
  PED_DELAY: [],
};

export default {
  name: 'FcModalShowReports',
  mixins: [TdsMixinModal],
  components: {
    FcReportAtrSpeedVolumePct,
    FcReportAtrVolume24hGraph,
    FcReportTmcSummary,
    TdsActionDropdown,
  },
  data() {
    return {
      activeCountData: [],
      reports: [],
      STATUS_META: Constants.STATUS_META,
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
        const label = TimeFormatters.formatDefault(count.date);
        return { label, value: i };
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
    selection() {
      return this.reports.map((report) => {
        const { label } = this.optionsReports
          .find(({ value }) => report === value);
        const suffix = report
          .split('_')
          .map(part => part[0] + part.slice(1).toLowerCase())
          .join('');
        const reportComponent = `FcReport${suffix}`;
        return { label, value: report, reportComponent };
      });
    },
    selectionAll() {
      return this.optionsReports
        .every(({ value, disabled }) => disabled || this.reports.includes(value));
    },
    selectionIndeterminate() {
      return this.reports.length > 0 && !this.selectionAll;
    },
    ...mapState(['locationQuery']),
  },
  watch: {
    activeCount: {
      handler() {
        const countInfoId = this.activeCount.id;
        const categoryId = this.activeCount.type.id;
        const options = {
          method: 'GET',
          data: { countInfoId, categoryId },
        };
        apiFetch('/counts/data', options)
          .then((countData) => {
            const countDataNormalized = countData.map((bucket) => {
              const bucketNormalized = Object.assign({}, bucket);
              bucketNormalized.t = new Date(
                bucketNormalized.t.slice(0, -1),
              );
              return bucketNormalized;
            });
            this.activeCountData = countDataNormalized;
          });
      },
      immediate: true,
    },
  },
  methods: {
    onChangeSelectAll() {
      if (this.selectionAll) {
        this.reports = [];
      } else {
        this.reports = this.optionsReports
          .filter(({ disabled }) => !disabled)
          .map(({ value }) => value);
      }
    },
    onSelectActiveCount(i) {
      this.activeIndex = i;
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
    .fc-modal-show-reports-filters {
      align-items: center;
      border-bottom: var(--border-default);
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
