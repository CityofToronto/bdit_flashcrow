<template>
  <tbody class="fc-report-tmc-summary-section">
    <tr>
      <th rowspan="2">
        <span v-if="timeRange">
          {{timeRange.start | timeOfDay}}&ndash;{{timeRange.end | timeOfDay}}
        </span>
      </th>
      <th>CAR</th>
      <template v-for="dir in dirs">
        <td
          v-for="turn in turns"
          :key="dir + '_CARS_' + turn">
          {{sectionData[dir + '_CARS_' + turn]}}
        </td>
      </template>
      <th>N</th>
      <td>{{sectionData.N_PEDS}}</td>
      <td>{{sectionData.N_BIKE}}</td>
      <td>{{sectionData.N_OTHER}}</td>
    </tr>
    <tr>
      <th>TRUCK</th>
      <template v-for="dir in dirs">
        <td
          v-for="turn in turns"
          :key="dir + '_TRUCK_' + turn">
          {{sectionData[dir + '_TRUCK_' + turn]}}
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
      <template v-for="dir in dirs">
        <td
          v-for="turn in turns"
          :key="dir + '_BUS_' + turn">
          {{sectionData[dir + '_BUS_' + turn]}}
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
      <template v-for="dir in dirs">
        <td
          v-for="turn in turns"
          :key="dir + '_VEHICLE_' + turn">
          {{sectionData[dir + '_VEHICLE_' + turn]}}
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
