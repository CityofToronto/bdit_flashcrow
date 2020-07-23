<template>
  <div class="fc-view-data-aggregate">
    <v-progress-linear
      v-if="loading || locations.length === 0"
      indeterminate />
    <template v-else>
      <section>
        <FcHeaderCollisions :collision-total="collisionTotal" />
        <div><h3>TODO: collision data</h3></div>
      </section>

      <section>
        <FcHeaderStudies :study-total="studyTotal" />
        <div><h3>TODO: study data</h3></div>
      </section>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import {
  getCollisionsByCentrelineSummaryPerLocation,
  getCollisionsByCentrelineTotal,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
} from '@/lib/api/WebApi';
import FcHeaderCollisions from '@/web/components/data/FcHeaderCollisions.vue';
import FcHeaderStudies from '@/web/components/data/FcHeaderStudies.vue';

export default {
  name: 'FcViewDataAggregate',
  components: {
    FcHeaderCollisions,
    FcHeaderStudies,
  },
  props: {
    locations: Array,
  },
  data() {
    const collisionSummaryPerLocationUnfiltered = this.locations.map(() => ({
      amount: 0,
      ksi: 0,
      validated: 0,
    }));
    const collisionSummaryPerLocation = this.locations.map(() => ({
      amount: 0,
      ksi: 0,
      validated: 0,
    }));
    return {
      collisionSummaryPerLocation,
      collisionSummaryPerLocationUnfiltered,
      collisionTotal: 0,
      loading: false,
      loadingCollisions: false,
      loadingStudies: false,
      studySummaryPerLocation: [],
      studySummaryPerLocationUnfiltered: [],
      studyTotal: 0,
    };
  },
  computed: {
    ...mapGetters('viewData', [
      'filterChipsCollision',
      'filterChipsStudy',
      'filterParamsCollision',
      'filterParamsStudy',
    ]),
  },
  watch: {
    async filterParamsCollision() {
      if (this.locations.length === 0) {
        return;
      }

      this.loadingCollisions = true;
      const collisionSummaryPerLocation = await getCollisionsByCentrelineSummaryPerLocation(
        this.locations,
        this.filterParamsCollision,
      );
      this.collisionSummaryPerLocation = collisionSummaryPerLocation;
      this.loadingCollisions = false;
    },
    async filterParamsStudy() {
      if (this.locations.length === 0) {
        return;
      }

      this.loadingStudies = true;
      const studySummaryPerLocation = await getStudiesByCentrelineSummaryPerLocation(
        this.locations,
        this.filterParamsStudy,
      );
      this.studySummaryPerLocation = studySummaryPerLocation;
      this.loadingStudies = false;
    },
    locations() {
      this.syncLocations();
    },
  },
  created() {
    this.syncLocations();
  },
  methods: {
    async syncLocations() {
      if (this.locations.length === 0) {
        return;
      }

      this.loading = true;

      const tasks = [
        getCollisionsByCentrelineSummaryPerLocation(this.locations, {}),
        getCollisionsByCentrelineSummaryPerLocation(this.locations, this.filterParamsCollision),
        getCollisionsByCentrelineTotal(this.locations),
        getStudiesByCentrelineSummaryPerLocation(this.locations, {}),
        getStudiesByCentrelineSummaryPerLocation(this.locations, this.filterParamsStudy),
        getStudiesByCentrelineTotal(this.locations),
      ];
      const [
        collisionSummaryPerLocationUnfiltered,
        collisionSummaryPerLocation,
        collisionTotal,
        studySummaryPerLocationUnfiltered,
        studySummaryPerLocation,
        studyTotal,
      ] = await Promise.all(tasks);
      this.collisionSummaryPerLocationUnfiltered = collisionSummaryPerLocationUnfiltered;
      this.collisionSummaryPerLocation = collisionSummaryPerLocation;
      this.collisionTotal = collisionTotal;
      this.studySummaryPerLocationUnfiltered = studySummaryPerLocationUnfiltered;
      this.studySummaryPerLocation = studySummaryPerLocation;
      this.studyTotal = studyTotal;

      this.loading = false;
    },
  },
};
</script>
