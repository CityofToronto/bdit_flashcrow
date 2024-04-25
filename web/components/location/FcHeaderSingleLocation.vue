<template>
  <div class="fc-header-single-location">
    <div
      v-if="loading || location === null"
      aria-label="Loading location details"
      small />
    <template v-else>
      <FcButton
        type="tertiary"
        class="add-location-btn mb-2 mt-1"
        small
        @click="actionAddLocation">
        <v-icon color="primary" left>mdi-plus</v-icon>
        Add Location
      </FcButton>
      <h2 class="display-2">{{location.description}}</h2>
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
import FcButton from '@/web/components/inputs/FcButton.vue';
import { LocationMode } from '@/lib/Constants';
import { mapMutations } from 'vuex';

export default {
  name: 'FcHeaderSingleLocation',
  components: {
    FcButton,
  },
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
      const dayOfWeek = TimeFormatters.formatDayOfWeek(mostRecentDate);
      return `${nStr}: ${mostRecentDateStr} (${dayOfWeek})`;
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
    actionAddLocation() {
      this.setLocationMode(LocationMode.MULTI_EDIT);
    },
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
    ...mapMutations([
      'setLocationMode',
    ]),
  },
};
</script>

<style lang="scss">
.add-location-btn {
  text-transform: none !important;
}
</style>
