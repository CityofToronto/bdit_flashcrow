<template>
  <FcCardTable
    class="fc-card-table-studies-requested"
    :columns="columns"
    :expandable="false"
    :items="items"
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
        class="full-width tds-label uppercase"
        :class="'tds-label-' + STATUS_META[item.status].class">
        {{STATUS_META[item.status].label}}
      </span>
    </template>
    <template v-slot:ACTIONS="{ index }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-l"
          @click="$emit('remove-study', index)">
          <i class="fa fa-trash-alt"></i>
        </button>
      </div>
    </template>
    <template v-slot:__footer="{ numTableColumns, items }">
      <slot
        name="__footer"
        v-bind="{ numTableColumns, items }"></slot>
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
    items: Array,
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

}
</style>
