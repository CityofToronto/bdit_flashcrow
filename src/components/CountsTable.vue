<template>
  <table class="counts-table">
    <caption>{{caption}}</caption>
    <colgroup>
      <col style="width: 50px;">
      <col>
      <col>
      <col>
      <col style="width: 40px;">
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
        v-for="count in countsSectionsSorted"
        :key="count.type.value"
        :class="{
          'not-in-system': count.status === 2,
          selected: dataSelectionContains(count),
        }"
        @click="onClickSelectCount(count)">
        <td>
          <input type="checkbox" :checked="dataSelectionContains(count)" />
        </td>
        <td>{{count.type.label}}</td>
        <td>
          <span v-if="count.date">{{count.date | date}}</span>
          <span v-else class="text-muted">
            N/A
            <i class="fa fa-exclamation-triangle"></i>
          </span>
        </td>
        <td>{{STATUS_META[count.status]}}</td>
        <td><i class="fa fa-ellipsis-h"></i></td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'CountsTable',
  props: {
    counts: Array,
  },
  data() {
    return {
      sortBy: 'COUNT',
      sortDirection: 1,
      STATUS_META: Constants.STATUS_META,
    };
  },
  computed: {
    caption() {
      const n = this.countsSections.length;
      if (n === 0) {
        return 'No results';
      }
      if (n === 1) {
        return '1 result';
      }
      return `${n} results`;
    },
    countsFiltered() {
      const values = this.filterCountTypes
        .map(i => Constants.COUNT_TYPES[i].value);
      return this.counts.filter(c => values.includes(c.type.value));
    },
    countsSections() {
      // group by type
      const countsByType = ArrayUtils.groupBy(this.countsFiltered, c => c.type.value);
      // sort groups by date
      return countsByType.map(
        countsOfType => ArrayUtils.getMaxBy(countsOfType, Constants.SORT_KEYS.DATE),
      );
    },
    countsSectionsSorted() {
      return ArrayUtils.sortBy(
        this.countsSections,
        Constants.SORT_KEYS[this.sortBy],
        this.sortDirection,
      );
    },
    ...mapState(['filterCountTypes', 'filterDate']),
    ...mapGetters(['dataSelectionContains']),
  },
  methods: {
    onClickSelectCount(count) {
      if (this.dataSelectionContains(count)) {
        this.removeFromDataSelection(count);
      } else {
        this.addToDataSelection(count);
      }
    },
    onClickSortBy(sortBy) {
      if (sortBy !== this.sortBy) {
        this.sortBy = sortBy;
        this.sortDirection = 1;
      } else {
        this.sortDirection = -this.sortDirection;
      }
    },
    ...mapActions(['addToDataSelection', 'removeFromDataSelection']),
  },
};
</script>

<style lang="postcss">
.counts-table {
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
      }
      &:hover > td {
        border-color: var(--outline-grey-focus);
      }
      &.not-in-system {
        background-color: var(--light-yellow);
        & > td {
          border-color: var(--yellow);
          color: var(--yellow);
          font-weight: var(--font-bold);
        }
      }
      &.selected,
      &.not-in-system.selected {
        background-color: var(--light-green);
        & > td {
          border-color: var(--green);
          color: var(--green);
        }
      }
    }
  }
}
</style>
