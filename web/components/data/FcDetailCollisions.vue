<template>
  <div class="fc-detail-collisions align-end d-flex mb-5 ml-5 justify-space-around">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View collisions data" />
    <template v-else-if="collisionSummaryUnfiltered.amount > 0">
      <dl class="d-flex flex-grow-1">
        <div class="collision-fact">
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
        <div class="collision-fact">
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
        <div class="collision-fact">
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
        type="tertiary"
        :disabled="collisionSummary.amount === 0"
        v-if="collisionSummary.amount > 0"
        @click="$emit('show-reports')">
          <v-icon x-large>mdi-chevron-right</v-icon>
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
  flex-wrap: nowrap;
  justify-content: flex-start;
  .collision-fact {
    min-width: 70px;
    text-align: center;
  }
}

@media only screen and (max-width: 600px) {
  .fc-collisions-validated {
    width: unset !important;
  }
}

</style>
