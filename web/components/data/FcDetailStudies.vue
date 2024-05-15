<template>
  <div class="fc-detail-studies mb-2 px-1">
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Detail View studies data" />
    <div v-else-if="studySummaryUnfiltered.length === 0"></div>
    <template v-else>
      <div
        v-for="(item, i) in items"
        :key="item.studyType.name"
        class="ml-1">
        <v-divider v-if="i > 0"></v-divider>
        <div
          class="fc-study-detail-row py-3 ml-3 pl-3 pr-1 align-center d-flex"
          :class="i === 0 ? 'mb-4' : 'my-4'">
          <div class="body-1">
            <div>
              {{item.studyType.label}}
              <FcTextStudyTypeBeta
                class="ml-2"
                small
                :study-type="item.studyType" />
            </div>
            <div class="mt-1">
              <FcTextMostRecent v-if="item.mostRecent !== null" :study="item.mostRecent" minimal/>
            </div>
          </div>
          <div class="fc-studies-n">
            <FcTextSummaryFraction
              :a="item.n"
              :b="item.nUnfiltered"
              :show-b="hasFiltersCommon || hasFiltersStudy" />
          </div>
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <FcButton
                v-on="on"
                width="50px"
                :disabled="!item.studyType.dataAvailable || item.n === 0"
                type="secondary"
                @click="$emit('show-reports', item)">
                <v-icon color="primary" x-large>mdi-chevron-right</v-icon>
              </FcButton>
            </template>
            <span>View Report</span>
          </v-tooltip>
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
  & .fc-study-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 5px;
  }
  & .fc-studies-n {
    width: 60px;
    text-align: center;
  }
}
</style>
