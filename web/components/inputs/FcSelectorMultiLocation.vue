<template>
  <div
    aria-label="Search for multiple locations in the map"
    class="fc-selector-multi-location d-flex flex-column px-4 pt-3"
    role="search">
    <FcDialogConfirmMultiLocationLeave
      v-model="showConfirmMultiLocationLeave" />

    <div
      v-if="locationMode === LocationMode.MULTI_EDIT"
      class="align-start d-flex flex-grow-1 flex-shrink-1">
      <div class="fc-input-grow">
        <div >
          <div class="fc-multi-line" v-for="(_, i) in locationsEditSelection.locations"
          :key="locationsEditKeys[i]">
            <div>
              <v-icon class="ma-1 dots" small >mdi-map-marker-outline</v-icon>
              <div class="fc-connector-lines"
                :class="!internalCorridor ? 'hide': ''"
                v-if="i < 4"
              ></div>
            </div>
            <div class="fc-input-location-search-wrapper" >
              <FcInputLocationSearch
              v-model="locationsEditSelection.locations[i]"
              :location-index="i"
              class="elevation-2"
              :class="i > 0 ? 'fc-input-has-border' : ''"
              :selected="i === locationsEditIndex"
              @focus="setLocationsEditIndex(i)"
              @location-remove="actionRemove"
              showClose />
            </div>
          </div>

          <div class="fc-multi-line">
            <v-icon class="ma-1 dots"
             small v-if="!locationsEditFull">mdi-map-marker-outline</v-icon>
            <div class="fc-input-location-search-wrapper">
              <FcInputLocationSearch
                v-if="!locationsEditFull"
                ref="autofocus"
                class="elevation-2 fc-input-has-border"
                v-model="locationToAdd"
                :location-index="-1"
                @focus="setLocationsEditIndex(-1)"
                @location-add="actionAdd" />
              </div>
          </div>
        </div>
        <v-messages
          class="mt-2 mb-2 ml-7"
          v-if="locationsEditFull"
          :value="messagesMaxLocations"></v-messages>
      </div>
    </div>
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 flex flex-column text-right">
      <FcTooltip right>
          <template v-slot:activator="{ on: onTooltip }">
            <FcButton class="fc-close-top-right" type="tertiary" icon
              @click="actionClear" v-on="onTooltip">
              <v-icon color="grey">mdi-close-circle</v-icon>
            </FcButton>
          </template>
          <span>Clear Location</span>
        </FcTooltip>
      <FcDisplayLocationMulti
        :locations="locations"
        :locations-index="locationsIndex"
        :locations-selection="locationsSelection" />

      <div v-if="textLocationsSelectionIncludes !== null"
        class="pr-2 secondary--text text-left mt-2">
        {{textLocationsSelectionIncludes}}
      </div>

      <FcButton
        class="ml-3 edit-location-btn"
        type="tertiary"
        @click="setLocationMode(LocationMode.MULTI_EDIT)">
        <v-icon color="primary" left>mdi-pencil</v-icon>
        Edit Locations
      </FcButton>

    </div>
    <div class="flex-grow-0 flex-shrink-0">
      <div class="d-flex align-center">
        <template v-if="locationMode === LocationMode.MULTI_EDIT">
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
      </div>

        <v-checkbox
            v-if="hasManyLocations"
            v-model="internalCorridor"
            class="fc-multi-location-corridor mt-1 mb-1 ml-6"
            hide-details
            label="Include corridor between locations" />

      <div class="d-flex mt-2 mr-2 justify-end">
        <template v-if="locationMode === LocationMode.MULTI_EDIT">
          <div class="mb-3">
            <FcButton
              type="tertiary"
              @click="leaveLocationMode">
              Cancel
            </FcButton>
            <FcButton
              :disabled="loading || hasError"
              :loading="loading"
              type="primary"
              @click="saveAndThenView">
              Save
            </FcButton>
          </div>
        </template>
        <template v-else-if="detailView">
          <div class="d-flex">

            <FcSummaryPoi :location="locationActive"/>

            <v-spacer></v-spacer>

            <slot name="action" />

          </div>
        </template>
        <template v-else>
          <slot name="action" />
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
      return `Includes ${includesIntersectionsStr}, ${includesMidblocksStr}`;
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
  }
  & .fc-input-has-border {
    border-top: 1px solid var(--v-border-base);
  }
  & .fc-input-grow {
    width: 100%;
  }
  & .fc-input-location-search-remove {
    height: 39px;
  }

  & .fc-multi-location-corridor {
    & .v-label {
      font-size: 0.75rem;
      padding-left: 0 !important;
    }
  }
  & .fc-close-top-right {
    position: absolute;
    right: 8px;
    top: 4px;
  }
  & .fc-multi-line {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }
  & .dots {
    opacity: 0.7;
    margin-right: 8px !important;
  }
  & .fc-connector-lines {
    position: absolute;
    height:16px;
    left:27px;
    border-left:2px dotted grey;
  }
  & .hide {
    display: none;
  }
}
.edit-location-btn {
  text-transform: none !important;
}
</style>
