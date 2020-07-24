<template>
  <div class="fc-aggregate-collisions mb-5 ml-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <v-expansion-panels
        v-model="indexOpen"
        accordion
        flat
        focusable>
        <v-expansion-panel class="fc-collisions-summary-per-location">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">Amount</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary.amount}}
              <span
                v-if="hasFiltersCollision"
                class="font-weight-regular title">
                / {{collisionSummaryUnfiltered.amount}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <div
              v-for="(location, i) in locations"
              :key="i"
              class="d-flex pa-3 pr-8">
              <FcIconLocationMulti v-bind="locationsIconProps[i]" />
              <span
                class="title"
                :class="{
                  'pl-4': locationsIconProps[i].midblock,
                  'pl-5': !locationsIconProps[i].midblock,
                  'font-weight-regular': locationsIconProps[i].locationIndex === -1,
                }">
                {{location.description}}
              </span>
              <v-spacer></v-spacer>
              <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
                {{collisionSummaryPerLocation[i].amount}}
                <span
                  v-if="hasFiltersCollision"
                  class="font-weight-regular title">
                  / {{collisionSummaryPerLocationUnfiltered[i].amount}}
                </span>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel class="fc-collisions-summary-per-location">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">KSI</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary.ksi}}
              <span
                v-if="hasFiltersCollision"
                class="font-weight-regular title">
                / {{collisionSummaryUnfiltered.ksi}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <div
              v-for="(location, i) in locations"
              :key="i"
              class="d-flex pa-3 pr-8">
              <FcIconLocationMulti v-bind="locationsIconProps[i]" />
              <span
                class="title"
                :class="{
                  'pl-4': locationsIconProps[i].midblock,
                  'pl-5': !locationsIconProps[i].midblock,
                  'font-weight-regular': locationsIconProps[i].locationIndex === -1,
                }">
                {{location.description}}
              </span>
              <v-spacer></v-spacer>
              <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
                {{collisionSummaryPerLocation[i].ksi}}
                <span
                  v-if="hasFiltersCollision"
                  class="font-weight-regular title">
                  / {{collisionSummaryPerLocationUnfiltered[i].ksi}}
                </span>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel class="fc-collisions-summary-per-location">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">Validated</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary.validated}}
              <span
                v-if="hasFiltersCollision"
                class="font-weight-regular title">
                / {{collisionSummaryUnfiltered.validated}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <div
              v-for="(location, i) in locations"
              :key="i"
              class="d-flex pa-3 pr-8">
              <FcIconLocationMulti v-bind="locationsIconProps[i]" />
              <span
                class="title"
                :class="{
                  'pl-4': locationsIconProps[i].midblock,
                  'pl-5': !locationsIconProps[i].midblock,
                  'font-weight-regular': locationsIconProps[i].locationIndex === -1,
                }">
                {{location.description}}
              </span>
              <v-spacer></v-spacer>
              <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
                {{collisionSummaryPerLocation[i].validated}}
                <span
                  v-if="hasFiltersCollision"
                  class="font-weight-regular title">
                  / {{collisionSummaryPerLocationUnfiltered[i].validated}}
                </span>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="d-flex mt-4 mr-5">
        <v-spacer></v-spacer>
        <FcButton
          class="flex-grow-0 flex-shrink-0"
          type="tertiary"
          :disabled="collisionSummary.amount === 0"
          @click="$emit('show-reports')">
          <span>View Total Reports</span>
        </FcButton>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcAggregateCollisions',
  components: {
    FcButton,
    FcIconLocationMulti,
  },
  props: {
    collisionSummary: Object,
    collisionSummaryUnfiltered: Object,
    collisionSummaryPerLocation: Array,
    collisionSummaryPerLocationUnfiltered: Array,
    loading: Boolean,
    locations: Array,
    locationsSelection: Object,
  },
  data() {
    return {
      indexOpen: null,
    };
  },
  computed: {
    locationsIconProps() {
      const locationsWaypointIndices = getLocationsWaypointIndices(
        this.locations,
        this.locationsSelection.locations,
      );
      return this.locations.map(({ centrelineType }, i) => {
        const midblock = centrelineType === CentrelineType.SEGMENT;
        const waypointIndices = locationsWaypointIndices[i];
        const n = waypointIndices.length;
        if (n === 0) {
          return { locationIndex: -1, midblock };
        }
        const locationIndex = waypointIndices[n - 1];
        return { locationIndex, midblock };
      });
    },
    ...mapGetters('viewData', ['hasFiltersCollision']),
  },
};
</script>

<style lang="scss">
.fc-aggregate-collisions {
  .fc-collisions-summary-per-location:not(:last-child) {
    border-bottom: 1px solid var(--v-border-base);
  }
}
</style>
