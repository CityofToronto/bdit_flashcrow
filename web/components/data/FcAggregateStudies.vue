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
            <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
              {{item.n}}
              <span
                v-if="hasFiltersStudy"
                class="body-1">
                / {{item.nUnfiltered}}
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="shading pt-1">
            <div
              v-for="(location, j) in locations"
              :key="i + '_' + j"
              class="d-flex pa-3 pr-8"
              :class="{
                'data-empty': itemsPerLocation[i][j].mostRecent === null,
              }">
              <FcIconLocationMulti v-bind="locationsIconProps[j]" />
              <div
                class="body-1 flex-grow-1 flex-shrink-1"
                :class="{
                  'pl-4': locationsIconProps[j].midblock,
                  'pl-5': !locationsIconProps[j].midblock,
                }">
                <div
                  :class="{
                    'body-1': locationsIconProps[j].locationIndex === -1,
                    title: locationsIconProps[j].locationIndex !== -1,
                  }">
                  {{location.description}}
                </div>
                <div
                  v-if="itemsPerLocation[i][j].mostRecent !== null"
                  class="mt-2 secondary--text">
                  <span>
                    Most Recent
                    {{itemsPerLocation[i][j].mostRecent.startDate | date}}
                    ({{itemsPerLocation[i][j].mostRecent.startDate | dayOfWeek}})
                    &#x2022;
                    <span v-if="itemsPerLocation[i][j].mostRecent.duration !== null">
                      {{itemsPerLocation[i][j].mostRecent.duration | durationHuman}}
                      ({{item.mostRecent.duration}} hrs)
                    </span>
                    <span
                      v-else-if="itemsPerLocation[i][j].mostRecent.hours !== null"
                      :title="itemsPerLocation[i][j].mostRecent.hours.hint">
                      {{itemsPerLocation[i][j].mostRecent.hours.description}}
                    </span>
                  </span>
                </div>
              </div>
              <v-spacer></v-spacer>
              <div class="display-1 flex-grow-0 flex-shrink-0 mr-5">
                <div class="text-right">
                  {{itemsPerLocation[i][j].n}}
                  <span
                    v-if="hasFiltersStudy"
                    class="body-1">
                    / {{itemsPerLocation[i][j].nUnfiltered}}
                  </span>
                </div>
                <div v-if="itemsPerLocation[i][j].nUnfiltered > 0">
                  <FcButton
                    class="mr-n4 mt-2"
                    type="tertiary"
                    @click="$emit('show-reports', j)">
                    <span>View Reports</span>
                  </FcButton>
                </div>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcAggregateStudies',
  components: {
    FcButton,
    FcIconLocationMulti,
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
