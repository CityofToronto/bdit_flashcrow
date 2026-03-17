<template>
  <div class="fc-header-single-location">
    <div
      v-if="loading || location === null"
      aria-label="Loading location details"
      small />
    <template v-else>
      <h2 class="display-3">{{location.description}}</h2>
      <div class="label mt-2">
        {{textLocationFeatureType}} &#x2022; {{textMostRecentStudy}}
      </div>
      <div v-if="frontendEnv() === FrontendEnv.LOCAL || frontendEnv() === FrontendEnv.DEV"
        class="label mt-0">
        Centreline ID: {{ this.location.centrelineId }}
      </div>
      <div v-if="this.cautionList.includes(this.location.centrelineId)">
        <div class="special-list-badge">
          Studies at this location may be skewed by the geometry of the roads.
          Please email us for the raw data.
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { getStudiesByCentrelineSummary, getCautionCaseCentrelineIds } from '@/lib/api/WebApi';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FrontendEnv from '@/web/config/FrontendEnv';

export default {
  name: 'FcHeaderSingleLocation',
  components: {},
  props: {
    location: Object,
  },
  data() {
    return {
      loading: false,
      studySummary: [],
      FrontendEnv,
      cautionList: [],
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
  async created() {
    this.syncLocation();
    await this.getCautionList();
  },
  methods: {
    async getCautionList() {
      const cautionList = await getCautionCaseCentrelineIds();
      this.cautionList = cautionList;
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
    ...mapState(['frontendEnv']),
  },
};
</script>

<style lang="scss">
.add-location-btn {
  text-transform: none !important;
}
.special-list-badge {
  display: inline-block;
  background-color: #c0392b;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 12px;
}
</style>
