<template>
  <div class="fc-input-summary text-left pa-1 pb-0 mr-5">
    <!-- if in CORRIDOR-mode -->
    <div v-if="isCorridor">
      <div  class="fc-corridor-summary-line">
        <div class="mr-2">from </div>
        <div class="fc-summary-name">{{ locationsSelection.locations[0].description }}</div>
      </div>
      <div class="fc-corridor-summary-line fc-summary-indent">
        <div class="mr-2">to </div>
        <div class="fc-summary-name">
          {{ locationsSelection.locations[locationsSelection.locations.length - 1].description }}
        </div>
      </div>
      <div v-if="locationsSelection.locations.length >= 3"
        class="fc-corridor-summary-line ml-2">
        <div class="mr-2">via </div>
        <div class="fc-summary-name">
          {{ locationsSelection.locations.length - 2 }}
          &nbsp;locations
        </div>
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

  & .fc-corridor-summary-line {
    display: flex;
    flex-wrap: none;
  }
  & .fc-summary-indent {
    margin-left: 18px;
  }
}
</style>
