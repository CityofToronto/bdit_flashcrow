<template>
  <div class="fc-detail-studies">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View studies data" />
    <p v-else-if="studySummaryUnfiltered.length === 0"></p>
    <template v-else>
      <div
        v-for="(item, i) in items"
        :key="item.studyType.name"
        class="ml-5">
        <v-divider v-if="i > 0"></v-divider>
        <div
          class="align-center d-flex pr-5"
          :class="i === 0 ? 'mb-4' : 'my-4'">
          <div class="body-1 flex-grow-1 flex-shrink-1">
            <div>
              {{item.studyType.label}}
              <FcTextStudyTypeBeta
                class="ml-2"
                small
                :study-type="item.studyType" />
            </div>
            <div class="mt-1">
              <FcTextMostRecent
                v-if="item.mostRecent !== null"
                :study="item.mostRecent" />
            </div>
          </div>
          <div class="fc-studies-n flex-grow-0 flex-shrink-0 mr-8">
            <FcTextSummaryFraction
              :a="item.n"
              :b="item.nUnfiltered"
              :show-b="hasFiltersCommon || hasFiltersStudy" />
          </div>
          <FcButton
            class="flex-grow-0 flex-shrink-0"
            :disabled="!item.studyType.dataAvailable || item.n === 0"
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
import FcTextStudyTypeBeta from '@/web/components/data/FcTextStudyTypeBeta.vue';
import FcTextSummaryFraction from '@/web/components/data/FcTextSummaryFraction.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDetailStudies',
  components: {
    FcButton,
    FcProgressLinear,
    FcTextMostRecent,
    FcTextStudyTypeBeta,
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
    ...mapGetters('viewData', ['hasFiltersCommon', 'hasFiltersStudy']),
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
