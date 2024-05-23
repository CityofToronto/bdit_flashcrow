<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <header class="fc-drawer-header">
      <FcSelectorMultiLocation v-if="locationMode.multi" :detail-view="detailView"/>
      <div v-else class="px-5 pt-3">
        <FcSelectorSingleLocation v-model="internalLocationsSelection" />
        <FcButton type="tertiary" class="add-location-btn mb-2 mt-1" small
          @click="actionAddLocation">
            <v-icon color="primary" left>mdi-plus</v-icon>
            Add Location
        </FcButton>
      </div>
    </header>
    <section class="fc-view-data-section overflow-y-auto overflow-x-auto">
      <FcProgressLinear v-if="loading" aria-label="Loading View Data drawer" />
      <template v-else>
        <template v-if="locationMode !== LocationMode.MULTI_EDIT">

          <div v-if="!locationMode.multi" class="mx-5 mb-3">
            <FcHeaderSingleLocation :location="locationActive" />
            <div class="d-flex mt-1 justify-start">
              <FcSummaryPoi :location="locationActive" />
            </div>
          </div>

          <FcGlobalFilters class="px-5 py-3" header-tag="h3"
            :class="{'fc-filter-section-border':locationMode === LocationMode.SINGLE}"/>

          <v-divider></v-divider>

          <FcViewDataDetail
            v-if="locationMode === LocationMode.SINGLE || detailView"
            :location="locationActive" />
          <FcViewDataAggregate
            v-else
            :locations="locations"
            :locations-selection="locationsSelection" />
        </template>
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

import { LocationMode, LocationSelectionType } from '@/lib/Constants';
import CompositeId from '@/lib/io/CompositeId';
import FcViewDataAggregate from '@/web/components/data/FcViewDataAggregate.vue';
import FcViewDataDetail from '@/web/components/data/FcViewDataDetail.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcGlobalFilters from '@/web/components/filters/FcGlobalFilters.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';
import FcSelectorMultiLocation from '@/web/components/inputs/FcSelectorMultiLocation.vue';
import FcHeaderSingleLocation from '@/web/components/location/FcHeaderSingleLocation.vue';
import FcSummaryPoi from '@/web/components/location/FcSummaryPoi.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDrawerViewData',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcGlobalFilters,
    FcHeaderSingleLocation,
    FcProgressLinear,
    FcSelectorMultiLocation,
    FcSelectorSingleLocation,
    FcSummaryPoi,
    FcViewDataAggregate,
    FcViewDataDetail,
    FcButton,
  },
  data() {
    return {
      LocationMode,
    };
  },
  computed: {
    internalLocationsSelection: {
      get() {
        return this.locationsSelectionForMode;
      },
      set(locationsSelection) {
        this.syncLocationsSelectionForMode(locationsSelection);
      },
    },
    ...mapState([
      'locationMode',
      'locations',
      'locationsEdit',
      'locationsEditSelection',
      'locationsSelection',
    ]),
    ...mapState('viewData', ['detailView']),
    ...mapGetters([
      'locationActive',
      'locationsEmpty',
      'locationsRouteParams',
      'locationsSelectionForMode',
    ]),
  },
  watch: {
    locationMode() {
      this.setDetailView(false);
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
          }).catch((e) => {
            console.warn('Caught Router Error:', e);//eslint-disable-line
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
    actionToggleDetailView() {
      if (this.detailView) {
        this.setLocationsIndex(-1);
        this.setDetailView(false);
        this.setToastInfo('The View Data panel is now in Aggregate View.');
      } else {
        this.setLocationsIndex(0);
        this.setDetailView(true);
        this.setToastInfo('The View Data panel is now in Detail View.');
      }
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });
    },
    ...mapMutations([
      'setLocationsIndex',
      'setToastInfo',
      'setLocationMode',
    ]),
    ...mapMutations('viewData', ['setDetailView']),
    ...mapActions(['initLocations', 'syncLocationsSelectionForMode']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-data {
  max-height: var(--full-height);
  min-height: 52px;
  & .fc-view-data-section {
    max-height: calc(100vh - 215px);
  }
  & .fc-filter-section-border {
    border-top: 1px solid lightgrey;
  }
  & .add-location-btn {
    text-transform: none !important;
  }
}
</style>
