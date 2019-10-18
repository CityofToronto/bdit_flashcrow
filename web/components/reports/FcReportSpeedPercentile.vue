<template>
  <div class="fc-report-speed-percentile">
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
          <strong>{{count.locationDesc}}</strong>
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
    <FcReportTable v-bind="tableLayout" />
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
import { format } from 'd3-format';
import { mapState } from 'vuex';

import { SPEED_CLASSES } from '@/lib/Constants';
import FcReportTable from '@/web/components/reports/FcReportTable.vue';

function getHoursHuman() {
  const hoursHuman = [];
  for (let h = 0; h < 24; h++) {
    const time = h < 10 ? `0${h}:00` : `${h}:00`;
    hoursHuman.push(time);
  }
  return hoursHuman;
}

const FORMAT_PERCENT = format('.1%');

export default {
  name: 'FcReportSpeedPercentile',
  components: {
    FcReportTable,
  },
  props: {
    count: Object,
    reportData: Object,
  },
  computed: {
    tableLayout() {
      /* eslint-disable prefer-destructuring */
      const reportData = this.reportData;
      const hoursHuman = getHoursHuman();
      return {
        header: [
          [
            { value: 'Start', style: { br: true } },
            ...SPEED_CLASSES.map(speedClass => ({ value: speedClass[0] + 1 })),
            { value: null, style: { bl: true } },
            { value: '85th', style: { bl: true } },
            { value: '95th', style: { bl: true } },
          ],
          [
            { value: 'Time', style: { bb: true, br: true } },
            ...SPEED_CLASSES.map((speedClass, s) => ({
              value: s === SPEED_CLASSES.length - 1 ? 9999 : speedClass[1],
              style: { bb: true },
            })),
            { value: 'Total', style: { bb: true, bl: true } },
            { value: 'Percent', style: { bb: true, bl: true } },
            { value: 'Percent', style: { bb: true, bl: true } },
          ],
        ],
        body: [
          ...reportData.countDataByHour.map(({
            volume,
            total,
            pct85,
            pct95,
          }, h) => [
            { value: hoursHuman[h], header: true, style: { bt: h === 12, br: true } },
            ...volume.map((n, s) => ({
              value: n,
              style: {
                bt: h === 12,
                peak: h === reportData.hoursPeakAm.volume[s]
                  || h === reportData.hoursPeakPm.volume[s],
              },
            })),
            {
              value: total,
              style: {
                bt: h === 12,
                bl: true,
                peak: h === reportData.hoursPeakAm.total
                  || h === reportData.hoursPeakPm.total,
              },
            },
            {
              value: pct85 === null ? 'N/A' : pct85,
              style: {
                bt: h === 12,
                bl: true,
                muted: pct85 === null,
              },
            },
            {
              value: pct95 === null ? 'N/A' : pct95,
              style: {
                bt: h === 12,
                bl: true,
                muted: pct95 === null,
              },
            },
          ]),
          [
            { value: 'Total', header: true, style: { br: true, bt: true } },
            ...reportData.speedClassTotals.map(n => ({
              value: n,
              style: { bt: true },
            })),
            { value: reportData.totalStats.total, style: { bl: true, bt: true } },
            { value: null, colspan: 2, style: { bt: true } },
          ],
          [
            { value: 'Percent', header: true, style: { br: true, bt: true } },
            ...reportData.speedClassPercents.map(pct => ({
              value: FORMAT_PERCENT(pct),
              style: { bt: true },
            })),
            { value: '100.0%', style: { bl: true, bt: true } },
            { value: null, colspan: 2, style: { bt: true } },
          ],
          [
            { value: 'AM Peak', header: true, style: { br: true, bt: true } },
            ...reportData.hoursPeakAm.volume.map(h => ({
              value: h === null ? 'N/A' : hoursHuman[h],
              style: { bt: true, muted: h === null },
            })),
            {
              value: reportData.hoursPeakAm.total === null
                ? 'N/A'
                : hoursHuman[reportData.hoursPeakAm.total],
              style: { bl: true, bt: true, muted: reportData.hoursPeakAm.total === null },
            },
            { value: null, colspan: 2, style: { bt: true } },
          ],
          [
            { value: 'Vol.', header: true, style: { br: true } },
            ...reportData.hoursPeakAm.volume.map((h, s) => ({
              value: h === null
                ? 'N/A'
                : reportData.countDataByHour[h].volume[s],
              style: { muted: h === null },
            })),
            {
              value: reportData.hoursPeakAm.total === null
                ? 'N/A'
                : reportData.countDataByHour[reportData.hoursPeakAm.total].total,
              style: { bl: true, muted: reportData.hoursPeakAm.total === null },
            },
            { value: null, colspan: 2 },
          ],
          [
            { value: 'PM Peak', header: true, style: { br: true, bt: true } },
            ...reportData.hoursPeakPm.volume.map(h => ({
              value: h === null ? 'N/A' : hoursHuman[h],
              style: { bt: true, muted: h === null },
            })),
            {
              value: reportData.hoursPeakPm.total === null
                ? 'N/A'
                : hoursHuman[reportData.hoursPeakPm.total],
              style: { bl: true, bt: true, muted: reportData.hoursPeakPm.total === null },
            },
            { value: null, colspan: 2, style: { bt: true } },
          ],
          [
            { value: 'Vol.', header: true, style: { br: true } },
            ...reportData.hoursPeakPm.volume.map((h, s) => ({
              value: h === null
                ? 'N/A'
                : reportData.countDataByHour[h].volume[s],
              style: { muted: h === null },
            })),
            {
              value: reportData.hoursPeakPm.total === null
                ? 'N/A'
                : reportData.countDataByHour[reportData.hoursPeakPm.total].total,
              style: { bl: true, muted: reportData.hoursPeakPm.total === null },
            },
            { value: null, colspan: 2 },
          ],
        ],
      };
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-speed-percentile {
  table {
    & > tbody > tr > td.peak {
      background-color: var(--error-light);
      font-weight: var(--font-weight-bold);
    }
  }
}
</style>
