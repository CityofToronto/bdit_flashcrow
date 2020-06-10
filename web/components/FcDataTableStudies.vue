<template>
  <FcDataTable
    class="fc-data-table-studies"
    :columns="columns"
    disable-sort
    :loading="loading"
    :items="studySummary">
    <template v-slot:item.STUDY_REPORTS="{ item }">
      <span v-if="item.category.studyType === null">
        Unknown
      </span>
      <span v-else>
        {{item.category.studyType.label}}
      </span>
      <span
        v-if="item.n > 1"
        class="secondary--text">
        &#x2022; {{item.n}}
      </span>
    </template>
    <template v-slot:item.DATE="{ item }">
      <span>
        {{item.mostRecent.startDate | date}} ({{item.mostRecent.startDate | dayOfWeek}})
      </span>
    </template>
    <template v-slot:item.HOURS="{ item }">
      <span v-if="item.mostRecent.duration !== null">
        {{item.mostRecent.duration | durationHuman}} ({{item.mostRecent.duration}} hrs)
      </span>
      <span
        v-else-if="item.mostRecent.hours !== null"
        :title="item.mostRecent.hours.hint">
        {{item.mostRecent.hours.description}}
      </span>
    </template>
    <template v-slot:header.VIEW_REPORT>
      <span class="sr-only">Reports</span>
    </template>
    <template v-slot:item.VIEW_REPORT="{ item }">
      <FcButton
        v-if="item.category.studyType !== null"
        type="tertiary"
        @click="$emit('show-reports', item)">
        <span>View Reports</span>
      </FcButton>
    </template>
  </FcDataTable>
</template>

<script>
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDataTableStudies',
  components: {
    FcButton,
    FcDataTable,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    studySummary: Array,
  },
  data() {
    const columns = [{
      value: 'STUDY_REPORTS',
      text: 'Study Reports',
    }, {
      value: 'DATE',
      text: 'Most Recent Date',
    }, {
      value: 'HOURS',
      text: 'Most Recent Hours',
    }, {
      align: 'end',
      value: 'VIEW_REPORT',
      text: ' ',
    }];
    return {
      columns,
    };
  },
};
</script>

<style lang="scss">
.fc-data-table-studies {
  & th:first-child,
  & td:first-child {
    padding-left: 20px;
  }
  & th:last-child,
  & td:last-child {
    padding-right: 20px;
  }
}
</style>
