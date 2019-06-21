<template>
  <div class="fc-report-atr-volume-24h-graph">
    <header class="py-m">
      <div>
        <strong>{{locationQuery}}</strong>
      </div>
      <div>
        <strong>Category: </strong>
        <span>{{count.type.label}}</span>
      </div>
    </header>
    <FcChartAtrVolume24h
      v-model="highlightedHour"
      :aspect-ratio="2"
      :chart-data="volumeByHour" />
    <footer>
      <table
        @mouseleave="highlightedHour = null">
        <caption class="font-size-l mb-m text-left">
          <strong>Start Hour by Hour Volume</strong>
        </caption>
        <colgroup>
          <col
            v-for="(_, h) in volumeByHour"
            :key="'col_' + h">
        </colgroup>
        <thead>
          <tr>
            <th
              v-for="(_, h) in volumeByHour"
              :key="'th_' + h"
              :class="{ highlight: highlightedHour === h }"
              @mouseenter="highlightedHour = h">
              {{h}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              v-for="(n, h) in volumeByHour"
              :key="'td_' + h"
              :class="{ highlight: highlightedHour === h }"
              @mouseenter="highlightedHour = h">
              {{n}}
            </td>
          </tr>
        </tbody>
      </table>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcChartAtrVolume24h from '@/components/FcChartAtrVolume24h.vue';

export default {
  name: 'FcReportAtrVolume24hGraph',
  components: {
    FcChartAtrVolume24h,
  },
  props: {
    count: Object,
    countData: Array,
  },
  data() {
    return {
      highlightedHour: null,
    };
  },
  computed: {
    volumeByHour() {
      const volumeByHour = new Array(24).fill(0);
      this.countData.forEach(({ t, data: { COUNT } }) => {
        const h = t.getHours();
        volumeByHour[h] += COUNT;
      });
      return volumeByHour;
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-atr-volume-24h-graph {
  & > .fc-chart-atr-volume-24h {
    height: 400px;
  }
  & > footer {
    table {
      border-collapse: separate;
      border-spacing: 0;
      text-align: center;
      & > colgroup > col {
        width: var(--space-2xl);
      }
      & > thead {
        & > tr > th {
          border-bottom: var(--border-default);
          padding: var(--space-xs) var(--space-s);
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
      & > tbody {
        & > tr > td {
          padding: var(--space-xs) var(--space-s);
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
}
</style>
