<template>
  <TdsModal
    class="fc-modal-show-reports"
    :data="data"
    v-on="$listeners">
    <template v-slot:header>
      <div class="flex-container-row">
        <h2>
          <span>{{item.type.label}} at </span>
          <i class="fa fa-map-marker-alt"></i>
          <abbr
            class="px-s"
            :title="locationQuery">{{locationQuery}}</abbr>
        </h2>
        <div class="flex-fill"></div>
        <abbr
          class="font-size-l px-xl"
          :title="item.date | date">{{item.date | date}}</abbr>
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
          <TdsChecklistDropdown
            v-model="studies"
            class="fc-filter-studies font-size-l ml-m"
            :class="{
              'tds-button-success': studies.length > 0,
            }"
            name="studies"
            :options="optionsReports">
            <span>
              Archived Studies
            </span>
          </TdsChecklistDropdown>
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

import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import TdsMixinModal from '@/components/tds/TdsMixinModal';

export default {
  name: 'FcModalShowReports',
  mixins: [TdsMixinModal],
  components: {
    TdsChecklistDropdown,
  },
  data() {
    return {
      optionsReports: [
        { label: 'Turning Movement Count Summary Report', value: 'TMC_SUMMARY_REPORT' },
      ],
      reports: [],
      studies: [],
    };
  },
  computed: {
    item() {
      return this.data.item;
    },
    ...mapState(['locationQuery']),
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
      & > .fc-filter-studies > .dropdown {
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
