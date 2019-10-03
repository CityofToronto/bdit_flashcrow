<template>
  <tbody class="fc-report-tmc-summary-section">
    <tr>
      <th class="br" rowspan="2">
        <span>
          {{timeRangeNormalized.start | timeOfDay}}&ndash;{{timeRangeNormalized.end | timeOfDay}}
        </span>
      </th>
      <th>CAR</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_CARS_EXITS'"
          class="bl">
          {{sectionData[dir + '_CARS_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_CARS_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_CARS_' + turn]}}
        </td>
      </template>
      <th class="bl">N</th>
      <td>{{sectionData.N_PEDS}}</td>
      <td>{{sectionData.N_BIKE}}</td>
      <td>{{sectionData.N_OTHER}}</td>
    </tr>
    <tr>
      <th>TRUCK</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_TRUCK_EXITS'"
          class="bl">
          {{sectionData[dir + '_TRUCK_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_TRUCK_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_TRUCK_' + turn]}}
        </td>
      </template>
      <th class="bl">S</th>
      <td>{{sectionData.S_PEDS}}</td>
      <td>{{sectionData.S_BIKE}}</td>
      <td>{{sectionData.S_OTHER}}</td>
    </tr>
    <tr>
      <th class="br">{{title}}</th>
      <th>BUS</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_BUS_EXITS'"
          class="bl">
          {{sectionData[dir + '_BUS_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_BUS_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_BUS_' + turn]}}
        </td>
      </template>
      <th class="bl">E</th>
      <td>{{sectionData.E_PEDS}}</td>
      <td>{{sectionData.E_BIKE}}</td>
      <td>{{sectionData.E_OTHER}}</td>
    </tr>
    <tr>
      <th class="br"></th>
      <th></th>
      <template v-for="dir in dirs">
        <td
          :key="dir + '_EXITS'"
          class="bl"></td>
        <td
          v-for="turn in turns"
          :key="dir + '_' + turn"></td>
      </template>
      <th class="bl">W</th>
      <td>{{sectionData.W_PEDS}}</td>
      <td>{{sectionData.W_BIKE}}</td>
      <td>{{sectionData.W_OTHER}}</td>
    </tr>
    <tr>
      <th class="br"></th>
      <th class="bt">TOTAL</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_VEHICLE_EXITS'"
          class="bt bl">
          {{sectionData[dir + '_VEHICLE_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_VEHICLE_' + turn"
          class="bt">
          {{sectionData[dirs[(i + 2) % 4] + '_VEHICLE_' + turn]}}
        </td>
      </template>
      <th class="bt bl"></th>
      <td class="bt">{{sectionData.PEDS_TOTAL}}</td>
      <td class="bt">{{sectionData.BIKE_TOTAL}}</td>
      <td class="bt">{{sectionData.OTHER_TOTAL}}</td>
    </tr>
  </tbody>
</template>

<script>
export default {
  name: 'FcReportCountSummaryTurningMovementSection',
  props: {
    sectionData: Object,
    timeRange: Object,
    title: String,
  },
  data() {
    return {
      /*
       * In the database, N_CARS_L means "left turn from the north leg of the
       * intersection".  However, in the report, "Northbound Left" means "left
       * turn going northbound", which would actually correspond to S_CARS_L.
       *
       * As such, we swap the directions here from their order in FcReportTmcSummary
       * table headers.
       */
      dirs: ['N', 'E', 'S', 'W'],
      turns: ['L', 'T', 'R', 'TOTAL'],
    };
  },
  computed: {
    timeRangeNormalized() {
      let { start, end } = this.timeRange;
      start = new Date(start.slice(0, -1));
      end = new Date(end.slice(0, -1));
      return { start, end };
    },
  },
};
</script>

<style lang="postcss">
.fc-report-tmc-summary-section {
  border-bottom: var(--border-default);
  & > tr > td {
    padding: var(--space-xs) var(--space-s);
    text-align: right;
  }
  & > tr > th {
    padding: var(--space-xs) var(--space-s);
  }
}
</style>
