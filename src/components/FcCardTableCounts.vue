<template>
  <FcCardTable
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
    <template v-slot:STUDY_TYPE="{ item, children }">
      <div
        class="cell-study-type flex-container-row"
        :class="{
          'no-existing': item.status === Status.NO_EXISTING_COUNT,
        }"
        @click.prevent="onActionShowReports(item, children)">
        <u v-if="item.status !== Status.NO_EXISTING_COUNT">
          {{item.type.label}}
        </u>
        <span v-else>{{item.type.label}}</span>
        <div class="flex-fill"></div>
        <button
          class="font-size-m ml-m"
          :disabled="item.status === Status.NO_EXISTING_COUNT">
          <span>View </span>
          <i class="fa fa-expand"></i>
        </button>
      </div>
    </template>
    <template v-slot:DATE="{ item, children }">
      <span v-if="item.date">
        <span>{{item.date | date}}</span>
        <template v-if="children !== null && numPerCategory[item.type.value] > 1">
          <br />
          <small class="text-muted">+{{numPerCategory[item.type.value] - 1}} older</small>
        </template>
      </span>
      <span v-else class="text-muted">
        N/A
      </span>
    </template>
    <template v-slot:STATUS="{ item }">
      <span
        class="full-width tds-label uppercase"
        :class="'tds-label-' + STATUS_META[item.status].class">
        <i
          class="fa"
          :class="'fa-' + STATUS_META[item.status].icon"></i>
        <span> {{STATUS_META[item.status].label}}</span>
      </span>
    </template>
    <template v-slot:ACTIONS="{ item }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-l"
          @click="$emit('action-item', {
            type: 'request-study',
            item,
          })">
          <i class="fa fa-plus-circle"></i>
        </button>
        <button
          class="tds-button-secondary font-size-l"
          disabled
          @click="$emit('action-item', {
            type: 'download',
            item,
            options: { formats: ['CSV'] },
          })">
          <i class="fa fa-download"></i>
        </button>
        <button
          class="tds-button-secondary font-size-l"
          disabled
          @click="$emit('action-item', {
            type: 'print',
            item,
          })">
          <i class="fa fa-print"></i>
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
    numPerCategory: Object,
    sections: Array,
    value: Array,
  },
  data() {
    const columns = [{
      name: 'SELECTION',
    }, {
      name: 'STUDY_TYPE',
      sortable: true,
      title: 'Study Reports',
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
  methods: {
    onActionShowReports(item, children) {
      if (item.status === Constants.Status.NO_EXISTING_COUNT) {
        return;
      }
      this.$emit('action-card', {
        type: 'show-reports',
        item,
        children,
      });
    },
  },
};
</script>

<style lang="postcss">
.fc-card-table-counts {
  .cell-study-type {
    align-items: center;
    cursor: pointer;
    &.no-existing {
      cursor: not-allowed;
    }
    & > u {
      color: var(--primary-vivid);
    }
    & > button {
      opacity: 0;
    }
    &:hover {
      & > button {
        opacity: 1;
      }
    }
  }
  .cell-actions {
    opacity: 0;
    & > button:not(:last-child) {
      margin-right: var(--space-s);
    }
  }
  tr:hover .cell-actions {
    opacity: 1;
  }
}
</style>
