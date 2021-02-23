<template>
  <div class="fc-summary-poi">
    <FcProgressCircular
      v-if="loading || location === null"
      aria-label="Loading points of interest near this location"
      silent
      small />
    <dl v-else-if="poiSummary.hospital !== null || poiSummary.school !== null">
      <FcSummaryPoiChip
        v-if="poiSummary.hospital !== null"
        class="mr-2"
        color="pink"
        icon="mdi-hospital-box"
        :poi="poiSummary.hospital"
        text="Hospital" />
      <FcSummaryPoiChip
        v-if="poiSummary.school !== null"
        class="mr-2"
        color="teal"
        icon="mdi-school"
        :poi="poiSummary.school"
        text="School Zone" />
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
      },
    };
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
