<template>
  <div class="fc-aggregate-collisions mb-5 ml-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Aggregate View collisions data" />
    <template v-else-if="collisionSummary.amount > 0">
      <dl class="d-flex flex-grow-1">
        <div class="d-flex pa-2 fc-aggregate-collisions-row">
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
          <slot />
        </div>
      </dl>

      <div class="fc-collision-detail-box ml-1 mr-3 body-1">
        <div class="d-flex fc-collision-detail-title ml-2">
          <FcButton
            type="tertiary"
            class="fc-details-btn"
            @click="showDetails= !showDetails">
              <v-icon v-if="showDetails">mdi mdi-chevron-up</v-icon>
              <v-icon v-else>mdi mdi-chevron-down</v-icon>
              Details
          </FcButton>
        </div>
        <div v-if="showDetails" class="fc-collision-detail-table elevation-1 pa-2">
          <div class="fc-detail-row fc-detail-header">
            <div class="fc-detail-desc"></div>
            <div class="fc-detail-num">Total</div>
            <div class="fc-detail-num">KSI</div>
            <div class="fc-detail-num">Verified</div>
          </div>
          <div v-for="(location, i) in locations"
           :key="location.centrelineId"
            class="fc-detail-row">
            <div class="fc-detail-desc text-sm">{{location.description}}</div>
            <div class="fc-detail-num">{{collisionSummaryPerLocation[i].amount}}</div>
            <div class="fc-detail-num">{{collisionSummaryPerLocation[i].ksi}}</div>
            <div class="fc-detail-num">{{collisionSummaryPerLocation[i].validated}}</div>
          </div>
        </div>
      </div>
      <!-- <v-expansion-panels
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
      </v-expansion-panels> -->
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
// import FcListLocationMulti from '@/web/components/location/FcListLocationMulti.vue';

export default {
  name: 'FcAggregateCollisions',
  components: {
    // FcListLocationMulti,
    FcProgressLinear,
    FcTextSummaryFraction,
    FcButton,
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
      { description: 'Verified', name: 'validated' },
    ];

    return {
      fields,
      indexOpen: null,
      showDetails: false,
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
  & .collision-fact {
    min-width: 60px;
    text-align: center;
  }
  & .fc-aggregate-collisions-row {
    border-radius: 5px;
  }
  & .fc-aggregate-collisions-row:hover {
    box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14),
    2px 1px 3px 0 rgba(0, 0, 0, 0.12);
  }
  & .fc-detail-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-grow: 1;
    margin-bottom: 10px;
  }
  & .fc-detail-header {
    border-bottom: 1px solid lightgrey;
    font-size: 12px;
  }
  & .fc-detail-desc {
    text-align: left;
    width: 150px;
    font-size: 12px;
  }
  & .fc-detail-num {
    flex-grow: 1;
    font-weight: bold;
  }
  & .fc-details-btn {
    text-transform: none !important;
    color: var(--v-default-base);
  }
  & .fc-collision-detail-table {
    text-align: center;
    background: #fff;
  }
}
</style>
