<template>
  <FcCardTable
    class="fc-card-table-counts"
    :columns="columns"
    expandable
    :items="itemsCounts"
    :sort-by="sortBy"
    :sort-direction="sortDirection"
    :sort-keys="sortKeys">
    <template v-slot:SELECTION="{ item }">
      <label class="tds-checkbox">
        <input
          type="checkbox"
          name="selectionItems"
          :value="item.counts[item.activeIndex].id"
          v-model="internalValue" />
      </label>
    </template>
    <template v-slot:STUDY_TYPE="{ item }">
      <div
        class="cell-study-type flex-container-row"
        :class="{
          'no-existing': item.counts[item.activeIndex].status === Status.NO_EXISTING_COUNT,
        }"
        @click.prevent="onActionShowReports(item)">
        <u v-if="item.counts[item.activeIndex].status !== Status.NO_EXISTING_COUNT">
          {{item.counts[item.activeIndex].type.label}}
        </u>
        <span v-else>{{item.counts[item.activeIndex].type.label}}</span>
        <div class="flex-fill"></div>
        <button
          class="font-size-m ml-m"
          :disabled="item.counts[item.activeIndex].status === Status.NO_EXISTING_COUNT">
          <span>View </span>
          <i class="fa fa-expand"></i>
        </button>
      </div>
    </template>
    <template v-slot:DATE="{ item }">
      <TdsActionDropdown
        v-if="item.counts[item.activeIndex].date"
        class="font-size-m"
        :options="optionsCounts(item)"
        @action-selected="activeIndex => onSelectActiveIndex(item, activeIndex)">
        <template v-slot:default>
          <span>
            {{item.counts[item.activeIndex].date | date}}
          </span>
        </template>
      </TdsActionDropdown>
      <span v-else class="text-muted">
        N/A
      </span>
    </template>
    <template v-slot:DAY="{ item }">
      <span v-if="item.counts[item.activeIndex].date">
        {{item.counts[item.activeIndex].date | dayOfWeek}}
      </span>
      <span v-else class="text-muted">
        N/A
      </span>
    </template>
    <template v-slot:STATUS="{ item }">
      <span
        class="full-width tds-label uppercase"
        :class="'tds-label-' + STATUS_META[item.counts[item.activeIndex].status].class">
        <i
          class="fa"
          :class="'fa-' + STATUS_META[item.counts[item.activeIndex].status].icon"></i>
        <span> {{STATUS_META[item.counts[item.activeIndex].status].label}}</span>
      </span>
    </template>
    <template v-slot:ACTIONS="{ item }">
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
    </template>
    <template v-slot:__expanded="{ item }">
      <div class="mb-m text-muted">
        <strong>Request # not known</strong>
      </div>
      <div class="flex-container-row">
        <div class="flex-1">
          <strong>Requested By:</strong><br />
          <span class="text-muted">N/A</span>
        </div>
        <div class="flex-1">
          <strong>Days:</strong><br />
          <span>
            {{item.counts[item.activeIndex].date | dayOfWeek}}
          </span>
        </div>
        <div
          v-if="item.counts[item.activeIndex].type.automatic"
          class="flex-1">
          <strong>Duration:</strong><br />
          <span>
            {{item.counts[item.activeIndex].duration}}
          </span>
        </div>
        <div
          v-else
          class="flex-1">
          <strong>Hours:</strong><br />
          <span>
            {{item.counts[item.activeIndex].hours}}
          </span>
        </div>
        <div
          v-if="item.counts[item.activeIndex].notes"
          class="flex-1">
          <strong>Additional Notes:</strong><br />
          <span>
            {{item.counts[item.activeIndex].notes}}
          </span>
        </div>
        <div
          v-else
          class="flex-1">
          <span class="text-muted">No additional notes</span>
        </div>
      </div>
    </template>
  </FcCardTable>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcCardTable from '@/components/FcCardTable.vue';
import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import Constants from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcCardTableCounts',
  components: {
    FcCardTable,
    TdsActionDropdown,
  },
  props: {
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
      name: 'DAY',
      sortable: true,
      title: 'Day',
    }, {
      name: 'STATUS',
      sortable: true,
      title: 'Status',
    }, {
      name: 'ACTIONS',
    }];
    const sortKeys = {};
    Object.entries(Constants.SortKeys.Counts)
      .forEach(([name, sortKey]) => {
        sortKeys[name] = ({ activeIndex, counts }) => sortKey(counts[activeIndex]);
      });
    return {
      columns,
      sortBy: 'STUDY_TYPE',
      sortDirection: Constants.SortDirection.ASC,
      sortKeys,
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
    ...mapGetters(['itemsCounts']),
    ...mapState(['numPerCategory']),
  },
  methods: {
    onActionShowReports(item) {
      if (item.status === Constants.Status.NO_EXISTING_COUNT) {
        return;
      }
      this.$emit('action-item', { type: 'show-reports', item });
    },
    onSelectActiveIndex(item, activeIndex) {
      this.setItemsCountsActive({
        value: item.id,
        activeIndex,
      });
    },
    optionsCounts(item) {
      const options = item.counts.map((count, i) => {
        const label = TimeFormatters.formatDefault(count.date);
        return { label, value: i };
      });
      return options;
    },
    ...mapMutations(['setItemsCountsActive']),
  },
};
</script>

<style lang="postcss">
.fc-card-table-counts {
  & > colgroup {
    & > .col-SELECTION {
      width: var(--space-xl);
    }
  }
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
  .cell-DATE {
    & > button.tds-action-dropdown > .dropdown {
      width: 120px;
    }
  }
  .cell-ACTIONS {
    & > button {
      opacity: 0;
      &:not(:last-child) {
        margin-right: var(--space-s);
      }
    }
  }
  tr:hover > .cell-ACTIONS > button {
    opacity: 1;
  }
}
</style>
