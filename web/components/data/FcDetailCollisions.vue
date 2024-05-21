<template>
  <div class="fc-detail-collisions  mb-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View collisions data" />
    <div class="fc-collision-detail-row pl-1 pr-3 py-2 d-flex ml-5 justify-space-around"
      v-else-if="collisionSummaryUnfiltered.amount > 0">
      <dl class="fc-collision-table d-flex flex-grow-1">
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
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <FcButton
            v-on="on"
            id="fc-detail-collision-btn"
            class="ma-1"
            width="50px"
            type="secondary"
            :disabled="collisionSummary.amount === 0"
            @click="$emit('show-reports')">
            <v-icon color="primary" x-large>mdi-chevron-right</v-icon>
          </FcButton>
        </template>
        <span>View Report</span>
      </v-tooltip>
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
    min-width: 65px;
    text-align: center;
  }
  .fc-collision-table {
    justify-content: space-evenly;
  }
}
.fc-collision-detail-row {
  border-radius: 5px;
}

@media only screen and (max-width: 600px) {
  .fc-collisions-validated {
    width: unset !important;
  }
}

</style>
