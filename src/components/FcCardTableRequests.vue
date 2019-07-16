<template>
  <FcCardTable
    class="fc-card-table-requests"
    :columns="columns"
    :items="itemsStudyRequests"
    :sort-by="sortBy"
    :sort-direction="sortDirection"
    :sort-keys="sortKeys">
    <template v-slot:SELECTION="{ item, isChild }">
      <label v-if="!isChild" class="tds-checkbox">
        <input
          type="checkbox"
          name="selectionItems"
          :value="item.id"
          v-model="internalValue" />
      </label>
    </template>
    <template v-slot:ID="{ item }">
      <router-link
        :to="{
          name: 'requestStudyView',
          params: { id: item.id },
        }">{{item.id}}</router-link>
    </template>
    <template v-slot:LOCATION="{ item }">
      <span>TODO</span>
    </template>
    <template v-slot:STUDY_TYPES="{ item, children }">
      <span>TODO: item type</span>
    </template>
    <template v-slot:DATE="{ item }">
      <span>{{item.dueDate | date}}</span>
    </template>
    <template v-slot:PRIORITY="{ item }">
      <span
        :class="{
          'priority-urgent': item.priority === 'URGENT',
        }">
        <i
          v-if="item.priority === 'URGENT'"
          class="fa fa-exclamation"></i>
        <span> {{item.priority}}</span>
      </span>
    </template>
    <template v-slot:REQUESTER="{ item }">
      <span>TODO: requester</span>
    </template>
    <template v-slot:STATUS="{ item }">
      <TdsLabel
        :variant="REQUEST_STATUS_VARIANTS[item.status]">
        {{item.status}}
      </TdsLabel>
    </template>
    <template v-slot:ACTIONS="{ item }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-m"
          disabled
          @click="$emit('action-item', {
            type: 'review',
            item,
          })">
          <i class="fa fa-eye"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          disabled
          @click="$emit('action-item', {
            type: 'accept',
            item,
          })">
          <i class="fa fa-check-square"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          disabled
          @click="$emit('action-item', {
            type: 'flag',
            item,
          })">
          <i class="fa fa-flag"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          disabled
          @click="$emit('action-item', {
            type: 'assign',
            item,
          })">
          <i class="fa fa-user"></i>
        </button>
        <button
          class="tds-button-secondary font-size-m"
          disabled
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
import { mapGetters } from 'vuex';

import FcCardTable from '@/components/FcCardTable.vue';
import TdsLabel from '@/components/tds/TdsLabel.vue';
import {
  REQUEST_STATUS_VARIANTS,
  SortDirection,
  SortKeys,
} from '@/lib/Constants';

export default {
  name: 'FcCardTableRequests',
  components: {
    FcCardTable,
    TdsLabel,
  },
  props: {
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
      name: 'LOCATION',
      sortable: true,
      title: 'Location',
    }, {
      name: 'DATE',
      sortable: true,
      title: 'Due Date',
    }, {
      name: 'PRIORITY',
      sortable: true,
      title: 'Priority',
    }, {
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
      sortDirection: SortDirection.ASC,
      sortKeys: SortKeys.Requests,
      REQUEST_STATUS_VARIANTS,
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
    ...mapGetters(['itemsStudyRequests']),
  },
};
</script>

<style lang="postcss">
.fc-card-table-requests {
  .priority-urgent {
    color: var(--error);
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
