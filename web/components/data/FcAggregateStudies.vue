<template>
  <div class="fc-aggregate-studies mb-5 ml-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else-if="studySummaryUnfiltered.length === 0"
      class="my-8 py-12 secondary--text text-center">
      There are no studies for these locations,<br>
      please request studies if necessary
    </div>
    <template v-else>
      <v-expansion-panels
        v-model="indexOpen"
        accordion
        flat
        focusable>
        <v-expansion-panel
          v-for="(item, i) in items"
          :key="i"
          class="fc-studies-summary-per-location"
          :disabled="item.n === 0">
          <v-expansion-panel-header class="pr-8">
            <div class="body-1">
              <div v-if="item.category.studyType === null">
                Unknown
              </div>
              <div v-else>
                {{item.category.studyType.label}}
              </div>
            </div>
            <v-spacer></v-spacer>
            <FcTextSummaryFraction
              :a="item.n"
              :b="item.nUnfiltered"
              class="flex-grow-0 flex-shrink-0 mr-5"
              :show-b="hasFiltersStudy"
              small />
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <FcListLocationMulti
              class="shading"
              :disabled="disabledPerLocationByItem[i]"
              icon-classes="mr-4"
              :locations="locations"
              :locations-selection="locationsSelection">
              <template v-slot:subtitle="{ i: j }">
                <FcTextMostRecent
                  v-if="itemsPerLocation[i][j].mostRecent !== null"
                  class="mt-2"
                  :study="itemsPerLocation[i][j].mostRecent" />
              </template>
              <template v-slot:action="{ i: j }">
                <div class="mr-9">
                  <FcTextSummaryFraction
                    :a="itemsPerLocation[i][j].n"
                    :b="itemsPerLocation[i][j].nUnfiltered"
                    class="text-right"
                    :show-b="hasFiltersStudy"
                    small />
                  <div v-if="itemsPerLocation[i][j].n > 0">
                    <FcButton
                      class="mr-n4 mt-1"
                      type="tertiary"
                      @click="$emit('show-reports', { item, locationsIndex: j })">
                      <span>View Reports</span>
                    </FcButton>
                  </div>
                </div>
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
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcListLocationMulti from '@/web/components/location/FcListLocationMulti.vue';

export default {
  name: 'FcAggregateStudies',
  components: {
    FcButton,
    FcListLocationMulti,
    FcTextMostRecent,
    FcTextSummaryFraction,
  },
  props: {
    studySummary: Array,
    studySummaryUnfiltered: Array,
    studySummaryPerLocation: Array,
    studySummaryPerLocationUnfiltered: Array,
    loading: Boolean,
    locations: Array,
    locationsSelection: Object,
  },
  data() {
    return {
      indexOpen: null,
    };
  },
  computed: {
    disabledPerLocationByItem() {
      return this.itemsPerLocation.map(
        itemsPerLocation => itemsPerLocation.map(({ n }) => n === 0),
      );
    },
    items() {
      return this.studySummaryUnfiltered.map(({ category, n }) => {
        let item = this.studySummary.find(
          itemFiltered => itemFiltered.category.id === category.id,
        );
        if (item === undefined) {
          item = { category, mostRecent: null, n: 0 };
        }
        return {
          ...item,
          nUnfiltered: n,
        };
      });
    },
    itemsPerLocation() {
      return this.studySummaryPerLocationUnfiltered.map(({ category, perLocation }) => {
        const itemPerLocation = this.studySummaryPerLocation.find(
          itemPerLocationFiltered => itemPerLocationFiltered.category.id === category.id,
        );
        return perLocation.map(({ n }, j) => {
          if (itemPerLocation === undefined) {
            return { mostRecent: null, n: 0, nUnfiltered: n };
          }
          return {
            ...itemPerLocation.perLocation[j],
            nUnfiltered: n,
          };
        });
      });
    },
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
    ...mapGetters('viewData', ['hasFiltersStudy']),
  },
};
</script>

<style lang="scss">
.fc-aggregate-studies {
  & .fc-studies-summary-per-location:not(:last-child) {
    border-bottom: 1px solid var(--v-border-base);
  }
  & .data-empty {
    opacity: 0.37;
  }
}
</style>
