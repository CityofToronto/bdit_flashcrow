<template>
  <FcCardTable
    v-model="selection"
    class="fc-card-table-counts"
    :columns="columns"
    expandable
    :sections="sections"
    :sort-by="sortBy"
    :sort-direction="sortDirection"
    :sort-keys="sortKeys">
    <template v-slot:SELECTION="{ item }">
      <label class="tds-checkbox">
        <input
          type="checkbox"
          name="selectionItems"
          :value="item.id"
          v-model="internalValue" />
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
          :disabled="item.status === Status.NO_EXISTING_COUNT"
          @click="$emit('action-item', {
            type: 'download',
            item,
            options: { formats: ['CSV'] },
          })">
          <i class="fa fa-download"></i>
        </button>
        <button
          class="tds-button-secondary font-size-l"
          @click="$emit('action-item', {
            type: 'request-study',
            item,
          })">
          <i class="fa fa-plus-circle"></i>
        </button>
      </div>
    </template>
  </FcCardTable>
</template>

<script>
import FcCardTable from '@/components/FcCardTable.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcCardTableCounts',
  components: {
    FcCardTable,
  },
  props: {
    sections: Array,
    value: Array,
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
      sortBy: 'STUDY_TYPE',
      sortDirection: Constants.SortDirection.ASC,
      sortKeys: Constants.SortKeys.Counts,
      Status: Constants.Status,
      STATUS_META: Constants.STATUS_META,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
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
