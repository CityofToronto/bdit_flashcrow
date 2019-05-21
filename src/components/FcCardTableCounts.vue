<template>
  <FcCardTable
    v-model="selection"
    class="fc-card-table-counts"
    :columns="columns"
    expandable
    :sections="sections"
    sort-by="STUDY_TYPE"
    :sort-keys="sortKeys"
    selectable>
    <template v-slot:STUDY_TYPE="{ row }">
      <a
        v-if="row.status !== 2"
        href="#"
        @click.prevent="$emit('foo')">
        {{row.type.label}}
      </a>
      <span v-else>{{row.type.label}}</span>
    </template>
    <template v-slot:DATE="{ row }">
      <span v-if="row.date">{{row.date | date}}</span>
      <span v-else class="text-muted">
        N/A
      </span>
    </template>
    <template v-slot:STATUS="{ row }">
      <span
        :class="{
          'no-existing-count': row.status === 2,
        }">
        <i v-if="row.status === 2" class="fa fa-exclamation-triangle"></i>
        <span> {{STATUS_META[row.status]}}</span>
      </span>
    </template>
    <template v-slot:ACTIONS="{ row }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-l"
          :disabled="row.status === 2">
          <i class="fa fa-download"></i>
        </button>
        <button
          class="tds-button-secondary font-size-l"
          :disabled="row.status === 2">
          <i class="fa fa-print"></i>
        </button>
        <button
          class="tds-button-secondary font-size-l">
          <i class="fa fa-plus-circle"></i>
        </button>
      </div>
    </template>
  </FcCardTable>
</template>

<script>
import { mapState } from 'vuex';

import FcCardTable from '@/components/FcCardTable.vue';
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'FcCardTableCounts',
  components: {
    FcCardTable,
  },
  props: {
    counts: Array,
  },
  data() {
    const columns = [{
      name: 'STUDY_TYPE',
      sortable: true,
      title: 'Study Type',
    }, {
      name: 'DATE',
      sortable: true,
      title: 'Date',
    }, {
      name: 'STATUS',
      sortable: true,
      title: 'Status',
    }, {
      name: 'ACTIONS',
    }];
    return {
      columns,
      selection: [],
      sortBy: 'COUNT',
      sortDirection: 1,
      sortKeys: Constants.SortKeys.Counts,
      STATUS_META: Constants.STATUS_META,
    };
  },
  computed: {
    countsFiltered() {
      const values = this.filterCountTypes
        .map(i => Constants.COUNT_TYPES[i].value);
      return this.counts.filter(c => values.includes(c.type.value));
    },
    sections() {
      // group by type
      const countsByType = ArrayUtils.groupBy(this.countsFiltered, c => c.type.value);
      // sort groups by date
      return countsByType.map((countsOfType) => {
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          Constants.SortKeys.Counts.DATE,
          Constants.SortDirection.DESC,
        );
        const main = countsOfTypeSorted[0];
        const items = countsOfTypeSorted.slice(1);
        return { main, items };
      });
    },
    ...mapState(['filterCountTypes', 'filterDate']),
  },
};
</script>

<style lang="postcss">
.fc-card-table-counts {
  .cell-actions {
    opacity: 0;
    & > button:not(:last-child) {
      margin-right: var(--space-s);
    }
  }
  tr:hover .cell-actions {
    opacity: 1;
  }
  .no-existing-count {
    color: var(--warning-darker);
  }
}
</style>
