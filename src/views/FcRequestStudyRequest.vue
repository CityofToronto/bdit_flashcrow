<template>
  <div class="fc-request-study-request flex-fill flex-container-column">
    <FcCardTableStudiesRequested
      :sections="sections"
      @remove-study="onRemoveStudy">
      <template v-slot:__footer="{ numTableColumns, sectionsNormalized }">
        <tr
          v-if="sectionsNormalized.length > 0"
          class="fc-card-table-spacer">
          <td :colspan="numTableColumns"></td>
        </tr>
        <tbody>
          <tr>
            <td><i class="px-xs font-size-xl fa fa-plus-circle"></i></td>
            <td :colspan="numTableColumns - 1">
              <TdsActionDropdown
                class="full-width font-size-l"
                :options="studyTypesUnselectedFirst"
                @action-selected="onAddStudy">
                <span>Request another study</span>
              </TdsActionDropdown>
            </td>
          </tr>
        </tbody>
      </template>
    </FcCardTableStudiesRequested>
    <div class="flex-container-row">

    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcCardTableStudiesRequested from '@/components/FcCardTableStudiesRequested.vue';
import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

function getStudyTypeItem(counts, type) {
  const countsOfType = counts.filter(c => c.type.value === type.value);
  if (countsOfType.length === 0) {
    return {
      id: type.value,
      type,
      date: null,
      status: Constants.Status.NO_EXISTING_COUNT,
    };
  }
  const { date, status } = ArrayUtils.getMaxBy(
    countsOfType,
    Constants.SortKeys.Counts.DATE,
  );
  return {
    id: type.value,
    type,
    date,
    status,
  };
}

export default {
  name: 'FcRequestStudyRequest',
  components: {
    FcCardTableStudiesRequested,
    TdsActionDropdown,
  },
  computed: {
    sections() {
      return this.studyRequest.items.map(({ item: studyType }) => {
        const type = Constants.COUNT_TYPES.find(({ value }) => value === studyType);
        const item = getStudyTypeItem(this.counts, type);
        return { item, children: null };
      });
    },
    ...mapGetters([
      'studyTypesUnselectedFirst',
    ]),
    ...mapState([
      'counts',
      'studyRequest',
    ]),
  },
  methods: {
    onAddStudy(studyType) {
      this.addStudyToStudyRequest(studyType);
    },
    onRemoveStudy(i) {
      this.removeStudyFromStudyRequest(i);
    },
    ...mapMutations([
      'addStudyToStudyRequest',
      'removeStudyFromStudyRequest',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-request-study-request {
  & > .btn-request-data {
    width: 100%;
  }
}
</style>
