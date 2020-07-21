<template>
  <div class="fc-summary-poi">
    <v-tooltip
      v-if="poiSummary.hospital !== null"
      bottom>
      <template v-slot:activator="{ on }">
        <v-chip
          v-on="on"
          class="mr-2"
          color="pink lighten-4"
          text-color="pink darken-4">
          <v-avatar left>
            <v-icon>mdi-hospital-box</v-icon>
          </v-avatar>
          Hospital Zone
        </v-chip>
      </template>
      <span>{{Math.round(poiSummary.hospital.geom_dist)}} m</span>
    </v-tooltip>
    <v-tooltip
      v-if="poiSummary.school !== null"
      bottom>
      <template v-slot:activator="{ on }">
        <v-chip
          v-on="on"
          class="mr-2"
          color="teal lighten-4"
          text-color="teal darken-4">
          <v-avatar left>
            <v-icon>mdi-school</v-icon>
          </v-avatar>
          School Zone
        </v-chip>
      </template>
      <span>{{Math.round(poiSummary.school.geom_dist)}} m</span>
    </v-tooltip>
  </div>
</template>

<script>
import { getPoiByCentrelineSummary } from '@/lib/api/WebApi';

export default {
  name: 'FcSummaryPoi',
  props: {
    location: Object,
  },
  data() {
    return {
      loading: false,
      poiSummary: {
        hospital: null,
        school: null,
      },
    };
  },
  watch: {
    location() {

    },
  },
  async created() {
    this.loading = true;
    const poiSummary = await getPoiByCentrelineSummary(this.location);
    this.poiSummary = poiSummary;
    this.loading = false;
  },
};
</script>
