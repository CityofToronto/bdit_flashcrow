<template>
  <div class="fc-aggregate-collisions mb-5 ml-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <v-expansion-panels
        accordion
        flat
        focusable>
        <v-expansion-panel class="fc-collisions-summary-per-location">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">Amount</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary.amount}}
              <span
                v-if="hasFiltersCollision"
                class="font-weight-regular title">
                / {{collisionSummaryUnfiltered.amount}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p>
            TODO: amount
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel class="fc-collisions-summary-per-location">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">KSI</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary.ksi}}
              <span
                v-if="hasFiltersCollision"
                class="font-weight-regular title">
                / {{collisionSummaryUnfiltered.ksi}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p>
            TODO: KSI
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel class="fc-collisions-summary-per-location">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">Validated</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary.validated}}
              <span
                v-if="hasFiltersCollision"
                class="font-weight-regular title">
                / {{collisionSummaryUnfiltered.validated}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p>
            TODO: validated
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="d-flex mt-4 mr-5">
        <v-spacer></v-spacer>
        <FcButton
          class="flex-grow-0 flex-shrink-0"
          type="tertiary"
          :disabled="collisionSummary.amount === 0"
          @click="$emit('show-reports')">
          <span>View Total Reports</span>
        </FcButton>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcAggregateCollisions',
  components: {
    FcButton,
  },
  props: {
    collisionSummary: Object,
    collisionSummaryUnfiltered: Object,
    collisionSummaryPerLocation: Array,
    collisionSummaryPerLocationUnfiltered: Array,
    loading: Boolean,
    locations: Array,
  },
  computed: {
    ...mapGetters('viewData', ['hasFiltersCollision']),
  },
};
</script>

<style lang="scss">
.fc-aggregate-collisions {
  .fc-collisions-summary-per-location:not(:last-child) {
    border-bottom: 1px solid var(--v-border-base);
  }
}
</style>
