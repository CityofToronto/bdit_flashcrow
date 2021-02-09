<template>
  <div class="fc-summary-poi">
    <v-progress-circular
      v-if="loading || location === null"
      color="primary"
      indeterminate
      :size="20"
      :width="2" />
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
import FcSummaryPoiChip from '@/web/components/location/FcSummaryPoiChip.vue';

export default {
  name: 'FcSummaryPoi',
  components: {
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
