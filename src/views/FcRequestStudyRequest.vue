<template>
  <div class="fc-request-study-request flex-fill flex-container-column">
    <FcCardTableStudiesRequested
      :items="items"
      @remove-study="onRemoveStudy">
      <template v-slot:__footer="{ numTableColumns, items }">
        <tr
          v-if="items.length > 0"
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
import { COUNT_TYPES, SortKeys, Status } from '@/lib/Constants';

function getStudyTypeItem(counts, studies, type, id) {
  const studiesOfType = studies.filter(s => s.studyType === type.value);
  if (studiesOfType.length > 0) {
    const { createdAt } = ArrayUtils.getMaxBy(
      studiesOfType,
      SortKeys.Studies.CREATED_AT,
    );
    return {
      expandable: false,
      id,
      type,
      date: createdAt,
      status: Status.REQUEST_IN_PROGRESS,
    };
  }
  const countsOfType = counts.filter(c => c.type.value === type.value);
  if (countsOfType.length > 0) {
    const { date, status } = ArrayUtils.getMaxBy(
      countsOfType,
      SortKeys.Counts.DATE,
    );
    return {
      expandable: false,
      id,
      type,
      date,
      status,
    };
  }
  return {
    expandable: false,
    id,
    type,
    date: null,
    status: Status.NO_EXISTING_COUNT,
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
      return this.studyRequest.studies.map(({ studyType }, id) => {
        const type = COUNT_TYPES.find(({ value }) => value === studyType);
        return getStudyTypeItem(this.counts, this.studies, type, id);
      });
    },
    ...mapGetters([
      'studyTypesWarnDuplicates',
    ]),
    ...mapState([
      'counts',
      'studies',
      'studyRequest',
    ]),
  },
  methods: {
    onAddStudy(studyType) {
      const studyTypesSelected = new Set(
        this.studyRequest.studies.map(({ studyType: value }) => value),
      );
      if (studyTypesSelected.has(studyType)) {
        const { label } = COUNT_TYPES.find(({ value }) => value === studyType);
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
    onRemoveStudy(item) {
      this.removeStudyFromStudyRequest(item.id);
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
