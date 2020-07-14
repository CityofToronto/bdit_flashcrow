<template>
  <div class="fc-selector-multi-location d-flex flex-column pa-5 shading">
    <div
      v-if="locationMode === LocationMode.MULTI_EDIT"
      class="align-start d-flex flex-grow-1 flex-shrink-1">
      <div>
        <div class="fc-input-location-search-wrapper elevation-2">
          <FcInputLocationSearch
            v-for="(_, i) in locationsEditSelection.locations"
            :key="locationsEditKeys[i]"
            v-model="locationsEditSelection.locations[i]"
            :location-index="i"
            :selected="i === locationsEditIndex"
            @focus="setLocationEditIndex(i)"
            @location-remove="actionRemove" />
          <FcInputLocationSearch
            v-if="locationsEditSelection.locations.length < MAX_LOCATIONS"
            v-model="locationToAdd"
            :location-index="-1"
            @focus="setLocationEditIndex(-1)"
            @location-add="addLocationEdit" />
        </div>
        <v-messages
          class="mt-2"
          :value="messagesMaxLocations"></v-messages>
      </div>
      <div class="ml-2">
        <div
          v-for="(_, i) in locationsEditSelection.locations"
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
    <div
      v-else
      class="flex-grow-1 flex-shrink-1">
      <div class="fc-input-location-search-wrapper elevation-2">
        <FcInputLocationSearch
          v-for="(_, i) in locations"
          :key="i"
          v-model="locationsSelection.locations[i]"
          :location-index="i"
          readonly />
      </div>
    </div>
    <div class="flex-grow-0 flex-shrink-0">
      <h1
        class="display-3 mb-4"
        :title="description">
        <span
          v-if="locationsEmpty"
          class="secondary--text">
          No locations selected
        </span>
        <span v-else>
          {{description}}
        </span>
      </h1>
      <div class="d-flex align-center">
        <template v-if="locationMode === LocationMode.MULTI_EDIT">
          <v-checkbox
            v-model="internalCorridor"
            class="fc-multi-location-corridor mt-0"
            hide-details
            label="Include intersections and midblocks between locations" />

          <v-spacer></v-spacer>

          <FcButton
            type="tertiary"
            @click="cancelLocationsEdit">
            Cancel
          </FcButton>
          <FcButton
            :disabled="loading || locationsEmpty"
            :loading="loading"
            type="secondary"
            @click="saveLocationsEdit">
            Done
          </FcButton>
        </template>
        <template v-else>
          <span
            v-if="locationsSelection.corridor"
            class="secondary--text">
            Includes intersections and midblocks between locations
          </span>

          <v-spacer></v-spacer>

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
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  centrelineKey,
  LocationMode,
  LocationSelectionType,
  MAX_LOCATIONS,
} from '@/lib/Constants';
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
      loading: false,
      LocationMode,
      locationToAdd: null,
      MAX_LOCATIONS,
    };
  },
  computed: {
    description() {
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        return this.locationsEditDescription;
      }
      return this.locationsDescription;
    },
    internalCorridor: {
      get() {
        return this.locationsEditSelection.selectionType === LocationSelectionType.CORRIDOR;
      },
      set(corridor) {
        if (corridor) {
          this.setLocationEditSelectionType(LocationSelectionType.CORRIDOR);
        } else {
          this.setLocationEditSelectionType(LocationSelectionType.POINTS);
        }
      },
    },
    locationsEditKeys() {
      const keyCounter = new Map();
      return this.locationsEditSelection.locations.map(({ centrelineId, centrelineType }) => {
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
      if (this.locationMode !== LocationMode.MULTI_EDIT
        || this.locationsEditSelection.locations.length < MAX_LOCATIONS) {
        return [];
      }
      return [`Maximum of ${MAX_LOCATIONS} selected locations.`];
    },
    ...mapState([
      'locationMode',
      'locations',
      'locationsEdit',
      'locationsEditIndex',
      'locationsEditSelection',
    ]),
    ...mapGetters([
      'locationsDescription',
      'locationsEditDescription',
      'locationsEmpty',
    ]),
  },
  watch: {
    locationsEditSelection: {
      deep: true,
      async handler() {
        this.loading = true;
        await this.syncLocationsEdit();
        this.loading = false;
      },
    },
  },
  methods: {
    actionRemove(i) {
      this.setLocationEditIndex(-1);
      this.removeLocationEdit(i);
    },
    actionViewData() {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewDataAtLocation',
        params,
      });
    },
    ...mapActions(['syncLocationsEdit']),
    ...mapMutations([
      'addLocationEdit',
      'cancelLocationsEdit',
      'removeLocationEdit',
      'saveLocationsEdit',
      'setLocationEdit',
      'setLocationEditIndex',
      'setLocationEditSelectionType',
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
