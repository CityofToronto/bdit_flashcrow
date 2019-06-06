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
        <div class="flex-fill"></div>
        <span class="font-size-xl px-xl">{{activeCount.date | date}}</span>
      </div>
    </template>
    <template v-slot:content>
      <div class="flex-container-column full-height">
        <div class="fc-modal-show-reports-filters flex-container-row py-l">
          <TdsChecklistDropdown
            v-model="reports"
            class="fc-filter-reports font-size-l"
            :class="{
              'tds-button-success': reports.length > 0,
            }"
            :disabled="optionsReports.length === 0"
            name="reports"
            :options="optionsReports">
            <span>
              Reports
              <span
                class="tds-badge"
                :class="{
                  'tds-badge-success': reports.length > 0,
                }">{{reports.length}}</span>
            </span>
          </TdsChecklistDropdown>
          <TdsActionDropdown
            class="font-size-l ml-m"
            :options="optionsCounts"
            @action-selected="onSelectActiveCount">
            <span>
              Available Counts
            </span>
          </TdsActionDropdown>
        </div>
        <div class="fc-modal-show-reports-master-detail flex-container-row flex-fill my-m">
          <div class="fc-modal-show-reports-master flex-container-column flex-1 px-m">
            <h3>Contents</h3>
            <div class="flex-fill flex-container-row">
              <div class="flex-cross-scroll">
                TODO: MASTER HERE
              </div>
            </div>
            <div class="fc-modal-show-reports-master-actions mx-m py-m text-center">
              <button
                class="tds-button-secondary font-size-l">
                <i class="fa fa-download"></i>
                <span> Download All</span>
              </button>
              <button
                class="tds-button-secondary font-size-l ml-m"
                disabled>
                <i class="fa fa-print"></i>
                <span> Print All</span>
              </button>
            </div>
          </div>
          <section class="fc-modal-show-reports-detail flex-container-column flex-2 px-m">
            <header class="flex-container-row">
              <h3>TODO: REPORT NAME HERE</h3>
              <div class="flex-fill"></div>
              <button
                class="tds-button-secondary font-size-l">
                <i class="fa fa-download"></i>
              </button>
              <button
                class="tds-button-secondary font-size-l ml-m"
                disabled>
                <i class="fa fa-print"></i>
              </button>
            </header>
            <div class="flex-container-row flex-fill">
              <div class="flex-cross-scroll">
                TODO: REPORT HERE
                <p>
                  <pre>{{JSON.stringify(activeCountData, null, 2)}}</pre>
                </p>
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

import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import TdsMixinModal from '@/components/tds/TdsMixinModal';
import apiFetch from '@/lib/ApiFetch';
import TimeFormatters from '@/lib/time/TimeFormatters';

const OPTIONS_REPORTS = {
  TMC: [
    { label: 'TMC Summary Report', value: 'TMC_SUMMARY' },
    { label: 'Illustrated TMC Summary Report', value: 'TMC_ILLUSTRATED' },
  ],
  ATR_VOLUME: [
    { label: 'Graphical 24-Hour Summary Report', value: 'ATR_VOLUME_24H_GRAPH' },
    { label: '24-Hour Summary Report', value: 'ATR_VOLUME_24H_SUMMARY' },
    { label: 'Detailed 24-Hour Summary Report', value: 'ATR_VOLUME_24H_DETAIL' },
  ],
  ATR_SPEED_VOLUME: [
    { label: 'Speed Percentile Report', value: 'ATR_SPEED_VOLUME_PCT' },
  ],
  PXO_OBSERVE: [],
  PED_DELAY: [],
};

export default {
  name: 'FcModalShowReports',
  mixins: [TdsMixinModal],
  components: {
    TdsActionDropdown,
    TdsChecklistDropdown,
  },
  data() {
    return {
      activeCountData: {},
      loading: false,
      reports: [],
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
              bucketNormalized.t = new Date(bucketNormalized.t);
              return bucketNormalized;
            });
            this.activeCountData = countDataNormalized;
          });
      },
      immediate: true,
    },
  },
  methods: {
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
    .fc-modal-show-reports-master-detail {
      align-items: stretch;
      & > .fc-modal-show-reports-master {
        border-right: var(--border-default);
        & > .fc-modal-show-reports-master-actions {
          border-top: var(--border-default);
        }
      }
      & > .fc-modal-show-reports-detail {
        & > header {
          align-items: center;
        }
      }
    }
  }
}
</style>
