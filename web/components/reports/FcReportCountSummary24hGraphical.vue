<template>
  <div class="fc-report-atr-volume-24h-graph">
    <header class="py-m">
      <div>
        <strong>{{count.locationDesc}}</strong>
      </div>
      <div>
        <strong>Category: </strong>
        <span>{{count.type.label}}</span>
      </div>
    </header>
    <FcReportBarChart
      v-model="highlightedHour"
      :aspect-ratio="2"
      :chart-data="reportData" />
    <footer>
      <FcReportTable
        v-bind="tableLayout"
        @table-mouseleave="onMouseleaveTable"
        @cell-mouseenter="onMouseenterCell" />
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcReportBarChart from '@/web/components/reports/FcReportBarChart.vue';
import FcReportTable from '@/web/components/reports/FcReportTable.vue';

export default {
  name: 'FcReportCountSummary24hGraphical',
  components: {
    FcReportBarChart,
    FcReportTable,
  },
  props: {
    count: Object,
    reportData: Array,
  },
  data() {
    return {
      highlightedHour: null,
    };
  },
  computed: {
    tableLayout() {
      /* eslint-disable prefer-destructuring */
      const reportData = this.reportData;
      const highlightedHour = this.highlightedHour;
      return {
        title: 'Volume by Start Hour',
        columnStyles: reportData.map((_, h) => ({ c: h })),
        header: [
          reportData.map((_, h) => ({
            value: h,
            style: { highlight: highlightedHour === h },
          })),
        ],
        body: [
          reportData.map((n, h) => ({
            value: n,
            style: { highlight: highlightedHour === h },
          })),
        ],
      };
    },
    ...mapState(['locationQuery']),
  },
  methods: {
    onMouseenterCell({ c: h }) {
      this.highlightedHour = h;
    },
    onMouseleaveTable() {
      this.highlightedHour = null;
    },
  },
};
</script>

<style lang="postcss">
.fc-report-atr-volume-24h-graph {
  & > .fc-report-bar-chart {
    height: 400px;
  }
  & > footer {
    table {
      & > colgroup > col {
        width: var(--space-2xl);
      }
      & > thead {
        background-color: transparent;
      }
      & > thead > tr > th,
      & > tbody > tr > td {
        text-align: center;
        &:nth-child(2n + 1) {
          background-color: var(--base-lighter);
        }
        &.highlight {
          background-color: var(--primary-light);
          border-color: var(--primary-darker);
          color: var(--primary-darker);
        }
      }
    }
  }
}
</style>
