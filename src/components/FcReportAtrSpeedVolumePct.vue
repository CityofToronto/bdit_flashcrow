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
          v-for="({ time, volume, total, pct85, pct95 }, h) in countDataByHour"
          :key="'tr_' + h">
          <td
            class="br text-right"
            :class="{ bt: h === 12 }">
            <span>{{time}}</span>
          </td>
          <td
            v-for="(n, s) in volume"
            :key="'td_' + h + '_' + s"
            class="text-right"
            :class="{
              bt: h === 12,
              peak: h === hoursPeakAm.volume[s] || h === hoursPeakPm.volume[s]
            }">
            <span>{{n}}</span>
          </td>
          <td
            class="bl text-right"
            :class="{
              bt: h === 12,
              peak: h === hoursPeakAm.total || h === hoursPeakPm.total
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
            v-for="(n, s) in speedClassTotals"
            :key="'td_total_' + s"
            class="bt text-right">
            <span>{{n}}</span>
          </td>
          <td class="bl bt text-right">
            <span>{{total}}</span>
          </td>
          <td class="bt" colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td class="br bt text-right">
            Percent
          </td>
          <td
            v-for="(pct, s) in speedClassPercents"
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
            v-for="(h, s) in hoursPeakAm.volume"
            :key="'td_peak_am_time_' + s"
            class="bt text-right">
            <span v-if="h !== null">{{countDataByHour[h].time}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl bt text-right">
            <span v-if="hoursPeakAm.total !== null">
              {{countDataByHour[hoursPeakAm.total].time}}
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
            v-for="(h, s) in hoursPeakAm.volume"
            :key="'td_peak_am_volume_' + s"
            class="text-right">
            <span v-if="h !== null">{{countDataByHour[h].volume[s]}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl text-right">
            <span v-if="hoursPeakAm.total !== null">
              {{countDataByHour[hoursPeakAm.total].total}}
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
            v-for="(h, s) in hoursPeakPm.volume"
            :key="'td_peak_pm_time_' + s"
            class="bt text-right">
            <span v-if="h !== null">{{countDataByHour[h].time}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl bt text-right">
            <span v-if="hoursPeakPm.total !== null">
              {{countDataByHour[hoursPeakPm.total].time}}
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
            v-for="(h, s) in hoursPeakPm.volume"
            :key="'td_peak_pm_volume_' + s"
            class="text-right">
            <span v-if="h !== null">{{countDataByHour[h].volume[s]}}</span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td class="bl text-right">
            <span v-if="hoursPeakPm.total !== null">
              {{countDataByHour[hoursPeakPm.total].total}}
            </span>
            <span v-else class="text-muted">N/A</span>
          </td>
          <td colspan="2">&nbsp;</td>
        </tr>
      </tbody>
    </table>
    <footer class="mt-m">
      <template v-if="totalStats !== null">
        <div>
          <strong>15th Percentile: </strong>
          <span>{{totalStats.pct15}} KPH</span>
        </div>
        <div>
          <strong>50th Percentile: </strong>
          <span>{{totalStats.pct50}} KPH</span>
        </div>
        <div>
          <strong>85th Percentile: </strong>
          <span>{{totalStats.pct85}} KPH</span>
        </div>
        <div>
          <strong>95th Percentile: </strong>
          <span>{{totalStats.pct95}} KPH</span>
        </div>
        <div>
          <strong>Mean Speed (Average): </strong>
          <span>{{totalStats.mu}} KPH</span>
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

import ArrayUtils from '@/lib/ArrayUtils';
import { SPEED_CLASSES } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';

export default {
  name: 'FcReportAtrSpeedVolumePct',
  props: {
    count: Object,
    countData: Array,
  },
  data() {
    return {
      SPEED_CLASSES,
    };
  },
  computed: {
    countDataByHour() {
      const countDataByHour = [];
      for (let h = 0; h < 24; h++) {
        const time = h < 10 ? `0${h}:00` : `${h}:00`;
        const volume = new Array(SPEED_CLASSES.length).fill(0);
        const data = {
          time,
          volume,
        };
        countDataByHour.push(data);
      }
      this.countData.forEach(({ t, data: { COUNT, SPEED_CLASS: s } }) => {
        const h = t.getHours();
        countDataByHour[h].volume[s - 1] += COUNT;
      });
      return countDataByHour.map(({ time, volume }) => {
        const total = ArrayStats.sum(volume);
        let pct85 = null;
        let pct95 = null;
        if (total > 0) {
          pct85 = Math.floor(ArrayStats.histogramPercentile(
            SPEED_CLASSES,
            volume,
            0.85,
          ));
          pct95 = Math.floor(ArrayStats.histogramPercentile(
            SPEED_CLASSES,
            volume,
            0.95,
          ));
        }
        return {
          time,
          volume,
          total,
          pct85,
          pct95,
        };
      });
    },
    hoursPeakAm() {
      const volume = SPEED_CLASSES.map((_, s) => {
        const h = ArrayUtils.getMaxIndexBy(
          this.countDataByHour.slice(0, 12),
          ({ volume: v }) => v[s],
        );
        if (this.countDataByHour[h].volume[s] === 0) {
          return null;
        }
        return h;
      });
      let total = ArrayUtils.getMaxIndexBy(
        this.countDataByHour.slice(0, 12),
        ({ total: t }) => t,
      );
      if (this.countDataByHour[total].total === 0) {
        total = null;
      }
      return { volume, total };
    },
    hoursPeakPm() {
      const volume = SPEED_CLASSES.map((_, s) => {
        let h = ArrayUtils.getMaxIndexBy(
          this.countDataByHour.slice(12),
          ({ volume: v }) => v[s],
        );
        h += 12;
        if (this.countDataByHour[h].volume[s] === 0) {
          return null;
        }
        return h;
      });
      let total = ArrayUtils.getMaxIndexBy(
        this.countDataByHour.slice(12),
        ({ total: t }) => t,
      );
      total += 12;
      if (this.countDataByHour[total].total === 0) {
        total = null;
      }
      return { volume, total };
    },
    speedClassPercents() {
      return this.speedClassTotals
        .map(speedClassTotal => speedClassTotal / this.total);
    },
    speedClassTotals() {
      return SPEED_CLASSES.map((_, s) => {
        const speedClassVolumes = this.countDataByHour
          .map(({ volume }) => volume[s]);
        return ArrayStats.sum(speedClassVolumes);
      });
    },
    total() {
      return ArrayStats.sum(this.speedClassTotals);
    },
    totalStats() {
      if (this.total === 0) {
        return null;
      }
      const pct15 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        this.speedClassTotals,
        0.15,
      ));
      const pct50 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        this.speedClassTotals,
        0.5,
      ));
      const pct85 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        this.speedClassTotals,
        0.85,
      ));
      const pct95 = Math.floor(ArrayStats.histogramPercentile(
        SPEED_CLASSES,
        this.speedClassTotals,
        0.95,
      ));
      const mu = Math.floor(ArrayStats.histogramMean(
        SPEED_CLASSES,
        this.speedClassTotals,
      ));
      return {
        pct15,
        pct50,
        pct85,
        pct95,
        mu,
      };
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
