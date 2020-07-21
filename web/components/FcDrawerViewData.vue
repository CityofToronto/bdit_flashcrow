<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcSelectorMultiLocation v-if="locationMode.multi">
        <template v-slot:action>
          <FcButton
            type="secondary"
            @click="detailView = !detailView">
            <span v-if="detailView">Aggregate View</span>
            <span v-else>Detail View</span>
          </FcButton>
        </template>
      </FcSelectorMultiLocation>
      <div v-else class="pa-5">
        <FcSelectorSingleLocation />
        <h1
          class="display-3 mt-6 text-truncate"
          :title="locationsDescription">
          {{locationsDescription}}
        </h1>
        <div class="label mt-5">
          <span v-if="locationFeatureType !== null">
            {{locationFeatureType.description}}
          </span>
          <v-progress-circular
            v-if="loading"
            color="primary"
            indeterminate
            :size="20"
            :width="2" />
          <span v-else>
            &#x2022; {{studySummaryHeaderText}}
          </span>
        </div>
        <div class="d-flex mt-4">
          <v-progress-circular
            v-if="loading"
            class="ma-3"
            color="primary"
            indeterminate
            :size="20"
            :width="2" />
          <FcSummaryPoi
            v-else
            :location="location" />
          <v-spacer></v-spacer>
          <FcButton
            type="secondary"
            @click="actionAddLocation">
            <v-icon color="primary" left>mdi-map-marker-plus</v-icon>
            Add Location
          </FcButton>
        </div>
      </div>
    </header>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-divider></v-divider>
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <template v-else>
        <FcViewDataDetail
          v-if="detailView"
          :location="location" />
        <FcViewDataAggregate
          v-else
          :locations="locations" />
      </template>
    </section>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  LocationMode,
  LocationSelectionType,
} from '@/lib/Constants';
import { getStudiesByCentrelineSummary } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcViewDataAggregate from '@/web/components/data/FcViewDataAggregate.vue';
import FcViewDataDetail from '@/web/components/data/FcViewDataDetail.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';
import FcSelectorMultiLocation from '@/web/components/inputs/FcSelectorMultiLocation.vue';
import FcSummaryPoi from '@/web/components/location/FcSummaryPoi.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewData',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcSelectorMultiLocation,
    FcSelectorSingleLocation,
    FcSummaryPoi,
    FcViewDataAggregate,
    FcViewDataDetail,
  },
  data() {
    return {
      detailView: false,
      studySummary: [],
    };
  },
  computed: {
    location() {
      if (this.locations.length === 0) {
        return null;
      }
      return this.locations[0];
    },
    studySummaryHeaderText() {
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
    ...mapState('viewData', ['filtersCollision', 'filtersStudy']),
    ...mapState([
      'auth',
      'legendOptions',
      'locationMode',
      'locations',
      'locationsSelection',
    ]),
    ...mapGetters([
      'locationFeatureType',
      'locationsDescription',
      'locationsEmpty',
      'locationsRouteParams',
    ]),
  },
  watch: {
    locationMode() {
      this.detailView = false;
    },
    locationsSelection: {
      deep: true,
      handler() {
        if (this.locationsEmpty) {
          /*
           * Normally `this.loading = true` is paired with `this.loading = false` after some
           * asynchronous operation.  In this case, however, we're using it to hide the View Data
           * drawer contents to prevent errors after clearing `FcSelectorSingleLocation`.  This is
           * OK, as the next line jumps to View Map which destroys this drawer component anyways.
           */
          this.loading = true;
          this.$router.push({
            name: 'viewData',
          });
          return;
        }

        const params = this.locationsRouteParams;
        const { s1, selectionTypeName } = this.$route.params;
        /*
         * Guard against duplicate navigation, which can happen when first loading the page.
         */
        if (s1 !== params.s1 || selectionTypeName !== params.selectionTypeName) {
          /*
           * Update the URL to match the new location.  This allows the user to navigate between
           * recently selected locations with the back / forward browser buttons.
           */
          this.$router.push({
            name: 'viewDataAtLocation',
            params,
          });
        }
      },
    },
  },
  methods: {
    actionAddLocation() {
      this.setLocationMode(LocationMode.MULTI_EDIT);
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });

      const studySummary = await getStudiesByCentrelineSummary(this.locations, {});
      this.studySummary = studySummary;
    },
    ...mapMutations(['setLocationMode']),
    ...mapMutations('viewData', [
      'removeFilterCollision',
      'removeFilterStudy',
      'setFiltersCollision',
      'setFiltersStudy',
    ]),
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-data {
  max-height: 100vh;
}
</style>
