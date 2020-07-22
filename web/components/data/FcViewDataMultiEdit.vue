<template>
  <div class="fc-view-data-multi-edit">
    <v-progress-linear
      v-if="loading || locations.length === 0"
      indeterminate />
    <template v-else>
      <div class="fc-multi-edit-inset">
        <v-row
          class="my-6"
          no-gutters>
          <v-col cols="4">
            <div class="font-weight-regular title">
              Total Collisions
            </div>
            <div class="display-2 mt-2">
              {{collisionTotal}}
            </div>
          </v-col>
          <v-col cols="4">
            <div class="font-weight-regular title">
              Total Studies
            </div>
            <div class="display-2 mt-2">
              {{studyTotal}}
            </div>
            <div class="font-weight-regular mt-2 title">
              <span class="fc-multi-edit-most-recent">{{textMostRecentStudy}}</span>
            </div>
          </v-col>
        </v-row>
        <v-divider></v-divider>
      </div>
      <div class="mt-5">
        <h2 class="fc-multi-edit-inset headline pb-1">Selected Locations</h2>
        <div class="ml-6">
          <div
            v-for="(location, i) in locations"
            :key="i"
            class="d-flex mt-8">
            <FcIconLocationMulti v-bind="locationsIconProps[i]" />
            <span
              class="title"
              :class="{
                'pl-8': locationsIconProps[i].midblock,
                'pl-9': !locationsIconProps[i].midblock,
                'font-weight-regular': locationsIconProps[i].locationIndex === -1,
              }">
              {{location.description}}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { CentrelineType } from '@/lib/Constants';
import {
  getCollisionsByCentrelineTotal,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineTotal,
} from '@/lib/api/WebApi';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcViewDataMultiEdit',
  components: {
    FcIconLocationMulti,
  },
  props: {
    locations: Array,
    locationsSelection: Object,
  },
  data() {
    return {
      collisionTotal: 0,
      loading: false,
      studySummary: [],
      studyTotal: 0,
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
    textMostRecentStudy() {
      const n = this.studySummary.length;
      if (n === 0) {
        return 'No Studies';
      }
      const mostRecentDate = DateTime.max(
        ...this.studySummary.map(({ mostRecent: { startDate } }) => startDate),
      );
      const mostRecentDateStr = TimeFormatters.formatDefault(mostRecentDate);
      return `Most Recent ${mostRecentDateStr}`;
    },
  },
  watch: {
    locations() {
      this.syncLocations();
    },
  },
  created() {
    this.syncLocations();
  },
  methods: {
    async syncLocations() {
      this.loading = true;

      const tasks = [
        getCollisionsByCentrelineTotal(this.locations),
        getStudiesByCentrelineSummary(this.locations, {}),
        getStudiesByCentrelineTotal(this.locations),
      ];
      const [
        collisionTotal,
        studySummary,
        studyTotal,
      ] = await Promise.all(tasks);
      this.collisionTotal = collisionTotal;
      this.studySummary = studySummary;
      this.studyTotal = studyTotal;

      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.fc-view-data-multi-edit {
  & .fc-multi-edit-inset {
    margin-left: 75px;
  }
  & .fc-multi-edit-most-recent {
    background-color: rgba(117, 117, 117, 0.1);
    padding: 2px;
  }
  & .fc-multi-edit-icon-wrapper {
    width: 60px;
  }
}
</style>
