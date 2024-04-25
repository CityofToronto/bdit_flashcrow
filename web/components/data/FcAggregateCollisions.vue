<template>
  <div class="fc-aggregate-collisions mb-5 ml-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Aggregate View collisions data" />
    <template v-else-if="collisionSummary.amount > 0">
      <v-expansion-panels
        v-model="indexOpen"
        accordion
        flat
        focusable>
        <v-expansion-panel
          v-for="field in fields"
          :key="field.name"
          :aria-disabled="collisionSummary[field.name] === 0"
          class="fc-collisions-summary-per-location"
          :disabled="collisionSummary[field.name] === 0">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">{{field.description}}</span>
            <v-spacer></v-spacer>
            <FcTextSummaryFraction
              :a="collisionSummary[field.name]"
              :b="collisionSummaryUnfiltered[field.name]"
              class="flex-grow-0 flex-shrink-0 mr-5"
              :show-b="hasFiltersCollision || hasFiltersCommon"
              small />
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <FcListLocationMulti
              class="shading"
              :disabled="disabledPerLocationByField[field.name]"
              icon-classes="mr-4"
              :locations="locations"
              :locations-selection="locationsSelection">
              <template v-slot:action="{ i }">
                <FcTextSummaryFraction
                  :a="collisionSummaryPerLocation[i][field.name]"
                  :b="collisionSummaryPerLocationUnfiltered[i][field.name]"
                  class="mr-9"
                  :show-b="hasFiltersCollision || hasFiltersCommon"
                  small />
              </template>
            </FcListLocationMulti>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcListLocationMulti from '@/web/components/location/FcListLocationMulti.vue';

export default {
  name: 'FcAggregateCollisions',
  components: {
    FcListLocationMulti,
    FcProgressLinear,
    FcTextSummaryFraction,
  },
  props: {
    collisionSummary: Object,
    collisionSummaryUnfiltered: Object,
    collisionSummaryPerLocation: Array,
    collisionSummaryPerLocationUnfiltered: Array,
    loading: Boolean,
    locations: Array,
    locationsSelection: Object,
  },
  data() {
    const fields = [
      { description: 'Amount', name: 'amount' },
      { description: 'KSI', name: 'ksi' },
      { description: 'Verified', name: 'verified' },
    ];

    return {
      fields,
      indexOpen: null,
    };
  },
  computed: {
    disabledPerLocationByField() {
      const disabledPerLocationByField = {};
      this.fields.forEach((field) => {
        disabledPerLocationByField[field.name] = this.collisionSummaryPerLocation.map(
          value => value[field.name] === 0,
        );
      });
      return disabledPerLocationByField;
    },
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
    ...mapGetters('viewData', ['hasFiltersCollision', 'hasFiltersCommon']),
  },
};
</script>

<style lang="scss">
.fc-aggregate-collisions {
  & .fc-collisions-summary-per-location:not(:last-child) {
    border-bottom: 1px solid var(--v-border-base);
  }
  & .data-empty {
    opacity: 0.37;
  }
}
</style>
