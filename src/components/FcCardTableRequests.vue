<template>
  <FcCardTable
    class="fc-card-table-requests"
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
    <template v-slot:ID="{ item }">
      <span>{{item.id}}</span>
    </template>
    <template v-slot:LOCATION="{ item }">
      <span>Kingston and Lee</span>
    </template>
    <template v-slot:STUDY_TYPES="{ item, children }">
      <span>TODO: item type</span>
    </template>
    <template v-slot:DATE="{ item }">
      <span>{{item.dueDate | date}}</span>
    </template>
    <template v-slot:PRIORITY="{ item }">
      <span>{{item.priority}}</span>
    </template>
    <template v-slot:REQUESTER="{ item }">
      <span>TODO: requester</span>
    </template>
    <template v-slot:STATUS="{ item }">
      <span
        class="full-width tds-label uppercase"
        :class="'tds-label-' + REQUEST_STATUS_META[item.status].class">
        {{REQUEST_STATUS_META[item.status].label}}
      </span>
    </template>
    <template v-slot:ACTIONS="{ item }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-m"
          @click="$emit('action-item', {
            type: 'review',
            item,
          })">
          <i class="fa fa-eye"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          @click="$emit('action-item', {
            type: 'accept',
            item,
          })">
          <i class="fa fa-check-square"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          @click="$emit('action-item', {
            type: 'flag',
            item,
          })">
          <i class="fa fa-flag"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          @click="$emit('action-item', {
            type: 'assign',
            item,
          })">
          <i class="fa fa-user"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          @click="$emit('action-item', {
            type: 'export',
            item,
          })">
          <i class="fa fa-external-link-square-alt"></i>
        </button>
      </div>
    </template>
  </FcCardTable>
</template>

<script>
import FcCardTable from '@/components/FcCardTable.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcCardTableRequests',
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
      name: 'ID',
      sortable: true,
      title: 'ID#',
    }, {
      icon: 'map-marker-alt',
      name: 'LOCATION',
      sortable: true,
      title: 'Location',
    }, {
      name: 'DATE',
      sortable: true,
      title: 'Due Date',
    }, {
      icon: 'exclamation',
      name: 'PRIORITY',
      sortable: true,
      title: 'Priority',
    }, {
      icon: 'envelope',
      name: 'REQUESTER',
      sortable: true,
      title: 'Requester',
    }, {
      name: 'STATUS',
      sortable: true,
      title: 'Status',
    }, {
      name: 'ACTIONS',
    }];
    return {
      columns,
      sortBy: 'PRIORITY',
      sortDirection: Constants.SortDirection.ASC,
      sortKeys: Constants.SortKeys.Requests,
      RequestStatus: Constants.RequestStatus,
      REQUEST_STATUS_META: Constants.REQUEST_STATUS_META,
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
.fc-card-table-requests {
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
