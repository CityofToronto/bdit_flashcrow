<template>
  <div class="fc-view-data-multi-edit">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading multi-location edit mode for View Data" />
    <p
      v-else-if="locations.length === 0"
      class="my-8 py-12 secondary--text text-center">
      No locations selected,<br>
      please select locations to view data
    </p>
    <template v-else>
      <section
        class="fc-multi-edit-inset mt-5 text-center">
        <v-row
          class="my-6"
          no-gutters>
          <v-col cols="4">
            <div class="body-1">
              Collisions
            </div>
            <div class="display-1 font-weight-medium mt-1">
              {{collisionTotal}}
            </div>
          </v-col>
          <v-col cols="4">
            <div class="body-1">
              Studies
            </div>
            <div class="display-1 font-weight-medium mt-1">
              {{studyTotal}}
            </div>
            <div class="font-weight-regular mt-2 title" v-if="studyTotal !== 0">
              <FcTextMostRecent :study="mostRecent" />
            </div>
          </v-col>
        </v-row>
      </section>
    </template>
  </div>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import {
  getCollisionsByCentrelineTotal,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineTotal,
} from '@/lib/api/WebApi';
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';

export default {
  name: 'FcViewDataMultiEdit',
  components: {
    FcProgressLinear,
    FcTextMostRecent,
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
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
    mostRecent() {
      const n = this.studySummary.length;
      if (n === 0) {
        return null;
      }
      const maxEntry = ArrayUtils.getMaxBy(
        this.studySummary,
        ({ mostRecent: { startDate } }) => startDate.valueOf(),
      );
      return maxEntry.mostRecent;
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
}
</style>
