<template>
  <div class="fc-selector-multi-location d-flex flex-column pa-5">
    <FcDialogConfirmMultiLocationLeave
      v-model="showConfirmMultiLocationLeave" />

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
            ref="autofocus"
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
          <FcButtonAria
            :aria-label="'Remove Location #' + (i + 1)"
            right
            type="icon"
            @click="removeLocationEdit(i)">
            <v-icon>mdi-close</v-icon>
          </FcButtonAria>
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
      <v-messages
        class="mt-2"
        :value="[]"></v-messages>
    </div>
    <div class="flex-grow-0 flex-shrink-0">
      <div class="d-flex align-center">
        <template v-if="locationMode === LocationMode.MULTI_EDIT">
          <h1 class="display-3 mb-4">{{locationsEditDescription}}</h1>
        </template>
        <template v-else-if="detailView">
          <FcHeaderSingleLocation
            class="mt-6"
            :location="locationActive" />
          <v-spacer></v-spacer>
          <v-tooltip
            left
            :z-index="100">
            <template v-slot:activator="{ on }">
              <FcButton
                aria-label="Previous location"
                :disabled="locationsIndex <= 0"
                type="secondary"
                @click="actionLocationPrev"
                v-on="on">
                <v-icon>mdi-arrow-left</v-icon>
              </FcButton>
            </template>
            <span>Previous location</span>
          </v-tooltip>
          <v-tooltip
            right
            :z-index="100">
            <template v-slot:activator="{ on }">
              <FcButton
                aria-label="Next location"
                class="ml-2"
                :disabled="locationsIndex < 0 || locationsIndex >= locations.length - 1"
                type="secondary"
                @click="actionLocationNext"
                v-on="on">
                <v-icon>mdi-arrow-right</v-icon>
              </FcButton>
            </template>
            <span>Next location</span>
          </v-tooltip>
        </template>
        <template v-else>
          <h1 class="display-3 mb-4">{{locationsDescription}}</h1>
        </template>
      </div>
      <div class="d-flex align-center mt-4">
        <template v-if="locationMode === LocationMode.MULTI_EDIT">
          <v-checkbox
            v-model="internalCorridor"
            class="fc-multi-location-corridor mt-0"
            hide-details
            label="Include intersections and midblocks between locations" />

          <v-spacer></v-spacer>

          <FcButton
            type="tertiary"
            @click="showConfirmMultiLocationLeave = true">
            Cancel
          </FcButton>
          <FcButton
            :disabled="loading || locationsEditEmpty || hasError"
            :loading="loading"
            type="secondary"
            @click="saveLocationsEdit">
            Done
          </FcButton>
        </template>
        <template v-else-if="detailView">
          <FcSummaryPoi :location="locationActive" />

          <v-spacer></v-spacer>

          <slot name="action" />
          <FcButton
            class="ml-2"
            type="secondary"
            @click="setLocationMode(LocationMode.MULTI_EDIT)">
            <v-icon color="primary" left>mdi-circle-edit-outline</v-icon>
            Edit Locations
          </FcButton>
        </template>
        <template v-else>
          <span
            v-if="textLocationsSelectionIncludes !== null"
            class="pr-2 secondary--text">
            {{textLocationsSelectionIncludes}}
          </span>

          <v-spacer></v-spacer>

          <slot name="action" />
          <FcButton
            class="ml-2"
            type="secondary"
            @click="setLocationMode(LocationMode.MULTI_EDIT)">
            <v-icon color="primary" left>mdi-circle-edit-outline</v-icon>
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
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDialogConfirmMultiLocationLeave
  from '@/web/components/dialogs/FcDialogConfirmMultiLocationLeave.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';
import FcDisplayLocationMulti from '@/web/components/location/FcDisplayLocationMulti.vue';
import FcHeaderSingleLocation from '@/web/components/location/FcHeaderSingleLocation.vue';
import FcSummaryPoi from '@/web/components/location/FcSummaryPoi.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';

export default {
  name: 'FcSelectorMultiLocation',
  mixins: [FcMixinInputAutofocus],
  components: {
    FcButton,
    FcButtonAria,
    FcDialogConfirmMultiLocationLeave,
    FcDisplayLocationMulti,
    FcHeaderSingleLocation,
    FcInputLocationSearch,
    FcSummaryPoi,
  },
  props: {
    detailView: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hasError: false,
      loading: false,
      LocationMode,
      locationToAdd: null,
      showConfirmMultiLocationLeave: false,
    };
  },
  computed: {
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
      return this.locationsEditSelection.locations.map((location) => {
        const key = centrelineKey(location);
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
      'locationsIndex',
      'locationsSelection',
      'locationsEdit',
      'locationsEditIndex',
      'locationsEditSelection',
    ]),
    ...mapGetters([
      'locationActive',
      'locationsDescription',
      'locationsEditDescription',
      'locationsEditEmpty',
      'locationsEditFull',
      'locationsForModeEmpty',
    ]),
  },
  watch: {
    locationsEditSelection: {
      deep: true,
      async handler() {
        this.loading = true;
        try {
          await this.syncLocationsEdit();
          this.hasError = false;
        } catch (err) {
          this.setToastBackendError(err);
          this.hasError = true;
        }
        this.loading = false;
      },
    },
  },
  methods: {
    actionLocationNext() {
      if (this.locationsIndex <= this.locations.length - 1) {
        this.setLocationsIndex(this.locationsIndex + 1);
      }
    },
    actionLocationPrev() {
      if (this.locationsIndex > 0) {
        this.setLocationsIndex(this.locationsIndex - 1);
      }
    },
    actionRemove(i) {
      this.setLocationsEditIndex(-1);
      this.removeLocationEdit(i);
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
      'setLocationsIndex',
      'setLocationMode',
      'setToastBackendError',
    ]),
  },
};
</script>

<style lang="scss">
.fc-selector-multi-location {
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
