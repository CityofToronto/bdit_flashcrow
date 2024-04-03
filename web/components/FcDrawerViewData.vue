<template>
  <div class="fc-drawer-view-data d-flex flex-column">
    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcSelectorMultiLocation
        v-if="locationMode.multi"
        :detail-view="detailView">
        <!-- <template v-slot:action>
          <FcButton
            type="secondary"
            @click="actionToggleDetailView">
            <span v-if="detailView">Aggregate View</span>
            <span v-else>Detail View</span>
          </FcButton>
        </template> -->
      </FcSelectorMultiLocation>
      <div v-else class="px-5 py-3">
        <FcSelectorSingleLocation
          v-model="internalLocationsSelection" />
        <FcHeaderSingleLocation
          :location="locationActive" />
        <div class="d-flex mt-4 justify-end">
          <FcSummaryPoi :location="locationActive" />
        </div>
      </div>
    </header>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-divider></v-divider>
      <FcProgressLinear
        v-if="loading"
        aria-label="Loading View Data drawer" />
      <template v-else>
        <FcViewDataMultiEdit
          v-if="locationMode === LocationMode.MULTI_EDIT"
          :locations="locationsEdit"
          :locations-selection="locationsEditSelection" />
        <template v-else>
          <FcGlobalFilters
            class="px-5 py-3"
            header-tag="h3" />

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

import {
  LocationMode,
  LocationSelectionType,
} from '@/lib/Constants';
import CompositeId from '@/lib/io/CompositeId';
import FcViewDataAggregate from '@/web/components/data/FcViewDataAggregate.vue';
import FcViewDataDetail from '@/web/components/data/FcViewDataDetail.vue';
import FcViewDataMultiEdit from '@/web/components/data/FcViewDataMultiEdit.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcGlobalFilters from '@/web/components/filters/FcGlobalFilters.vue';
// import FcButton from '@/web/components/inputs/FcButton.vue';
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
    // FcButton,
    FcGlobalFilters,
    FcHeaderSingleLocation,
    FcProgressLinear,
    FcSelectorMultiLocation,
    FcSelectorSingleLocation,
    FcSummaryPoi,
    FcViewDataAggregate,
    FcViewDataDetail,
    FcViewDataMultiEdit,
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
    ]),
    ...mapMutations('viewData', ['setDetailView']),
    ...mapActions(['initLocations', 'syncLocationsSelectionForMode']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-data {
  max-height: var(--full-height);
}
</style>
