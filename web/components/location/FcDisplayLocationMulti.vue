<template>
  <div class="fc-input-location-search-wrapper elevation-2">
    <div
      v-for="(_, i) in locationsSelection.locations"
      :key="i"
      class="fc-input-location-search">
      <v-text-field
        v-model="locationsSelection.locations[i].description"
        :aria-label="'Location #' + (i + 1) + ': ' + locationsSelection.locations[i].description"
        autocomplete="off"
        dense
        flat
        hide-details
        readonly
        solo
        tabindex="-1">
      </v-text-field>
    </div>
  </div>
</template>

<script>
import { CentrelineType } from '@/lib/Constants';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';

export default {
  name: 'FcDisplayLocationMulti',
  components: {},
  props: {
    locations: Array,
    locationsIndex: Number,
    locationsSelection: Object,
  },
  computed: {
    intersectionsByWaypoint() {
      let intersections = [];
      const intersectionsByWaypoint = [];
      this.locations.forEach(({ centrelineType }, i) => {
        const waypointIndices = this.locationsWaypointIndices[i];
        if (waypointIndices.length === 0) {
          if (centrelineType === CentrelineType.INTERSECTION) {
            intersections.push(i);
          }
        } else {
          waypointIndices.forEach(() => {
            intersections = [];
            intersectionsByWaypoint.push(intersections);
          });
        }
      });
      return intersectionsByWaypoint;
    },
    locationsWaypointIndices() {
      return getLocationsWaypointIndices(
        this.locations,
        this.locationsSelection.locations,
      );
    },
    waypointLocationsIndices() {
      const waypointLocationsIndices = [];
      this.locationsWaypointIndices.forEach((waypointIndices, i) => {
        waypointIndices.forEach(() => {
          waypointLocationsIndices.push(i);
        });
      });
      return waypointLocationsIndices;
    },
  },
};
</script>
