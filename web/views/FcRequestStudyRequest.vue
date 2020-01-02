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
                :options="studyTypesWithWarnings"
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

import FcCardTableStudiesRequested from '@/web/components/FcCardTableStudiesRequested.vue';
import TdsActionDropdown from '@/web/components/tds/TdsActionDropdown.vue';
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
    ...mapGetters('requestStudy', [
      'studyTypesWithWarnings',
    ]),
    ...mapState('requestStudy', ['studyRequest']),
    ...mapState([
      'counts',
      'studies',
    ]),
  },
  methods: {
    onAddStudy(studyType) {
      const { warning } = this.studyTypesWithWarnings
        .find(({ value }) => value === studyType);
      if (warning === null) {
        this.addStudyToStudyRequest(studyType);
      } else {
        warning.data.action = () => {
          this.addStudyToStudyRequest(studyType);
        };
        this.setModal(warning);
      }
    },
    onRemoveStudy(item) {
      this.removeStudyFromStudyRequest(item.id);
    },
    ...mapMutations('requestStudy', [
      'addStudyToStudyRequest',
      'removeStudyFromStudyRequest',
    ]),
    ...mapMutations([
      'setModal',
    ]),
  },
};
</script>
