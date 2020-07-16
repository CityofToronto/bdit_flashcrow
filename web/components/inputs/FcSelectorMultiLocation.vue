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
            @focus="setLocationsEditIndex(i)"
            @location-remove="actionRemove" />
          <FcInputLocationSearch
            v-if="!locationsEditFull"
            v-model="locationToAdd"
            :location-index="-1"
            @focus="setLocationsEditIndex(-1)"
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
      <FcDisplayLocationMulti
        :locations="locations"
        :locations-index="locationsIndex"
        :locations-selection="locationsSelection" />
    </div>
    <div class="flex-grow-0 flex-shrink-0">
      <h1
        class="display-3 mb-4"
        :title="description">
        <span
          v-if="locationsForModeEmpty"
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
            :disabled="loading || locationsEditEmpty"
            :loading="loading"
            type="secondary"
            @click="saveLocationsEdit">
            Done
          </FcButton>
        </template>
        <template v-else>
          <span
            v-if="textLocationsSelectionIncludes !== null"
            class="secondary--text">
            {{textLocationsSelectionIncludes}}
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
  CentrelineType,
  LocationMode,
  LocationSelectionType,
  MAX_LOCATIONS,
} from '@/lib/Constants';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';
import FcDisplayLocationMulti from '@/web/components/location/FcDisplayLocationMulti.vue';

export default {
  name: 'FcSelectorMultiLocation',
  components: {
    FcButton,
    FcDisplayLocationMulti,
    FcInputLocationSearch,
  },
  data() {
    return {
      loading: false,
      LocationMode,
      locationToAdd: null,
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
      if (this.locationMode !== LocationMode.MULTI_EDIT || !this.locationsEditFull) {
        return [];
      }
      return [`Maximum of ${MAX_LOCATIONS} selected locations.`];
    },
    textLocationsSelectionIncludes() {
      if (this.locationsSelection.selectionType !== LocationSelectionType.CORRIDOR) {
        return null;
      }
      const locationsWaypointIndices = getLocationsWaypointIndices(
        this.locations,
        this.locationsSelection.locations,
      );
      let includesIntersections = 0;
      let includesMidblocks = 0;
      this.locations.forEach(({ centrelineType }, i) => {
        const waypointIndices = locationsWaypointIndices[i];
        if (waypointIndices.length === 0) {
          if (centrelineType === CentrelineType.INTERSECTION) {
            includesIntersections += 1;
          } else {
            includesMidblocks += 1;
          }
        }
      });
      const includesIntersectionsStr = includesIntersections === 1
        ? '1 intersection'
        : `${includesIntersections} intersections`;
      const includesMidblocksStr = includesMidblocks === 1
        ? '1 midblock'
        : `${includesMidblocks} midblocks`;
      return `Includes ${includesIntersectionsStr} and ${includesMidblocksStr} between locations`;
    },
    ...mapState([
      'locationMode',
      'locations',
      'locationsSelection',
      'locationsEdit',
      'locationsEditIndex',
      'locationsEditSelection',
    ]),
    ...mapGetters([
      'locationsDescription',
      'locationsEditDescription',
      'locationsEditEmpty',
      'locationsEditFull',
      'locationsForModeEmpty',
      'locationsRouteParams',
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
      this.setLocationsEditIndex(-1);
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
      'setLocationsEditIndex',
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
