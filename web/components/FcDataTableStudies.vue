<template>
  <div class="fc-data-table-studies">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else-if="studySummaryUnfiltered.length === 0"
      class="my-8 py-12 secondary--text text-center">
      There are no studies for this location,<br>
      please request a study if necessary
    </div>
    <div
      v-else-if="studySummary.length === 0"
      class="my-8 py-12 secondary--text text-center">
      No studies match the active filters,<br>
      clear one or more filters to see studies
    </div>
    <template v-else>
      <div
        v-for="item in items"
        :key="item.category.id"
        class="ml-5">
        <div class="align-center d-flex mb-4 pr-5">
          <div class="flex-grow-1 flex-shrink-1 font-weight-regular title">
            <div v-if="item.category.studyType === null">
              Unknown
            </div>
            <div v-else>
              {{item.category.studyType.label}}
            </div>
            <div class="mt-2 secondary--text">
              <span v-if="item.mostRecent === null">
                No studies
              </span>
              <span v-else>
                Most Recent
                {{item.mostRecent.startDate | date}} ({{item.mostRecent.startDate | dayOfWeek}})
                &#x2022;
                <span v-if="item.mostRecent.duration !== null">
                  {{item.mostRecent.duration | durationHuman}} ({{item.mostRecent.duration}} hrs)
                </span>
                <span
                  v-else-if="item.mostRecent.hours !== null"
                  :title="item.mostRecent.hours.hint">
                  {{item.mostRecent.hours.description}}
                </span>
              </span>
            </div>
          </div>
          <div class="fc-studies-n flex-grow-0 flex-shrink-0 mr-8">
            <div class="display-2">
              {{item.n}}
              <span
                v-if="hasFiltersStudy"
                class="font-weight-regular title">
                / {{item.nUnfiltered}}
              </span>
            </div>
          </div>
          <FcButton
            class="flex-grow-0 flex-shrink-0"
            v-if="item.category.studyType !== null"
            type="tertiary"
            @click="$emit('show-reports', item)">
            <span>View Reports</span>
          </FcButton>
        </div>
        <v-divider></v-divider>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDataTableStudies',
  components: {
    FcButton,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    studySummary: Array,
    studySummaryUnfiltered: Array,
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
    ...mapGetters('viewData', ['hasFiltersStudy']),
  },
};
</script>

<style lang="scss">
.fc-data-table-studies {
  .fc-studies-n {
    width: 120px;
  }
}
</style>
