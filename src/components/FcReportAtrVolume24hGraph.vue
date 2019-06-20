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
    <pre>{{JSON.stringify(volumeByHour, null, 2)}}</pre>
    <footer>
      <table>
        <colgroup>
          <col
            v-for="(_, h) in volumeByHour"
            :key="'col_' + h">
        </colgroup>
        <thead>
          <tr>
            <th v-for="(_, h) in volumeByHour" :key="'th_' + h">
              {{h}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="(n, h) in volumeByHour" :key="'td_' + h">
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

export default {
  name: 'FcReportAtrVolume24hGraph',
  props: {
    count: Object,
    countData: Array,
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
        }
      }
      & > tbody {
        & > tr > td {
          padding: var(--space-xs) var(--space-s);
          &:nth-child(2n + 1) {
            background-color: var(--base-lighter);
          }
        }
      }
    }
  }
}
</style>
