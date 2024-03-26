<template>
  <div
    aria-label="Search for multiple locations in the map"
    class="fc-selector-multi-location d-flex flex-column px-5 py-3"
    role="search">
    <FcDialogConfirmMultiLocationLeave
      v-model="showConfirmMultiLocationLeave" />

    <div
      v-if="locationMode === LocationMode.MULTI_EDIT"
      class="align-start d-flex flex-grow-1 flex-shrink-1">
      <div class="fc-input-grow">
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
            @location-add="actionAdd" />
        </div>
        <v-messages
          class="mt-2 mb-2"
          v-if="locationsEditFull"
          :value="messagesMaxLocations"></v-messages>
      </div>
      <div class="ml-2">
        <div
          v-for="(location, i) in locationsEditSelection.locations"
          :key="'remove_' + i"
          class="fc-input-location-search-remove">
          <FcButtonAria
            :aria-label="'Remove Location #' + (i + 1) + ': ' + location.description"
            right
            type="icon"
            @click="actionRemove(i)">
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
          <!-- <h2 class="display-3 mb-4 mt-4">{{locationsEditDescription}}</h2> -->
        </template>
        <template v-else-if="detailView">
          <FcHeaderSingleLocation
            class="mt-4"
            :location="locationActive" />
          <v-spacer></v-spacer>
          <FcTooltip left>
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
          </FcTooltip>
          <FcTooltip right>
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
          </FcTooltip>
        </template>
        <template v-else>
          <h2 class="display-3 mb-4">{{locationsDescription}}</h2>
        </template>
      </div>

        <v-checkbox
            v-if="hasManyLocations"
            v-model="internalCorridor"
            class="fc-multi-location-corridor mt-0"
            hide-details
            label="Include corridor between locations" />

      <div class="d-flex mt-1 justify-end">
        <template v-if="locationMode === LocationMode.MULTI_EDIT">
          <FcButton
            type="tertiary"
            @click="leaveLocationMode">
            Cancel
          </FcButton>
          <FcButton
            :disabled="loading || hasError || hasZeroLocations"
            :loading="loading"
            type="primary"
            @click="saveAndThenView">
            View Data
          </FcButton>
        </template>
        <template v-else-if="detailView">
          <div class="d-flex">

            <FcSummaryPoi :location="locationActive"/>

            <v-spacer></v-spacer>

            <slot name="action" />
            <FcButton
              class="ml-2 column-space"
              type="secondary"
              @click="setLocationMode(LocationMode.MULTI_EDIT)">
              <v-icon color="primary" left>mdi-circle-edit-outline</v-icon>
              Edit Locations
            </FcButton>

          </div>
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
import Vue from 'vue';
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
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
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
    FcTooltip,
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
    hasZeroLocations() {
      return !this.locationsEditKeys || this.locationsEditKeys.length === 0;
    },
    hasManyLocations() {
      const mode = this.locationMode;
      if (mode !== LocationMode.MULTI_EDIT) {
        return false;
      }
      return this.locationsEditKeys.length > 1;
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
      const dayOfWeek = TimeFormatters.formatDayOfWeek(mostRecentDate);
      return `${nStr}: ${mostRecentDateStr} (${dayOfWeek})`;
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
        try {
          await this.syncLocationsEdit();
          Vue.nextTick(() => this.autofocus());
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
    saveAndThenView() {
      this.saveLocationsEdit();
      const { s1, selectionTypeName } = this.$route.params;
      const params = this.locationsRouteParams;
      // guard-against redundant view-change
      if (s1 !== params.s1 || selectionTypeName !== params.selectionTypeName) {
        this.$router.push({
          name: 'viewDataAtLocation',
          params,
        });
      }
    },
    leaveLocationMode() {
      this.cancelLocationsEdit();
    },
    actionAdd(location) {
      const { description } = location;
      this.setToastInfo(`Added ${description} to selected locations.`);

      this.addLocationEdit(location);
      Vue.nextTick(() => this.autofocus());
    },
    actionClear() {
      this.setToastInfo('Cleared all selected locations.');
      this.syncLocationsSelectionForMode({
        locations: [],
        selectionType: LocationSelectionType.POINTS,
      });
    },
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
      const { description } = this.locationsEditSelection.locations[i];
      this.setToastInfo(`Removed ${description} from selected locations.`);

      this.setLocationsEditIndex(-1);
      this.removeLocationEdit(i);
      Vue.nextTick(() => this.autofocus());
    },
    ...mapActions(['syncLocationsEdit', 'syncLocationsSelectionForMode']),
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
      'setToastInfo',
    ]),
  },
};
</script>

<style lang="scss">
.fc-selector-multi-location {
  position: relative;

  & .fc-input-location-search-wrapper {
    width: 100%;
    & > .fc-input-location-search {
      &:not(:first-child) {
        border-top: 1px solid var(--v-border-base);
      }
    }
  }
  & .fc-input-grow {
    width: 100%;
  }
  & .fc-input-location-search-remove {
    height: 39px;
  }

  & .fc-multi-location-corridor {
    & .v-label {
      font-size: 0.875rem;
      padding-left: 0 !important;
    }
  }
}
</style>
