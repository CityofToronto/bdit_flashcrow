<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcSelectorMultiLocation
        v-if="locationMode.multi"
        :detail-view="detailView">
        <template v-slot:action>
          <FcButton
            type="secondary"
            @click="actionToggleDetailView">
            <span v-if="detailView">Aggregate View</span>
            <span v-else>Detail View</span>
          </FcButton>
        </template>
      </FcSelectorMultiLocation>
      <div v-else class="pa-5">
        <FcSelectorSingleLocation />
        <FcHeaderSingleLocation
          class="mt-6"
          :location="location" />
        <div class="d-flex mt-4">
          <FcSummaryPoi :location="location" />
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
        <FcViewDataMultiEdit
          v-if="locationMode === LocationMode.MULTI_EDIT"
          :locations="locationsEdit"
          :locations-selection="locationsEditSelection" />
        <FcViewDataDetail
          v-else-if="locationMode === LocationMode.SINGLE"
          :location="location" />
        <FcViewDataDetail
          v-else-if="detailView"
          :location="locationActive" />
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
import CompositeId from '@/lib/io/CompositeId';
import FcViewDataAggregate from '@/web/components/data/FcViewDataAggregate.vue';
import FcViewDataDetail from '@/web/components/data/FcViewDataDetail.vue';
import FcViewDataMultiEdit from '@/web/components/data/FcViewDataMultiEdit.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';
import FcSelectorMultiLocation from '@/web/components/inputs/FcSelectorMultiLocation.vue';
import FcHeaderSingleLocation from '@/web/components/location/FcHeaderSingleLocation.vue';
import FcSummaryPoi from '@/web/components/location/FcSummaryPoi.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewData',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcHeaderSingleLocation,
    FcSelectorMultiLocation,
    FcSelectorSingleLocation,
    FcSummaryPoi,
    FcViewDataAggregate,
    FcViewDataDetail,
    FcViewDataMultiEdit,
  },
  data() {
    return {
      detailView: false,
      LocationMode,
    };
  },
  computed: {
    ...mapState([
      'locationMode',
      'locations',
      'locationsEdit',
      'locationsEditSelection',
      'locationsSelection',
    ]),
    ...mapGetters([
      'location',
      'locationActive',
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
    actionToggleDetailView() {
      if (this.detailView) {
        this.setLocationsIndex(-1);
        this.detailView = false;
      } else {
        this.setLocationsIndex(0);
        this.detailView = true;
      }
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });
    },
    ...mapMutations([
      'setLocationMode',
      'setLocationsIndex',
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
