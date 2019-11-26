<template>
  <FcCardTable
    class="fc-card-table-requests"
    :columns="columns"
    :items="itemsStudyRequests"
    :search-keys="searchKeys"
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
      <div
        class="flex-container-row"
        @click.prevent="onActionShowRequest(item)">
        <u>{{item.id}}</u>
      </div>
    </template>
    <template v-slot:LOCATION="{ item }">
      <span
        v-if="item.location === null"
        class="text-muted">
        N/A
      </span>
      <span v-else>
        {{item.location.description}}
      </span>
    </template>
    <template v-slot:REQUESTER="{ item }">
      <span
        v-if="item.requestedBy === null"
        class="text-muted">
        N/A
      </span>
      <span v-else>
        {{item.requestedBy.name}}
      </span>
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
    <template v-slot:STATUS="{ item }">
      <TdsLabel
        v-bind="RequestStatus[item.status]">
        {{item.status}}
      </TdsLabel>
    </template>
    <template v-slot:ACTIONS="{ item }">
      <div class="cell-actions">
        <button
          class="tds-button-secondary font-size-m"
          @click="$emit('action-item', {
            type: 'delete',
            item,
          })">
          <i class="fa fa-trash-alt"></i>
        </button>
      </div>
    </template>
  </FcCardTable>
</template>

<script>
import { mapGetters } from 'vuex';

import FcCardTable from '@/web/components/FcCardTable.vue';
import TdsLabel from '@/web/components/tds/TdsLabel.vue';
import {
  RequestStatus,
  SearchKeys,
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
      title: 'ID#',
    }, {
      name: 'LOCATION',
      title: 'Location',
    }, {
      name: 'REQUESTER',
      title: 'Requested By',
    }, {
      name: 'DATE',
      title: 'Due Date',
    }, {
      name: 'PRIORITY',
      title: 'Priority',
    }, {
      name: 'STATUS',
      title: 'Status',
    }, {
      name: 'ACTIONS',
    }];
    return {
      columns,
      searchKeys: SearchKeys.Requests,
      sortBy: 'ID',
      sortDirection: SortDirection.DESC,
      sortKeys: SortKeys.Requests,
      RequestStatus,
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
  methods: {
    onActionShowRequest(item) {
      this.$router.push({
        name: 'requestStudyView',
        params: { id: item.id },
      });
    },
  },
};
</script>

<style lang="postcss">
.fc-card-table-requests {
  .priority-urgent {
    color: var(--error);
  }
  & > colgroup {
    & > .col-SELECTION {
      width: var(--space-xl);
    }
    & > .col-ID {
      width: var(--space-3xl);
    }
    & > .col-DATE,
    & > .col-PRIORITY {
      width: var(--space-3xl);
    }
    & > .col-STATUS {
      width: calc(var(--space-3xl) * 1.5);
    }
    & > .col-ACTIONS {
      width: var(--space-xl);
    }
  }
  .cell-ID {
    & > div {
      align-items: center;
      cursor: pointer;
      & > u {
        color: var(--primary-vivid);
      }
    }
  }
  .cell-actions {
    & > button:not(:last-child) {
      margin-right: var(--space-s);
    }
  }
}
</style>
