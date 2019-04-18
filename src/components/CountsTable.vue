<template>
  <table class="counts-table">
    <caption>{{caption}}</caption>
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th>Count</th>
        <th>Date</th>
        <th>Status</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="count in countsSections"
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

const STATUS_META = [
  'Recent',
  '3+ years old',
  'Not in system',
  'Requested',
];

export default {
  name: 'CountsTable',
  props: {
    counts: Array,
  },
  data() {
    return {
      STATUS_META,
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
      if (this.filterCountTypes.length === 0) {
        return this.counts;
      }
      const values = this.filterCountTypes.map(type => type.value);
      return this.counts.filter(c => values.includes(c.type.value));
    },
    countsSections() {
      // group by type
      const countsByType = ArrayUtils.groupBy(this.countsFiltered, c => c.type.value);
      // sort groups by date
      return countsByType.map(
        countsOfType => ArrayUtils.getMaxBy(countsOfType, (c) => {
          if (c.date === null) {
            return -Infinity;
          }
          return -c.date.valueOf();
        }),
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
      text-align: left;
    }
  }
  & > tbody {
    font-size: var(--text-md);
    & > tr {
      background-color: var(--white);
      cursor: pointer;
      & > td {
        padding: calc(var(--sp) * 2) 0;
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
