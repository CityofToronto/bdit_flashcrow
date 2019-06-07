<template>
  <div class="fc-report-tmc-summary">
    <pre>{{JSON.stringify(sum8Hour, null, 2)}}</pre>
  </div>
</template>

<script>
function normalizeData(rawData) {
  const data = Object.assign({}, rawData);

  // directional totals, by type of vehicle
  data.N_CARS_TOTAL = data.N_CARS_R + data.N_CARS_T + data.N_CARS_L;
  data.E_CARS_TOTAL = data.E_CARS_R + data.E_CARS_T + data.E_CARS_L;
  data.S_CARS_TOTAL = data.S_CARS_R + data.S_CARS_T + data.S_CARS_L;
  data.W_CARS_TOTAL = data.W_CARS_R + data.W_CARS_T + data.W_CARS_L;

  data.N_TRUCK_TOTAL = data.N_TRUCK_R + data.N_TRUCK_T + data.N_TRUCK_L;
  data.E_TRUCK_TOTAL = data.E_TRUCK_R + data.E_TRUCK_T + data.E_TRUCK_L;
  data.S_TRUCK_TOTAL = data.S_TRUCK_R + data.S_TRUCK_T + data.S_TRUCK_L;
  data.W_TRUCK_TOTAL = data.W_TRUCK_R + data.W_TRUCK_T + data.W_TRUCK_L;

  data.N_BUS_TOTAL = data.N_BUS_R + data.N_BUS_T + data.N_BUS_L;
  data.E_BUS_TOTAL = data.E_BUS_R + data.E_BUS_T + data.E_BUS_L;
  data.S_BUS_TOTAL = data.S_BUS_R + data.S_BUS_T + data.S_BUS_L;
  data.W_BUS_TOTAL = data.W_BUS_R + data.W_BUS_T + data.W_BUS_L;

  // turning movement totals, all vehicles combined
  data.N_VEHICLE_R = data.N_CARS_R + data.N_TRUCK_R + data.N_BUS_R;
  data.E_VEHICLE_R = data.E_CARS_R + data.E_TRUCK_R + data.E_BUS_R;
  data.S_VEHICLE_R = data.S_CARS_R + data.S_TRUCK_R + data.S_BUS_R;
  data.W_VEHICLE_R = data.W_CARS_R + data.W_TRUCK_R + data.W_BUS_R;

  data.N_VEHICLE_T = data.N_CARS_T + data.N_TRUCK_T + data.N_BUS_T;
  data.E_VEHICLE_T = data.E_CARS_T + data.E_TRUCK_T + data.E_BUS_T;
  data.S_VEHICLE_T = data.S_CARS_T + data.S_TRUCK_T + data.S_BUS_T;
  data.W_VEHICLE_T = data.W_CARS_T + data.W_TRUCK_T + data.W_BUS_T;

  data.N_VEHICLE_L = data.N_CARS_L + data.N_TRUCK_L + data.N_BUS_L;
  data.E_VEHICLE_L = data.E_CARS_L + data.E_TRUCK_L + data.E_BUS_L;
  data.S_VEHICLE_L = data.S_CARS_L + data.S_TRUCK_L + data.S_BUS_L;
  data.W_VEHICLE_L = data.W_CARS_L + data.W_TRUCK_L + data.W_BUS_L;

  // directional totals, all vehicles combined
  data.N_VEHICLE_TOTAL = data.N_CARS_TOTAL + data.N_TRUCK_TOTAL + data.N_BUS_TOTAL;
  data.E_VEHICLE_TOTAL = data.E_CARS_TOTAL + data.E_TRUCK_TOTAL + data.E_BUS_TOTAL;
  data.S_VEHICLE_TOTAL = data.S_CARS_TOTAL + data.S_TRUCK_TOTAL + data.S_BUS_TOTAL;
  data.W_VEHICLE_TOTAL = data.W_CARS_TOTAL + data.W_TRUCK_TOTAL + data.W_BUS_TOTAL;

  // modal totals, including peds / bikes
  data.VEHICLE_TOTAL = data.N_VEHICLE_TOTAL
    + data.E_VEHICLE_TOTAL
    + data.S_VEHICLE_TOTAL
    + data.W_VEHICLE_TOTAL;
  data.PEDS_TOTAL = data.N_PEDS + data.E_PEDS + data.S_PEDS + data.W_PEDS;
  data.BIKE_TOTAL = data.N_BIKE + data.E_BIKE + data.S_BIKE + data.W_BIKE;
  data.OTHER_TOTAL = data.N_OTHER + data.E_OTHER + data.S_OTHER + data.W_OTHER;

  // overall total
  data.TOTAL = data.VEHICLE_TOTAL + data.PEDS_TOTAL + data.BIKE_TOTAL + data.OTHER_TOTAL;

  return data;
}

export default {
  name: 'FcReportTmcSummary',
  props: {
    count: Object,
    countData: Array,
  },
  computed: {
    indexAm2Hour() {
      return 0;
    },
    indexAmPeak() {
      return 2;
    },
    indicesOffHour() {
      const is = [];
      const n = this.countData.length;
      for (let i = 0; i < n; i += 1) {
        if (i < this.indexAmPeak
            || (this.indexAmPeak + 4 <= i && i < this.indexPmPeak)
            || this.indexPmPeak + 4 <= i) {
          is.push(i);
        }
      }
      return is;
    },
    indexPm2Hour() {
      return 24;
    },
    indexPmPeak() {
      return 27;
    },
    sum8Hour() {
      const sum8Hour = this.countData[0].data;
      const n = this.countData.length;
      for (let i = 1; i < n; i += 1) {
        Object.entries(this.countData[i].data).forEach(([key, value]) => {
          sum8Hour[key] += value;
        });
      }
      return normalizeData(sum8Hour);
    },
  },
};
</script>

<style lang="postcss">
.fc-report-tmc-summary {

}
</style>
