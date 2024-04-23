<template>
  <div class="fc-input-summary text-left pa-1 pb-0">
    <!-- if in CORRIDOR-mode -->
    <div v-if="isCorridor">
      <span>from </span>
      <span class="fc-summary-name">{{ locationsSelection.locations[0].description }}</span>
      <div class="fc-summary-indent">
        <span>to </span>
        <span class="fc-summary-name">
          {{ locationsSelection.locations[locationsSelection.locations.length - 1].description }}
        </span>
      </div>
    </div>
    <!-- support different sizes -->
    <div v-else-if="locationsSelection.locations.length === 1">
      <div class="fc-summary-name">{{ locationsSelection.locations[0].description }}</div>
    </div>
    <div v-else-if="locationsSelection.locations.length === 2">
      <div class="fc-summary-name">{{ locationsSelection.locations[0].description }}</div>
      <span> and </span>
      <span class="fc-summary-name">{{ locationsSelection.locations[1].description }}</span>
    </div>
    <div v-else>
      <div class="fc-summary-name">{{ locationsSelection.locations[0].description }}</div>
      <span class="fc-summary-indent"> and
        <span class="fc-summary-name">{{ locationsSelection.locations.length - 1 }}</span>
        more locations
      </span>
    </div>
  </div>
</template>

<script>
import { CentrelineType, LocationSelectionType } from '@/lib/Constants';
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
    isCorridor() {
      return this.locationsSelection.selectionType === LocationSelectionType.CORRIDOR;
    },
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
  & .fc-summary-name {
    font-weight: bold;
  }

  & .fc-summary-indent {
    margin-left: 10px;
  }
}
</style>
