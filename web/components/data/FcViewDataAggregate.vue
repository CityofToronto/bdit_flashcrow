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
  getCollisionsByCentrelineTotal,
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
    return {
      collisionTotal: 0,
      loading: false,
      loadingCollisions: false,
      loadingStudies: false,
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
      this.loadingCollisions = true;

      // TODO: implement this
      await new Promise(resolve => setTimeout(resolve, 400));

      this.loadingCollisions = false;
    },
    async filterParamsStudy() {
      this.loadingStudies = true;
      // TODO: implement this
      await new Promise(resolve => setTimeout(resolve, 400));

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
        getCollisionsByCentrelineTotal(this.locations),
        getStudiesByCentrelineTotal(this.locations),
      ];
      const [
        collisionTotal,
        studyTotal,
      ] = await Promise.all(tasks);
      this.collisionTotal = collisionTotal;
      this.studyTotal = studyTotal;

      this.loading = false;
    },
  },
};
</script>
