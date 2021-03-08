<template>
  <div class="fc-summary-poi">
    <FcProgressCircular
      v-if="loading || location === null"
      aria-label="Loading points of interest near this location"
      silent
      small />
    <dl v-else-if="poiChips.length > 0">
      <FcSummaryPoiChip
        v-for="(poiChip, i) in poiChips"
        :key="i"
        class="mr-2"
        v-bind="poiChip" />
    </dl>
  </div>
</template>

<script>
import { getPoiByCentrelineSummary } from '@/lib/api/WebApi';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
import FcSummaryPoiChip from '@/web/components/location/FcSummaryPoiChip.vue';

export default {
  name: 'FcSummaryPoi',
  components: {
    FcProgressCircular,
    FcSummaryPoiChip,
  },
  props: {
    location: Object,
  },
  data() {
    return {
      loading: false,
      poiSummary: {
        hospital: null,
        school: null,
        trafficSignal: null,
      },
    };
  },
  computed: {
    poiChips() {
      const poiChips = [];

      const { hospital, school, trafficSignal } = this.poiSummary;
      if (hospital !== null) {
        const poiDistance = Math.round(hospital.geom_dist);
        const ariaLabel = `${poiDistance} m`;
        const poiChip = {
          ariaLabel,
          color: 'pink',
          icon: 'mdi-hospital-box',
          text: 'Hospital',
        };
        poiChips.push(poiChip);
      }
      if (school !== null) {
        const poiDistance = Math.round(school.geom_dist);
        const ariaLabel = `${poiDistance} m`;
        const poiChip = {
          ariaLabel,
          color: 'teal',
          icon: 'mdi-school',
          text: 'School Zone',
        };
        poiChips.push(poiChip);
      }
      if (trafficSignal !== null) {
        const ariaLabel = `PX ${trafficSignal.px}`;
        const poiChip = {
          ariaLabel,
          color: 'purple',
          icon: 'mdi-traffic-light',
          text: 'Traffic Signal',
        };
        poiChips.push(poiChip);
      }

      return poiChips;
    },
  },
  watch: {
    location() {
      this.syncLocation();
    },
  },
  created() {
    this.syncLocation();
  },
  methods: {
    async syncLocation() {
      if (this.location === null) {
        return;
      }

      this.loading = true;
      const poiSummary = await getPoiByCentrelineSummary(this.location);
      this.poiSummary = poiSummary;
      this.loading = false;
    },
  },
};
</script>
