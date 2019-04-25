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
          <input type="checkbox" checked disabled />
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
            Delete <i class="fa fa-trash-alt"></i>
          </button>
        </td>
      </tr>
      <tr v-if="optionsCountTypes.length > 0" class="row-request-another">
        <td>
          <i class="fa fa-plus-circle" @click="$refs.requestAnother.onSearchFocus()"></i>
        </td>
        <td colspan="4">
          <v-select
            ref="requestAnother"
            v-model="requestAnother"
            class="form-select request-another"
            :options="optionsCountTypes"
            placeholder="Request another study" />
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
  border-spacing: 0 calc(var(--sp) * 2);
  width: 100%;
  & > caption {
    caption-side: top;
    padding-bottom: calc(var(--sp) * 2);
  }
  & > thead {
    font-size: var(--text-xl);
    & > tr > th {
      padding: calc(var(--sp) * 2);
      text-align: left;
      &.selectable {
        cursor: pointer;
        &.selected,
        &.selected:hover {
          background-color: var(--light-green);
          color: var(--green);
        }
        &:hover {
          background-color: var(--light-blue);
          color: var(--blue);
        }
      }
    }
  }
  & > tbody {
    font-size: var(--text-md);
    & > tr {
      background-color: var(--white);
      cursor: pointer;
      &.row-request-another {
        & > td:first-child {
          font-size: var(--text-xxl);
        }
      }
      & > td {
        padding: calc(var(--sp) * 2);
        border-top: 1px solid var(--outline-grey);
        border-bottom: 1px solid var(--outline-grey);
        &:first-child {
          border-left: 4px solid var(--outline-grey);
        }
        &:last-child {
          border-right: 1px solid var(--outline-grey);
        }
        & > .btn-remove-count {
          margin-right: calc(var(--sp) * 2);
        }
      }
    }
  }
}
</style>
