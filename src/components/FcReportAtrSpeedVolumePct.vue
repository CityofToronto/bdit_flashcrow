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
            {{max}}
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
          <td class="br text-right">
            <span>{{time}}</span>
          </td>
          <td
            v-for="(n, s) in volume"
            :key="'td_' + h + '_' + s"
            class="text-right">
            <span>{{n}}</span>
          </td>
          <td class="bl text-right">
            <span>{{total}}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Constants from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';

export default {
  name: 'FcReportAtrSpeedVolumePct',
  props: {
    count: Object,
    countData: Array,
  },
  data() {
    return {
      SPEED_CLASSES: Constants.SPEED_CLASSES,
    };
  },
  computed: {
    countDataByHour() {
      const countDataByHour = [];
      for (let h = 0; h < 24; h++) {
        const time = h < 10 ? `0${h}:00` : `${h}:00`;
        const volume = new Array(Constants.SPEED_CLASSES.length).fill(0);
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
      return this.countDataByHour.map(({ time, volume }) => {
        const total = ArrayStats.sum(volume);
        const pct85 = ArrayStats.percentile(volume, 0.85);
        const pct95 = ArrayStats.percentile(volume, 0.95);
        return {
          time,
          volume,
          total,
          pct85,
          pct95,
        };
      });
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
  }
}
</style>
