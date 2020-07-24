<template>
  <div class="fc-aggregate-collisions mb-5 mx-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <h3>TODO: aggregate collisions</h3>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'FcAggregateCollisions',
  props: {
    collisionSummaryPerLocation: Array,
    collisionSummaryPerLocationUnfiltered: Array,
    loading: Boolean,
  },
  computed: {
    ...mapGetters('viewData', ['hasFiltersCollision']),
  },
};
</script>
