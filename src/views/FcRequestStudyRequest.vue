<template>
  <div class="fc-request-study-request flex-fill flex-container-column">
    <FcCardTableStudiesRequested
      :items="items"
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
                :options="studyTypesWarnDuplicates"
                @action-selected="onAddStudy">
                <span>Request another study</span>
              </TdsActionDropdown>
            </td>
          </tr>
        </tbody>
      </template>
    </FcCardTableStudiesRequested>
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
    items() {
      return this.studyRequest.items.map(({ item: studyType }) => {
        const type = Constants.COUNT_TYPES.find(({ value }) => value === studyType);
        return getStudyTypeItem(this.counts, type);
      });
    },
    ...mapGetters([
      'studyTypesWarnDuplicates',
    ]),
    ...mapState([
      'counts',
      'studyRequest',
    ]),
  },
  methods: {
    onAddStudy(studyType) {
      const studyTypesSelected = new Set(
        this.studyRequest.items.map(({ item }) => item),
      );
      if (studyTypesSelected.has(studyType)) {
        const { label } = Constants.COUNT_TYPES.find(({ value }) => value === studyType);
        // TODO: maybe wrap this into a vuex action?
        this.setModal({
          component: 'TdsConfirmDialog',
          data: {
            title: 'Add Duplicate Study?',
            prompt: `
              You've already added a ${label}.
              Do you want to add another study of that type?`,
            textCancel: 'No, don\'t add it',
            textOk: 'Yes, add it',
            action: () => {
              this.addStudyToStudyRequest(studyType);
            },
          },
        });
      } else {
        this.addStudyToStudyRequest(studyType);
      }
    },
    onRemoveStudy(i) {
      this.removeStudyFromStudyRequest(i);
    },
    ...mapMutations([
      'addStudyToStudyRequest',
      'removeStudyFromStudyRequest',
      'setModal',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-request-study-request {

}
</style>
