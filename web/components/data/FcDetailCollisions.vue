<template>
  <div class="fc-detail-collisions align-end d-flex mb-5 mx-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div class="flex-grow-1 flex-shrink-1">
        <div class="body-1">
          Amount
        </div>
        <FcTextSummaryFraction
          :a="collisionSummary.amount"
          :b="collisionSummaryUnfiltered.amount"
          class="mt-2"
          :show-b="hasFiltersCollision" />
      </div>
      <div class="flex-grow-1 flex-shrink-1">
        <div class="body-1">
          KSI
        </div>
        <FcTextSummaryFraction
          :a="collisionSummary.ksi"
          :b="collisionSummaryUnfiltered.ksi"
          class="mt-2"
          :show-b="hasFiltersCollision" />
      </div>
      <div class="fc-collisions-validated flex-grow-0 flex-shrink-0 mr-8">
        <div class="body-1">
          Validated
        </div>
        <FcTextSummaryFraction
          :a="collisionSummary.validated"
          :b="collisionSummaryUnfiltered.validated"
          class="mt-2"
          :show-b="hasFiltersCollision" />
      </div>
      <FcButton
        class="flex-grow-0 flex-shrink-0"
        type="tertiary"
        :disabled="collisionSummary.amount === 0"
        @click="$emit('show-reports', item)">
        <span>View Reports</span>
      </FcButton>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDetailCollisions',
  components: {
    FcButton,
    FcTextSummaryFraction,
  },
  props: {
    collisionSummary: Object,
    collisionSummaryUnfiltered: Object,
    loading: Boolean,
  },
  computed: {
    ...mapGetters('viewData', ['hasFiltersCollision']),
  },
};
</script>

<style lang="scss">
.fc-detail-collisions {
  .fc-collisions-validated {
    width: 120px;
  }
}
</style>
