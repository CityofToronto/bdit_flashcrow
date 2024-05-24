<template>
  <div class="fc-aggregate-collisions mb-0 ml-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Aggregate View collisions data" />
    <template v-else-if="collisionSummary.amount > 0">
      <dl class="d-flex flex-grow-1 justify-space-around">
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

      <div class="fc-collision-detail-box ml-1 mr-4 body-1">
        <div class="d-flex fc-collision-detail-title ml-2 justify-space-apart">
          <FcButton
            type="tertiary"
            class="fc-details-btn"
            @click="showDetails= !showDetails">
              <v-icon v-if="showDetails">mdi mdi-chevron-up</v-icon>
              <v-icon v-else>mdi mdi-chevron-down</v-icon>
              Details
          </FcButton>
          <slot name="second"></slot>
        </div>
        <table v-if="showDetails" class="fc-collision-detail-table pa-2">
          <th class="fc-detail-row fc-detail-header">
            <td class="fc-detail-desc"></td>
            <td class="fc-detail-num">Total</td>
            <td class="fc-detail-num">KSI</td>
            <td class="fc-detail-num">Verified</td>
          </th>
          <tr v-for="(location, i) in locations"
           :key="location.centrelineId"
            class="fc-detail-row">
            <td class="fc-detail-desc text-sm">{{location.description}}</td>
            <td class="fc-detail-num">{{collisionSummaryPerLocation[i].amount}}</td>
            <td class="fc-detail-num">{{collisionSummaryPerLocation[i].ksi}}</td>
            <td class="fc-detail-num">{{collisionSummaryPerLocation[i].validated}}</td>
           </tr>
        </table>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcAggregateCollisions',
  components: {
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
    min-width: 65px;
    text-align: center;
  }
  & .fc-aggregate-collisions-row {
    border-radius: 5px;
    flex-grow: 1;
    justify-content: space-around;
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
    color: var(--v-secondary-base) !important
  }
  & .fc-collision-detail-title {
    display: flex;
    justify-content: space-between;
  }
  & .fc-collision-detail-table {
    width: 100%;
    text-align: center;
    background: #fff;
  }
}
</style>
