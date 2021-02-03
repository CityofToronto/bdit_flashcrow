<template>
  <div
    aria-label="Search for a location in the map"
    class="fc-selector-single-location"
    role="search">
    <FcInputLocationSearch
      ref="autofocus"
      v-model="internalLocation"
      class="elevation-2" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';

export default {
  name: 'FcSelectorSingleLocation',
  mixins: [FcMixinInputAutofocus],
  components: {
    FcInputLocationSearch,
  },
  computed: {
    internalLocation: {
      get() {
        return this.locationActive;
      },
      set(internalLocation) {
        const locations = [];
        if (internalLocation !== null) {
          locations.push(internalLocation);
        }
        this.setLocations(locations);
        this.setLocationsSelection({
          locations,
          selectionType: LocationSelectionType.POINTS,
        });
      },
    },
    ...mapGetters(['locationActive']),
  },
  methods: {
    ...mapMutations(['setLocations', 'setLocationsSelection']),
  },
};
</script>

<style lang="scss">
.fc-selector-single-location {
  & > .fc-input-location-search {
    width: 392px;
  }
}
</style>
