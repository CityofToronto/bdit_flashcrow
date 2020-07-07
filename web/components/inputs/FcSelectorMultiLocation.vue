<template>
  <div class="fc-selector-multi-location d-flex flex-column pa-5 shading">
    <div class="align-start d-flex flex-grow-1 flex-shrink-1">
      <div>
        <div class="fc-input-location-search-wrapper elevation-2">
          <FcInputLocationSearch
            v-for="(_, i) in locationsEdit"
            :key="locationKeys[i]"
            v-model="locationsEdit[i]"
            :location-index="i"
            :readonly="locationMode !== LocationMode.MULTI_EDIT"
            @focus="setLocationEditIndex(i)" />
          <FcInputLocationSearch
            v-if="locationMode === LocationMode.MULTI_EDIT && locations.length < 5"
            v-model="locationToAdd"
            :location-index="-1"
            @focus="setLocationEditIndex(-1)"
            @location-add="addLocationEdit" />
        </div>
        <v-messages
          class="mt-2"
          :value="messagesMaxLocations"></v-messages>
      </div>
      <div
        v-if="locationMode === LocationMode.MULTI_EDIT"
        class="ml-2">
        <div
          v-for="(_, i) in locations"
          :key="'remove_' + i"
          class="fc-input-location-search-remove">
          <FcButton
            type="icon"
            @click="removeLocationEdit(i)">
            <v-icon>mdi-close</v-icon>
          </FcButton>
        </div>
      </div>
    </div>
    <div class="flex-grow-0 flex-shrink-0">
      <h1
        class="display-3 mb-4"
        :title="description">
        <span
          v-if="locations.length === 0"
          class="secondary--text">
          No locations selected
        </span>
        <span v-else>
          {{description}}
        </span>
      </h1>
      <div class="d-flex align-center">
        <v-checkbox
          v-if="locationMode === LocationMode.MULTI_EDIT"
          v-model="corridor"
          class="fc-multi-location-corridor mt-0"
          hide-details
          label="Include intersections and midblocks between locations" />
        <span
          v-else-if="corridor"
          class="secondary--text">
          Includes intersections and midblocks between locations
        </span>

        <v-spacer></v-spacer>

        <template v-if="locationMode === LocationMode.MULTI_EDIT">
          <FcButton
            type="tertiary"
            @click="cancelLocationsEdit">
            Cancel
          </FcButton>
          <FcButton
            :disabled="locationsEdit.length === 0"
            type="secondary"
            @click="saveLocationsEdit">
            Done
          </FcButton>
        </template>
        <template v-else>
          <FcButton
            type="tertiary"
            @click="actionViewData">
            View Data
          </FcButton>
          <FcButton
            type="secondary"
            @click="setLocationMode(LocationMode.MULTI_EDIT)">
            <v-icon left>mdi-circle-edit-outline</v-icon>
            Edit Locations
          </FcButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { centrelineKey, LocationMode } from '@/lib/Constants';
import { getLocationsDescription } from '@/lib/geo/CentrelineUtils';
import CompositeId from '@/lib/io/CompositeId';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';

export default {
  name: 'FcSelectorMultiLocation',
  components: {
    FcButton,
    FcInputLocationSearch,
  },
  data() {
    return {
      corridor: false,
      locationIndexActive: -1,
      LocationMode,
      locationToAdd: null,
    };
  },
  computed: {
    description() {
      return getLocationsDescription(this.locations);
    },
    locationKeys() {
      const keyCounter = new Map();
      return this.locations.map(({ centrelineId, centrelineType }) => {
        const key = centrelineKey(centrelineType, centrelineId);
        let counter = 0;
        if (keyCounter.has(key)) {
          counter = keyCounter.get(key) + 1;
        }
        keyCounter.set(key, counter);
        return `${key}_${counter}`;
      });
    },
    messagesMaxLocations() {
      if (this.locations.length < 5) {
        return [];
      }
      if (this.locationMode !== LocationMode.MULTI_EDIT) {
        return [];
      }
      return ['Maximum of 5 selected locations.'];
    },
    ...mapState(['locations', 'locationsEdit', 'locationMode']),
  },
  methods: {
    actionViewData() {
      const s1 = CompositeId.encode(this.locations);
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { s1 },
      });
    },
    ...mapMutations([
      'addLocationEdit',
      'cancelLocationsEdit',
      'removeLocationEdit',
      'saveLocationsEdit',
      'setLocationEdit',
      'setLocationEditIndex',
      'setLocationMode',
    ]),
  },
};
</script>

<style lang="scss">
.fc-selector-multi-location {
  border-radius: 8px;
  height: 387px;
  width: 664px;

  & .fc-input-location-search-wrapper {
    width: 472px;
    & > .fc-input-location-search {
      &:not(:first-child) {
        border-top: 1px solid var(--v-border-base);
      }
    }
  }
  & .fc-input-location-search-remove {
    height: 39px;
  }

  & .fc-multi-location-corridor {
    & .v-label {
      font-size: 0.875rem;
    }
  }
}
</style>
