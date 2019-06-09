<template>
  <tbody class="fc-report-tmc-summary-section">
    <tr>
      <th rowspan="2">
        <span v-if="timeRange">
          {{timeRange.start | timeOfDay}}&ndash;{{timeRange.end | timeOfDay}}
        </span>
      </th>
      <th>CAR</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_CARS_EXITS'">
          {{sectionData[dir + '_CARS_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_CARS_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_CARS_' + turn]}}
        </td>
      </template>
      <th>N</th>
      <td>{{sectionData.N_PEDS}}</td>
      <td>{{sectionData.N_BIKE}}</td>
      <td>{{sectionData.N_OTHER}}</td>
    </tr>
    <tr>
      <th>TRUCK</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_TRUCK_EXITS'">
          {{sectionData[dir + '_TRUCK_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_TRUCK_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_TRUCK_' + turn]}}
        </td>
      </template>
      <th>E</th>
      <td>{{sectionData.E_PEDS}}</td>
      <td>{{sectionData.E_BIKE}}</td>
      <td>{{sectionData.E_OTHER}}</td>
    </tr>
    <tr>
      <th>{{title}}</th>
      <th>BUS</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_BUS_EXITS'">
          {{sectionData[dir + '_BUS_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_BUS_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_BUS_' + turn]}}
        </td>
      </template>
      <th>S</th>
      <td>{{sectionData.S_PEDS}}</td>
      <td>{{sectionData.S_BIKE}}</td>
      <td>{{sectionData.S_OTHER}}</td>
    </tr>
    <tr>
      <th></th>
      <th></th>
      <template v-for="dir in dirs">
        <td :key="dir + '_EXITS'"></td>
        <td
          v-for="turn in turns"
          :key="dir + '_' + turn"></td>
      </template>
      <th>W</th>
      <td>{{sectionData.W_PEDS}}</td>
      <td>{{sectionData.W_BIKE}}</td>
      <td>{{sectionData.W_OTHER}}</td>
    </tr>
    <tr>
      <th></th>
      <th>TOTAL</th>
      <template v-for="(dir, i) in dirs">
        <td
          :key="dir + '_VEHICLE_EXITS'">
          {{sectionData[dir + '_VEHICLE_EXITS']}}
        </td>
        <td
          v-for="turn in turns"
          :key="dirs[(i + 2) % 4] + '_VEHICLE_' + turn">
          {{sectionData[dirs[(i + 2) % 4] + '_VEHICLE_' + turn]}}
        </td>
      </template>
      <th></th>
      <td>{{sectionData.PEDS_TOTAL}}</td>
      <td>{{sectionData.BIKE_TOTAL}}</td>
      <td>{{sectionData.OTHER_TOTAL}}</td>
    </tr>
  </tbody>
</template>

<script>
export default {
  name: 'FcReportTmcSummarySection',
  props: {
    sectionData: Object,
    timeRange: {
      type: Object,
      default() { return null; },
    },
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
};
</script>

<style lang="postcss">
.fc-report-tmc-summary-section {
  border-bottom: var(--border-default);
}
</style>
