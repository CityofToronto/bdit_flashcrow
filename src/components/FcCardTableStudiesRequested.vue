<template>
  <FcCardTable
    class="fc-card-table-studies-requested"
    :columns="columns"
    :sections="sections"
    :sort-by="sortBy"
    :sort-direction="sortDirection"
    :sort-keys="sortKeys">
    <template v-slot:SELECTION>
      <label class="tds-checkbox">
        <input
          type="checkbox"
          checked
          disabled />
      </label>
    </template>
    <template v-slot:STUDY_TYPE="{ item }">
      <a
        v-if="item.status !== Status.NO_EXISTING_COUNT"
        href="#"
        @click.prevent="$emit('action-item', {
          type: 'show-reports',
          item,
        })">
        {{item.type.label}}
      </a>
      <span v-else>{{item.type.label}}</span>
    </template>
    <template v-slot:DATE="{ item }">
      <span v-if="item.date">
        {{item.date | date}}
      </span>
      <span v-else class="text-muted">
        N/A
      </span>
    </template>
    <template v-slot:STATUS="{ item }">
      <span
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
          @click="$emit('action-item', {
            type: 'remove',
            item,
          })">
          <i class="fa fa-trash-alt"></i>
        </button>
      </div>
    </template>
    <template v-slot:__footer="{ numTableColumns, sectionsNormalized }">
      <slot
        name="__footer"
        v-bind="{ numTableColumns, sectionsNormalized }"></slot>
    </template>
  </FcCardTable>
</template>

<script>
import FcCardTable from '@/components/FcCardTable.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcCardTableStudiesRequested',
  components: {
    FcCardTable,
  },
  props: {
    sections: Array,
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
      sortBy: 'STUDY_TYPE',
      sortDirection: Constants.SortDirection.ASC,
      sortKeys: Constants.SortKeys.Counts,
      Status: Constants.Status,
      STATUS_META: Constants.STATUS_META,
    };
  },
};
</script>

<style lang="postcss">
.fc-card-table-studies-requested {
  .no-existing-count {
    color: var(--warning-darker);
  }
}
</style>
