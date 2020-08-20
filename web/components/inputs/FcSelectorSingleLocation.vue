<template>
  <div class="fc-selector-single-location">
    <v-tooltip
      v-if="collapseSearchBar"
      right
      :z-index="100">
      <template v-slot:activator="{ on }">
        <FcButton
          aria-label="Search for new location"
          class="fc-search-bar-open"
          type="fab-text"
          @click="$router.push({ name: 'viewData' })"
          v-on="on">
          <v-icon class="unselected--text">mdi-magnify</v-icon>
        </FcButton>
      </template>
      <span>Search for new location</span>
    </v-tooltip>
    <FcInputLocationSearch
      v-else
      v-model="internalLocation"
      class="elevation-2" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';

export default {
  name: 'FcSelectorSingleLocation',
  components: {
    FcButton,
    FcInputLocationSearch,
  },
  computed: {
    collapseSearchBar() {
      const { name } = this.$route;
      return name === 'viewCollisionReportsAtLocation'
        || name === 'viewStudyReportsAtLocation';
    },
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

  & > button.fc-button.v-btn.fc-search-bar-open {
    min-width: 36px;
    width: 36px;
  }
}
</style>
