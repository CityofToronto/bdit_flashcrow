<template>
  <div class="fc-input-location-search-wrapper elevation-2">
    <div
      v-for="(_, i) in locationsSelection.locations"
      :key="i"
      class="fc-input-location-search">
      <v-text-field
        v-model="locationsSelection.locations[i].description"
        autocomplete="off"
        dense
        flat
        hide-details
        readonly
        solo>
        <template v-slot:append>
          <div class="align-center d-flex">
            <FcIconLocationMulti
              :location-index="i"
              :selected="locationsIndex === waypointLocationsIndices[i]" />
            <template v-if="intersectionsByWaypoint[i].length > 0">
              <span class="pl-1">&#x2022;</span>
              <template v-if="intersectionsByWaypoint[i].length <= 3">
                <FcIconLocationMulti
                  v-for="j in intersectionsByWaypoint[i]"
                  :key="'icon_' + i + '_' + j"
                  class="ml-1"
                  :location-index="-1"
                  :selected="locationsIndex === j" />
              </template>
              <template v-else>
                <FcIconLocationMulti
                  class="ml-1"
                  :location-index="-1"
                  :selected="intersectionsByWaypoint[i].includes(locationsIndex)" />
                <span class="pl-1 secondary--text subtitle-2">
                  <span v-if="intersectionsByWaypoint[i].includes(locationsIndex)">
                    {{intersectionsByWaypoint[i].indexOf(locationsIndex) + 1}} /
                    {{intersectionsByWaypoint[i].length}}
                  </span>
                  <span v-else>&times; {{intersectionsByWaypoint[i].length}}</span>
                </span>
              </template>
            </template>
          </div>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script>
import { CentrelineType } from '@/lib/Constants';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcDisplayLocationMulti',
  components: {
    FcIconLocationMulti,
  },
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
            intersectionsByWaypoint.push(intersections);
            intersections = [];
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
