<template>
  <div class="fc-detail-collisions  mb-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View collisions data" />
    <div class="fc-detail-row pa-1 d-flex ml-5 mr-2 justify-space-around"
      v-else-if="collisionSummaryUnfiltered.amount > 0">
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
    </div>
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
.fc-detail-row {
  border: 1px solid transparent;
  border-radius: 5px;
}
.fc-detail-row:hover {
  border: 1px solid lightgrey;
}

@media only screen and (max-width: 600px) {
  .fc-collisions-validated {
    width: unset !important;
  }
}

</style>
