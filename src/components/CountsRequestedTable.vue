<template>
  <table class="counts-requested-table">
    <caption>Your selected data</caption>
    <colgroup>
      <col style="width: 50px;">
      <col>
      <col>
      <col>
      <col>
    </colgroup>
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th
          class="selectable"
          :class="{ selected: sortBy === 'COUNT' }"
          @click="onClickSortBy('COUNT')">
          Count
          <i
            class="fa"
            :class="{
              'fa-sort': sortBy !== 'COUNT',
              'fa-sort-up': sortBy === 'COUNT' && sortDirection === 1,
              'fa-sort-down': sortBy === 'COUNT' && sortDirection === -1,
            }"></i>
        </th>
        <th
          class="selectable"
          :class="{ selected: sortBy === 'DATE' }"
          @click="onClickSortBy('DATE')">
          Date
          <i
            class="fa"
            :class="{
              'fa-sort': sortBy !== 'DATE',
              'fa-sort-up': sortBy === 'DATE' && sortDirection === 1,
              'fa-sort-down': sortBy === 'DATE' && sortDirection === -1,
            }"></i>
        </th>
        <th
          class="selectable"
          :class="{ selected: sortBy === 'STATUS' }"
          @click="onClickSortBy('STATUS')">
          Status
          <i
            class="fa"
            :class="{
              'fa-sort': sortBy !== 'STATUS',
              'fa-sort-up': sortBy === 'STATUS' && sortDirection === 1,
              'fa-sort-down': sortBy === 'STATUS' && sortDirection === -1,
            }"></i>
        </th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(count, i) in dataSelectionItemsSorted"
        :key="i">
        <td>
          <label class="tds-checkbox">
            <input
              type="checkbox"
              checked
              disabled />
          </label>
        </td>
        <td>{{count.type.label}}</td>
        <td>
          <span v-if="count.date">{{count.date | date}}</span>
          <span v-else class="text-muted">
            N/A
          </span>
        </td>
        <td>{{STATUS_META[count.status]}}</td>
        <td class="text-right">
          <button
            class="btn-remove-count"
            @click="onClickRemoveCount(count)">
            Remove <i class="fa fa-trash-alt"></i>
          </button>
        </td>
      </tr>
      <tr class="row-request-another">
        <td>
          <i
            v-if="optionsCountTypes.length > 0"
            class="fa fa-plus-circle"
            @click="$refs.requestAnother.onSearchFocus()"></i>
          <i v-else class="fa fa-plus-circle"></i>
        </td>
        <td colspan="4">
          <v-select
            ref="requestAnother"
            v-if="optionsCountTypes.length > 0"
            v-model="requestAnother"
            class="form-select request-another"
            :options="optionsCountTypes"
            placeholder="Request another study" />
          <span v-else>All study types selected.</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'CountsRequestedTable',
  data() {
    return {
      requestAnother: null,
      sortBy: 'COUNT',
      sortDirection: 1,
      STATUS_META: Constants.STATUS_META,
    };
  },
  computed: {
    dataSelectionItemsSorted() {
      return ArrayUtils.sortBy(
        this.dataSelectionItems,
        Constants.SORT_KEYS[this.sortBy],
        this.sortDirection,
      );
    },
    optionsCountTypes() {
      return Constants.COUNT_TYPES.filter(({ value }) => {
        const i = this.dataSelectionItems.findIndex(c => c.type.value === value);
        return i === -1;
      });
    },
    ...mapGetters([
      'dataSelectionContains',
      'dataSelectionItems',
    ]),
    ...mapState(['counts']),
  },
  watch: {
    requestAnother() {
      if (this.requestAnother === null) {
        return;
      }
      const count = ArrayUtils.getMaxBy(
        this.counts.filter(c => c.type.value === this.requestAnother.value),
        Constants.SORT_KEYS.DATE,
      );
      if (!this.dataSelectionContains(count)) {
        this.addToDataSelection(count);
      }
      this.$refs.requestAnother.clearSelection();
      this.requestAnother = null;
    },
  },
  methods: {
    onClickRemoveCount(count) {
      this.removeFromDataSelection(count);
    },
    onClickSortBy(sortBy) {
      if (sortBy !== this.sortBy) {
        this.sortBy = sortBy;
        this.sortDirection = 1;
      } else {
        this.sortDirection = -this.sortDirection;
      }
    },
    ...mapActions([
      'addToDataSelection',
      'removeFromDataSelection',
    ]),
  },
};
</script>

<style lang="postcss">
.counts-requested-table {
  border-collapse: separate;
  border-spacing: 0 var(--space-m);
  width: 100%;
  & > caption {
    caption-side: top;
    padding-bottom: var(--space-m);
  }
  & > thead {
    font-size: var(--font-size-xl);
    & > tr > th {
      padding: var(--space-m);
      text-align: left;
      &.selectable {
        cursor: pointer;
        &.selected,
        &.selected:hover {
          background-color: var(--success-light);
          color: var(--success-darker);
        }
        &:hover {
          background-color: var(--primary-light);
          color: var(--primary-darker);
        }
      }
    }
  }
  & > tbody {
    font-size: var(--font-size-m);
    & > tr {
      background-color: var(--base-lightest);
      cursor: pointer;
      & > td {
        padding: var(--space-m);
        border-top: var(--border-default);
        border-bottom: var(--border-default);
        &:first-child {
          border-left: 4px solid var(--base);
        }
        &:last-child {
          border-right: var(--border-default);
        }
        & > .btn-remove-count {
          margin-right: var(--space-m);
        }
      }
      &.row-request-another {
        background-color: var(--warning-light);
        & > td {
          border-color: var(--warning-darker);
          color: var(--warning-darker);
          &:first-child {
            font-size: var(--font-size-2xl);
          }
        }
      }
    }
  }
}
</style>
