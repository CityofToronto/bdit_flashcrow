<template>
  <div class="fc-detail-collisions align-end d-flex mb-5 mx-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View collisions data" />
    <template v-else>
      <dl class="d-flex flex-grow-1 flex-shrink-1">
        <div class="flex-grow-1 flex-shrink-1">
          <dt class="body-1">
            Amount
          </dt>
          <dd>
            <FcTextSummaryFraction
              :a="collisionSummary.amount"
              :b="collisionSummaryUnfiltered.amount"
              class="mt-1"
              :show-b="hasFiltersCollision" />
          </dd>
        </div>
        <div class="flex-grow-1 flex-shrink-1">
          <dt class="body-1">
            KSI
          </dt>
          <dd>
            <FcTextSummaryFraction
              :a="collisionSummary.ksi"
              :b="collisionSummaryUnfiltered.ksi"
              class="mt-1"
              :show-b="hasFiltersCollision" />
          </dd>
        </div>
        <div class="fc-collisions-validated flex-grow-0 flex-shrink-0 mr-8">
          <dt class="body-1">
            Validated
          </dt>
          <dd>
            <FcTextSummaryFraction
              :a="collisionSummary.validated"
              :b="collisionSummaryUnfiltered.validated"
              class="mt-1"
              :show-b="hasFiltersCollision" />
          </dd>
        </div>
      </dl>
      <FcButton
        class="flex-grow-0 flex-shrink-0"
        type="tertiary"
        :disabled="collisionSummary.amount === 0"
        @click="$emit('show-reports')">
        <span>View Reports</span>
      </FcButton>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDetailCollisions',
  components: {
    FcButton,
    FcProgressLinear,
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
