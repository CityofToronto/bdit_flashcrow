<template>
  <div class="fc-detail-collisions align-end d-flex mb-5 mr-5 ml-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View collisions data" />
    <template v-else>
      <dl class="d-flex flex-grow-1 flex-shrink-1 justify-space-around">
        <div class="flex-grow-1 collision-fact">
          <dt class="body-1">
            Total
          </dt>
          <dd>
            <FcTextSummaryFraction
              :a="collisionSummary.amount"
              :b="collisionSummaryUnfiltered.amount"
              class="mt-1"
              :show-b="hasFiltersCollision || hasFiltersCommon" />
          </dd>
        </div>
        <div class="flex-grow-1 flex-shrink-1 collision-fact">
          <dt class="body-1">
            KSI
          </dt>
          <dd>
            <FcTextSummaryFraction
              :a="collisionSummary.ksi"
              :b="collisionSummaryUnfiltered.ksi"
              class="mt-1"
              :show-b="hasFiltersCollision || hasFiltersCommon" />
          </dd>
        </div>
        <div class="fc-collisions-validated flex-grow-0 flex-shrink-0 collision-fact mr-4">
          <dt class="body-1">
            Verified
          </dt>
          <dd>
            <FcTextSummaryFraction
              :a="collisionSummary.validated"
              :b="collisionSummaryUnfiltered.validated"
              class="mt-1"
              :show-b="hasFiltersCollision || hasFiltersCommon" />
          </dd>
        </div>
      </dl>
      <FcButton
        class="flex-grow-0 flex-shrink-0 mt-2"
        type="secondary"
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
    ...mapGetters('viewData', ['hasFiltersCollision', 'hasFiltersCommon']),
  },
};
</script>

<style lang="scss">
.fc-detail-collisions {
  flex-wrap: wrap;
  justify-content: flex-end;
  .fc-collisions-validated {
    width: 120px;
  }
  .collision-fact {
    min-width: 50px;
  }
}

@media only screen and (max-width: 600px) {
  .fc-collisions-validated {
    width: unset !important;
  }
}

</style>
