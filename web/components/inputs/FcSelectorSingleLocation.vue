<template>
  <div class="fc-selector-single-location">
    <FcInputLocationSearch
      v-model="internalLocation"
      class="elevation-2" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';

export default {
  name: 'FcSelectorSingleLocation',
  components: {
    FcInputLocationSearch,
  },
  computed: {
    internalLocation: {
      get() {
        return this.location;
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
    ...mapGetters(['location']),
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
