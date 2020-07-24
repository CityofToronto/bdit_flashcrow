<template>
  <div class="fc-aggregate-collisions mb-5 ml-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <v-expansion-panels
        v-model="indexOpen"
        accordion
        flat
        focusable>
        <v-expansion-panel
          v-for="field in fields"
          :key="field.name"
          class="fc-collisions-summary-per-location"
          :disabled="collisionSummary[field.name] === 0">
          <v-expansion-panel-header class="pr-8">
            <span class="body-1">{{field.description}}</span>
            <v-spacer></v-spacer>
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{collisionSummary[field.name]}}
              <span
                v-if="hasFiltersCollision"
                class="body-1">
                / {{collisionSummaryUnfiltered[field.name]}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <div
              v-for="(location, i) in locations"
              :key="i"
              class="d-flex pa-3 pr-8"
              :class="{
                'data-empty': collisionSummaryPerLocation[i][field.name] === 0,
              }">
              <FcIconLocationMulti v-bind="locationsIconProps[i]" />
              <span
                class="title"
                :class="{
                  'pl-4': locationsIconProps[i].midblock,
                  'pl-5': !locationsIconProps[i].midblock,
                  'font-weight-regular': locationsIconProps[i].locationIndex === -1,
                }">
                {{location.description}}
              </span>
              <v-spacer></v-spacer>
              <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
                {{collisionSummaryPerLocation[i][field.name]}}
                <span
                  v-if="hasFiltersCollision"
                  class="body-1">
                  / {{collisionSummaryPerLocationUnfiltered[i][field.name]}}
                </span>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="d-flex mt-4 mr-5">
        <v-spacer></v-spacer>
        <FcButton
          class="flex-grow-0 flex-shrink-0"
          :disabled="collisionSummary.amount === 0"
          type="tertiary"
          @click="$emit('show-reports')">
          <span>View Total Reports</span>
        </FcButton>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcAggregateCollisions',
  components: {
    FcButton,
    FcIconLocationMulti,
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
      { description: 'Validated', name: 'validated' },
    ];

    return {
      fields,
      indexOpen: null,
    };
  },
  computed: {
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
    ...mapGetters('viewData', ['hasFiltersCollision']),
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
