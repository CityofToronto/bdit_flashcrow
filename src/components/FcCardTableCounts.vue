<template>
  <FcCardTable
    v-model="selection"
    class="fc-card-table-counts"
    :columns="columns"
    expandable
    :sections="sections"
    sort-by="STUDY_TYPE"
    :sort-keys="sortKeys">
    <template v-slot:children-empty="{ item }">
      <span class="text-muted">
        No older counts available.
      </span>
    </template>
    <template v-slot:SELECTION="{ item }">
      <label class="tds-checkbox">
        <input
          type="checkbox"
          name="selectionItems"
          :value="item.id"
          v-model="selection" />
      </label>
    </template>
    <template v-slot:STUDY_TYPE="{ item }">
      <a
        v-if="item.status !== Status.NO_EXISTING_COUNT"
        href="#"
        @click.prevent="$emit('foo')">
        {{item.type.label}}
      </a>
      <span v-else>{{item.type.label}}</span>
    </template>
    <template v-slot:DATE="{ item, children }">
      <span v-if="item.date">
        <span>{{item.date | date}}</span>
        <template v-if="children !== null && children.length > 0">
          <br />
          <small class="text-muted">+{{children.length}} older</small>
        </template>
      </span>
      <span v-else class="text-muted">
        N/A
      </span>
    </template>
    <template v-slot:STATUS="{ item, isChild, children }">
      <span v-if="isChild">Historical</span>
      <span
        v-else
        :class="{
          'no-existing-count': item.status === Status.NO_EXISTING_COUNT,
        }">
        <i v-if="item.status === Status.NO_EXISTING_COUNT" class="fa fa-exclamation-triangle"></i>
        <span> {{STATUS_META[item.status]}}</span>
      </span>
    </template>
    <template v-slot:ACTIONS="{ item }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-l"
          :disabled="item.status === Status.NO_EXISTING_COUNT">
          <i class="fa fa-download"></i>
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
      name: 'SELECTION',
    }, {
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
      sortDirection: Constants.SortDirection.ASC,
      sortKeys: Constants.SortKeys.Counts,
      Status: Constants.Status,
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
      return Constants.COUNT_TYPES.map((type) => {
        const countsOfType = this.countsFiltered
          .filter(c => c.type.value === type.value);
        if (countsOfType.length === 0) {
          return {
            item: {
              id: type.value,
              type,
              date: null,
              status: Constants.Status.NO_EXISTING_COUNT,
            },
            children: null,
          };
        }
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          Constants.SortKeys.Counts.DATE,
          Constants.SortDirection.DESC,
        );
        const item = countsOfTypeSorted[0];
        const children = countsOfTypeSorted.slice(1);
        return { item, children };
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
