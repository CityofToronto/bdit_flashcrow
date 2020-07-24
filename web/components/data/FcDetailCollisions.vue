<template>
  <div class="fc-detail-collisions align-end d-flex mb-5 mx-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div class="flex-grow-1 flex-shrink-1">
        <div class="font-weight-regular title">
          Amount
        </div>
        <div class="display-2 mt-2">
          {{collisionSummary.amount}}
          <span
            v-if="hasFiltersCollision"
            class="font-weight-regular title">
            / {{collisionSummaryUnfiltered.amount}}
          </span>
        </div>
      </div>
      <div class="flex-grow-1 flex-shrink-1">
        <div class="font-weight-regular title">
          KSI
        </div>
        <div class="display-2 mt-2">
          {{collisionSummary.ksi}}
          <span
            v-if="hasFiltersCollision"
            class="font-weight-regular title">
            / {{collisionSummaryUnfiltered.ksi}}
          </span>
        </div>
      </div>
      <div class="fc-collisions-validated flex-grow-0 flex-shrink-0 mr-8">
        <div class="font-weight-regular title">
          Validated
        </div>
        <div class="display-2 mt-2">
          {{collisionSummary.validated}}
          <span
            v-if="hasFiltersCollision"
            class="font-weight-regular title">
            / {{collisionSummaryUnfiltered.validated}}
          </span>
        </div>
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

import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDetailCollisions',
  components: {
    FcButton,
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
