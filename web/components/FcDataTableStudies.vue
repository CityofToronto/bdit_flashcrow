<template>
  <FcDataTable
    class="fc-data-table-studies"
    :columns="columns"
    disable-sort
    :loading="loading"
    :items="countSummaryOrLoading">
    <template v-slot:item.STUDY_REPORTS="{ item }">
      <span>{{item.count.type.studyType.label}}</span>
    </template>
    <template v-slot:item.DATE="{ item }">
      <span>
        {{item.count.date | date}} ({{item.count.date | dayOfWeek}})
      </span>
    </template>
    <template v-slot:item.HOURS="{ item }">
      <span v-if="item.count.type.studyType.automatic">
        {{item.count.duration | durationHuman}} ({{item.count.duration}} hrs)
      </span>
      <span v-else>
        {{item.count.hours}}
      </span>
    </template>
    <template v-slot:header.VIEW_REPORT>
      <span class="sr-only">Reports</span>
    </template>
    <template v-slot:item.VIEW_REPORT="{ item }">
      <FcButton
        type="tertiary"
        @click="$emit('show-reports', item)">
        <span>View Report</span>
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
    countSummary: Array,
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const columns = [{
      value: 'STUDY_REPORTS',
      text: 'Study Reports',
    }, {
      value: 'DATE',
      text: 'Date',
    }, {
      value: 'HOURS',
      text: 'Hours',
    }, {
      align: 'end',
      value: 'VIEW_REPORT',
      text: ' ',
    }];
    return {
      columns,
    };
  },
  computed: {
    countSummaryOrLoading() {
      if (this.loading) {
        /*
         * The "loading..." text in `<v-data-table>` is only shown when there are no items, so
         * we use this to forcibly show a loading state.
         */
        return [];
      }
      return this.countSummary;
    },
  },
};
</script>
