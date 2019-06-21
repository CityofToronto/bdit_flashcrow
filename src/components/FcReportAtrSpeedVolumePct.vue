<template>
  <div class="fc-report-atr-speed-volume-pct">
    <pre>{{JSON.stringify(volumeByHourAndSpeed, null, 2)}}</pre>
  </div>
</template>

<script>
import { mapState } from 'vuex';

// TODO: put this in a database somewhere!
/*
 * These are *half-open intervals*, i.e. `[min, max)` covers all speeds
 * `min <= speed && speed < max`.
 */
/*
const SPEED_CLASSES = [
  [0, 20],
  [20, 25],
  [25, 30],
  [30, 35],
  [35, 40],
  [40, 45],
  [45, 50],
  [50, 55],
  [55, 60],
  [60, 65],
  [65, 70],
  [70, 75],
  [75, 80],
  [80, 999],
];
*/

export default {
  name: 'FcReportAtrSpeedVolumePct',
  props: {
    count: Object,
    countData: Array,
  },
  computed: {
    volumeByHourAndSpeed() {
      const volumeByHourAndSpeed = [];
      for (let h = 0; h < 24; h++) {
        volumeByHourAndSpeed.push(new Array(14).fill(0));
      }
      this.countData.forEach(({ t, data: { COUNT, SPEED_CLASS: s } }) => {
        const h = t.getHours();
        volumeByHourAndSpeed[h][s - 1] += COUNT;
      });
      return volumeByHourAndSpeed;
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-atr-speed-volume-pct {

}
</style>
