<template>
  <div class="fc-header-single-location">
    <v-progress-circular
      v-if="loading || location === null"
      color="primary"
      indeterminate
      :size="20"
      :width="2" />
    <template v-else>
      <h1 class="display-3">{{location.description}}</h1>
      <div class="label mt-2">
        {{textLocationFeatureType}} &#x2022; {{textMostRecentStudy}}
      </div>
    </template>
  </div>
</template>

<script>
import { getStudiesByCentrelineSummary } from '@/lib/api/WebApi';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcHeaderSingleLocation',
  props: {
    location: Object,
  },
  data() {
    return {
      loading: false,
      studySummary: [],
    };
  },
  computed: {
    textLocationFeatureType() {
      if (this.location === null) {
        return null;
      }
      const locationFeatureType = getLocationFeatureType(this.location);
      return locationFeatureType.description;
    },
    textMostRecentStudy() {
      const n = this.studySummary.length;
      if (n === 0) {
        return 'No Studies';
      }
      const nStr = n === 1 ? '1 Study Type' : `${n} Study Types`;
      const mostRecentDate = DateTime.max(
        ...this.studySummary.map(({ mostRecent: { startDate } }) => startDate),
      );
      const mostRecentDateStr = TimeFormatters.formatDefault(mostRecentDate);
      return `${nStr} (${mostRecentDateStr})`;
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
      const locations = [this.location];
      const studySummary = await getStudiesByCentrelineSummary(locations, {});
      this.studySummary = studySummary;
      this.loading = false;
    },
  },
};
</script>