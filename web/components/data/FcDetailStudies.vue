<template>
  <div class="fc-detail-studies">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else-if="studySummaryUnfiltered.length === 0"
      class="my-8 py-12 secondary--text text-center">
      There are no studies for this location,<br>
      please request a study if necessary
    </div>
    <template v-else>
      <div
        v-for="(item, i) in items"
        :key="item.category.id"
        class="ml-5">
        <v-divider v-if="i > 0"></v-divider>
        <div class="align-center d-flex mb-4 pr-5">
          <div class="body-1 flex-grow-1 flex-shrink-1">
            <div v-if="item.category.studyType === null">
              Unknown
            </div>
            <div v-else>
              {{item.category.studyType.label}}
            </div>
            <FcTextMostRecent
              v-if="item.mostRecent !== null"
              class="mt-2"
              :study="item.mostRecent" />
          </div>
          <div class="fc-studies-n flex-grow-0 flex-shrink-0 mr-8">
            <FcTextSummaryFraction
              :a="item.n"
              :b="item.nUnfiltered"
              :show-b="hasFiltersStudy" />
          </div>
          <FcButton
            class="flex-grow-0 flex-shrink-0"
            :disabled="item.category.studyType === null || item.n === 0"
            type="tertiary"
            @click="$emit('show-reports', item)">
            <span>View Reports</span>
          </FcButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDetailStudies',
  components: {
    FcButton,
    FcTextMostRecent,
    FcTextSummaryFraction,
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
.fc-detail-studies {
  & .fc-studies-n {
    width: 120px;
  }
}
</style>
