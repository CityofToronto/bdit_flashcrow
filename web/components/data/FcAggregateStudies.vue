<template>
  <div class="fc-aggregate-studies mb-9 ml-5">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Aggregate View studies data" />
    <template v-else-if="studySummaryUnfiltered.length > 0">
      <v-expansion-panels
        v-model="indexOpen"
        accordion
        flat
        focusable>
        <v-expansion-panel
          v-for="(item, i) in items"
          :key="i"
          :aria-disabled="item.n === 0"
          class="fc-studies-summary-per-location"
          :disabled="item.n === 0">
          <v-expansion-panel-header class="pr-8">
            <div class="body-1">
              {{item.studyType.label}}
              <FcTextStudyTypeBeta
                class="ml-2"
                small
                :study-type="item.studyType" />
            </div>
            <v-spacer></v-spacer>
            <FcTextSummaryFraction
              :a="item.n"
              :b="item.nUnfiltered"
              class="flex-grow-0 flex-shrink-0 mr-5"
              :show-b="hasFiltersCommon || hasFiltersStudy"
              small />
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <FcListLocationMulti
              class="shading"
              :disabled="disabledPerLocationByItem[i]"
              :locations="locations"
              :locations-selection="locationsSelection">
              <template v-slot:action="{ i: j }">
                <div class="d-flex align-center">
                  <FcTextSummaryFraction
                    :a="itemsPerLocation[i][j].n"
                    :b="itemsPerLocation[i][j].nUnfiltered"
                    class="text-center fc-study-list-number"
                    :show-b="hasFiltersCommon || hasFiltersStudy"
                    small />
                  <div class="fc-chevron-wrapper">
                    <v-tooltip right z-index="110">
                      <template v-slot:activator="{ on }">
                        <FcButton
                          v-on="on"
                          width="40px"
                          type="tertiary"
                          :disabled="itemsPerLocation[i][j].n === 0"
                          @click="$emit('show-reports', { item, locationsIndex: j })">
                          <v-icon x-large>mdi-chevron-right</v-icon>
                        </FcButton>
                      </template>
                      <span>View Report</span>
                    </v-tooltip>
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
import FcTextStudyTypeBeta from '@/web/components/data/FcTextStudyTypeBeta.vue';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcListLocationMulti from '@/web/components/location/FcListLocationMulti.vue';

export default {
  name: 'FcAggregateStudies',
  components: {
    FcButton,
    FcListLocationMulti,
    FcProgressLinear,
    FcTextStudyTypeBeta,
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
      return this.studySummaryUnfiltered.map(({ n, studyType }) => {
        let item = this.studySummary.find(
          itemFiltered => itemFiltered.studyType === studyType,
        );
        if (item === undefined) {
          item = { mostRecent: null, n: 0, studyType };
        }
        return {
          ...item,
          nUnfiltered: n,
        };
      });
    },
    itemsPerLocation() {
      return this.studySummaryPerLocationUnfiltered.map(({ perLocation, studyType }) => {
        const itemPerLocation = this.studySummaryPerLocation.find(
          itemPerLocationFiltered => itemPerLocationFiltered.studyType === studyType,
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
    ...mapGetters('viewData', ['hasFiltersCommon', 'hasFiltersStudy']),
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
  &.v-expansion-panel-content__wrap {
    padding: 0 0 16px !important;
  }
  & .fc-study-list-number {
    min-width: 50px;
  }
  & .fc-chevron-wrapper {
    min-width: 80px;
  }
}
</style>
