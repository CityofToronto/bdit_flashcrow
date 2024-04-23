<template>
  <div class="fc-input-summary text-left pa-2">
    <div
      v-for="(_, i) in locationsSelection.locations"
      :key="i"
      class="fc-summary-line mb-1">
      <span v-if="i>0">and </span>
      <b>{{ locationsSelection.locations[i].description }}</b>
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
<style lang="scss">
.fc-input-summary {
  border-bottom: 1px solid lightgrey;
}
</style>
