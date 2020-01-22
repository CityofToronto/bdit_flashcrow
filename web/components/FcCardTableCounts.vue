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
      <v-checkbox
        v-model="internalValue"
        name="selectionItems"
        :value="item.counts[item.activeIndex].id"></v-checkbox>
    </template>
    <template v-slot:STUDY_TYPE="{ item }">
      <div
        class="flex-container-row"
        @click.prevent="onActionShowReports(item)">
        <u v-if="item.counts[item.activeIndex].status !== Status.NO_EXISTING_COUNT">
          {{item.counts[item.activeIndex].type.label}}
        </u>
        <span v-else>{{item.counts[item.activeIndex].type.label}}</span>
        <div class="flex-fill"></div>
        <button
          v-if="item.counts[item.activeIndex].status !== Status.NO_EXISTING_COUNT"
          class="font-size-m ml-2 uppercase">
          <v-icon>mdi-dock-window</v-icon>
          <span> Reports</span>
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
        <v-icon>
          mdi-{{STATUS_META[item.counts[item.activeIndex].status].icon}}
        </v-icon>
        <span> {{STATUS_META[item.counts[item.activeIndex].status].label}}</span>
      </span>
    </template>
    <template v-slot:__expanded="{ item }">
      <div class="mb-2 text-muted">
        <span>Request # not known</span>
      </div>
      <div class="flex-container-row">
        <div class="flex-1">
          <span>Requested By:</span>
          <p class="font-size-l">
            <span class="text-muted">N/A</span>
          </p>
        </div>
        <div class="flex-1">
          <span>Days:</span>
          <p class="font-size-l">
            <strong>{{item.counts[item.activeIndex].date | dayOfWeek}}</strong>
          </p>
        </div>
        <div
          v-if="item.counts[item.activeIndex].type.automatic"
          class="flex-1">
          <span>Duration:</span>
          <p class="font-size-l">
            <strong>{{item.counts[item.activeIndex].duration | durationHuman}}</strong><br />
            <small>{{item.counts[item.activeIndex].duration}} hours</small>
          </p>
        </div>
        <div
          v-else
          class="flex-1">
          <span>Hours:</span>
          <p class="font-size-l">
            <strong>{{item.counts[item.activeIndex].hours}}</strong>
          </p>
        </div>
        <div
          v-if="item.counts[item.activeIndex].notes"
          class="flex-1">
          <span>Additional Notes:</span>
          <p class="font-size-l">
            <strong>
              {{item.counts[item.activeIndex].notes}}
            </strong>
          </p>
        </div>
        <div
          v-else
          class="flex-1">
          <span>{{COUNT_NO_ADDITIONAL_NOTES.text}}</span>
        </div>
      </div>
    </template>
  </FcCardTable>
</template>

<script>
import { mapActions } from 'vuex';

import FcCardTable from '@/web/components/FcCardTable.vue';
import TdsActionDropdown from '@/web/components/tds/TdsActionDropdown.vue';
import {
  SortDirection,
  SortKeys,
  Status,
  STATUS_META,
} from '@/lib/Constants';
import { COUNT_NO_ADDITIONAL_NOTES } from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcCardTableCounts',
  components: {
    FcCardTable,
    TdsActionDropdown,
  },
  props: {
    itemsCounts: Array,
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
    }];
    const sortKeys = {};
    Object.entries(SortKeys.Counts)
      .forEach(([name, sortKey]) => {
        sortKeys[name] = ({ activeIndex, counts }) => sortKey(counts[activeIndex]);
      });
    return {
      columns,
      COUNT_NO_ADDITIONAL_NOTES,
      sortBy: 'STUDY_TYPE',
      sortDirection: SortDirection.ASC,
      sortKeys,
      Status,
      STATUS_META,
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
    onActionShowReports(item) {
      const activeCount = item.counts[item.activeIndex];
      if (activeCount.status === Status.NO_EXISTING_COUNT) {
        const { label } = activeCount.type;
        this.setToast({
          variant: 'warning',
          text: `No existing ${label} count(s) to view.`,
        });
        return;
      }
      this.$emit('action-item', { type: 'show-reports', item });
    },
    onSelectActiveIndex(item, activeIndex) {
      this.$emit('action-item', {
        type: 'select-active-index',
        item,
        options: { activeIndex },
      });
    },
    optionsCounts(item) {
      const options = item.counts.map((count, i) => {
        const label = TimeFormatters.formatDefault(count.date);
        return { label, value: i };
      });
      return options;
    },
    ...mapActions(['setToast']),
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
  .cell-STUDY_TYPE {
    & > div {
      align-items: center;
      cursor: pointer;
      & > u {
        color: var(--primary-vivid);
      }
    }
  }
  .cell-DATE {
    & > button.tds-action-dropdown > .dropdown {
      width: 120px;
    }
  }
}
</style>
