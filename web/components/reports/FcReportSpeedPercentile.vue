<template>
  <div class="fc-report-atr-speed-volume-pct">
    <header class="flex-container-row py-m">
      <div>
        <div>
          <strong>City of Toronto</strong>
        </div>
        <div>
          <strong>Transportation Services</strong>
        </div>
        <div>
          <strong>Traffic Safety Unit</strong>
        </div>
        <div>
          <strong>703 Don Mills Road</strong>
        </div>
      </div>
      <div class="flex-fill"></div>
      <div class="text-right">
        <div>
          <strong>{{locationQuery}}</strong>
        </div>
        <div>
          <strong>Site Code: </strong>
          <span>{{count.arteryCode}}</span>
        </div>
        <div>
          <strong>Station ID: </strong>
          <span>{{count.stationCode}}</span>
        </div>
        <div>
          <strong>Date Start: </strong>
          <span>{{count.date | date}}</span>
        </div>
        <div>
          <strong>Date End: </strong>
          <span>TODO</span>
        </div>
      </div>
    </header>
    <table class="my-m">
      <thead>
        <tr>
          <th class="br">Start</th>
          <th
            v-for="([min, max], i) in SPEED_CLASSES"
            :key="'min_' + i"
            class="text-right">
            {{min + 1}}
          </th>
          <th class="bl text-right">&nbsp;</th>
          <th class="text-right">85th</th>
          <th class="text-right">95th</th>
        </tr>
        <tr>
          <th class="bb br">Time</th>
          <th
            v-for="([min, max], i) in SPEED_CLASSES"
            :key="'max_' + i"
            class="bb text-right">
            {{i === SPEED_CLASSES.length - 1 ? 9999 : max}}
          </th>
          <th class="bb bl text-right">Total</th>
          <th class="bb text-right">Percent</th>
          <th class="bb text-right">Percent</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="({ volume, total, pct85, pct95 }, h) in reportData.countDataByHour"
          :key="'tr_' + h">
          <td
            class="br text-right"
            :class="{ bt: h === 12 }">
            <span>{{hoursHuman[h]}}</span>
          </td>
          <td
            v-for="(n, s) in volume"
            :key="'td_' + h + '_' + s"
            class="text-right"
            :class="{
              bt: h === 12,
              peak: h === reportData.hoursPeakAm.volume[s] || h === reportData.hoursPeakPm.volume[s]
            }">
            <span>{{n}}</span>
          </td>
          <td
            class="bl text-right"
            :class="{
              bt: h === 12,
              peak: h === reportData.hoursPeakAm.total || h === reportData.hoursPeakPm.total
            }">
            <span>{{total}}</span>
          </td>
          <td
            class="text-right"
            :class="{ bt: h === 12 }">
            <span v-if="pct85 !== null">{{pct85}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td
            class="text-right"
            :class="{ bt: h === 12 }">
            <span v-if="pct95 !== null">{{pct95}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
        </tr>
        <tr>
          <td class="br bt text-right">
            Total
          </td>
          <td
            v-for="(n, s) in reportData.speedClassTotals"
            :key="'td_total_' + s"
            class="bt text-right">
            <span>{{n}}</span>
          </td>
          <td class="bl bt text-right">
            <span>{{reportData.totalStats.total}}</span>
          </td>
          <td class="bt" colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td class="br bt text-right">
            Percent
          </td>
          <td
            v-for="(pct, s) in reportData.speedClassPercents"
            :key="'td_percent_' + s"
            class="bt text-right">
            <span>{{pct | d3Format('.1%')}}</span>
          </td>
          <td class="bl bt text-right">
            <span>100.0%</span>
          </td>
          <td class="bt" colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td
            class="br bt text-right">
            AM Peak
          </td>
          <td
            v-for="(h, s) in reportData.hoursPeakAm.volume"
            :key="'td_peak_am_time_' + s"
            class="bt text-right">
            <span v-if="h !== null">{{hoursHuman[h]}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl bt text-right">
            <span v-if="reportData.hoursPeakAm.total !== null">
              {{hoursHuman[reportData.hoursPeakAm.total]}}
            </span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bt" colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td
            class="br text-right">
            Vol.
          </td>
          <td
            v-for="(h, s) in reportData.hoursPeakAm.volume"
            :key="'td_peak_am_volume_' + s"
            class="text-right">
            <span v-if="h !== null">{{reportData.countDataByHour[h].volume[s]}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl text-right">
            <span v-if="reportData.hoursPeakAm.total !== null">
              {{reportData.countDataByHour[reportData.hoursPeakAm.total].total}}
            </span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td
            class="br bt text-right">
            PM Peak
          </td>
          <td
            v-for="(h, s) in reportData.hoursPeakPm.volume"
            :key="'td_peak_pm_time_' + s"
            class="bt text-right">
            <span v-if="h !== null">{{hoursHuman[h]}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl bt text-right">
            <span v-if="reportData.hoursPeakPm.total !== null">
              {{hoursHuman[reportData.hoursPeakPm.total]}}
            </span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bt" colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td
            class="br text-right">
            Vol.
          </td>
          <td
            v-for="(h, s) in reportData.hoursPeakPm.volume"
            :key="'td_peak_pm_volume_' + s"
            class="text-right">
            <span v-if="h !== null">{{reportData.countDataByHour[h].volume[s]}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl text-right">
            <span v-if="reportData.hoursPeakPm.total !== null">
              {{reportData.countDataByHour[reportData.hoursPeakPm.total].total}}
            </span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td colspan="2">&nbsp;</td>
        </tr>
      </tbody>
    </table>
    <footer class="mt-m">
      <template v-if="reportData.totalStats.total > 0">
        <div>
          <strong>15th Percentile: </strong>
          <span>{{reportData.totalStats.pct15}} KPH</span>
        </div>
        <div>
          <strong>50th Percentile: </strong>
          <span>{{reportData.totalStats.pct50}} KPH</span>
        </div>
        <div>
          <strong>85th Percentile: </strong>
          <span>{{reportData.totalStats.pct85}} KPH</span>
        </div>
        <div>
          <strong>95th Percentile: </strong>
          <span>{{reportData.totalStats.pct95}} KPH</span>
        </div>
        <div>
          <strong>Mean Speed (Average): </strong>
          <span>{{reportData.totalStats.mu}} KPH</span>
        </div>
      </template>
      <div v-else>
        <strong class="text-muted">
          No statistics available for empty count data.
        </strong>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { SPEED_CLASSES } from '@/lib/Constants';

export default {
  name: 'FcReportSpeedPercentile',
  props: {
    count: Object,
    reportData: Object,
  },
  data() {
    return {
      SPEED_CLASSES,
    };
  },
  computed: {
    hoursHuman() {
      const hoursHuman = [];
      for (let h = 0; h < 24; h++) {
        const time = h < 10 ? `0${h}:00` : `${h}:00`;
        hoursHuman.push(time);
      }
      return hoursHuman;
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-atr-speed-volume-pct {
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 960px;
    & > thead {
      background-color: var(--base-lighter);
      & > tr > th {
        padding: var(--space-xs) var(--space-s);
      }
    }
    & > tbody {
      & > tr {
        &:nth-child(2n) {
          background-color: var(--base-lighter);
        }
        & > td {
          padding: var(--space-xs) var(--space-s);
          &.peak {
            background-color: var(--error-light);
            font-weight: var(--font-weight-bold);
          }
        }
      }
    }
  }
}
</style>
