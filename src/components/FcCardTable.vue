<template>
  <table class="fc-card-table">
    <caption v-if="caption">{{caption}}</caption>
    <colgroup>
      <!-- DATA COLUMNS -->
      <col
        v-for="column in columnsNormalized"
        :key="'col-' + column.name"
        :class="'col-' + column.name">
      <!-- EXPAND TOGGLE -->
      <col v-if="expandable" class="col-expand">
    </colgroup>
    <thead>
      <tr>
        <!-- DATA COLUMNS -->
        <th
          v-for="column in columnsNormalized"
          :key="column.name"
          class="font-size-l text-left"
          :class="column.headerClasses"
          @click="onClickColumnHeader(column)">
          <i
            v-if="column.icon !== null"
            class="fa"
            :class="'fa-' + column.icon"></i>
          <span> {{column.title}}</span>
          <i
            v-if="column.sortable"
            class="fa"
            :class="{
              'fa-sort': !column.sorted,
              'fa-sort-up': column.sorted && internalSortDirection === SortDirection.ASC,
              'fa-sort-down': column.sorted && internalSortDirection === SortDirection.DESC,
            }"></i>
        </th>
        <!-- EXPAND TOGGLE -->
        <th
          v-if="expandable"
          class="font-size-xl text-left">&nbsp;</th>
      </tr>
    </thead>
    <template
      v-for="(item, i) in itemsNormalized">
      <tr
        :key="'spacer-' + i"
        v-if="i > 0"
        class="fc-card-table-spacer">
        <td :colspan="numTableColumns"></td>
      </tr>
      <tbody
        :key="item.id"
        :class="{
          expanded: expandable && expanded === item.id
        }">
        <tr>
          <!-- DATA COLUMNS -->
          <td
            v-for="column in columnsNormalized"
            :key="column.name"
            :class="'cell-' + column.name">
            <slot
              :name="column.name"
              v-bind="{ column, index: i, item }"></slot>
          </td>
          <!-- EXPAND TOGGLE -->
          <td
            v-if="expandable"
            class="cell-expand">
            <button
              class="tds-button-secondary font-size-l"
              :disabled="!item.expandable"
              @click="onClickItemExpand(item)">
              <i class="fa fa-chevron-circle-down"></i>
            </button>
          </td>
        </tr>
        <template v-if="expandable && expanded === item.id">
          <tr>
            <td :colspan="numTableColumns">
              <slot
                name="__expanded"
                v-bind="{ item }"></slot>
            </td>
          </tr>
        </template>
      </tbody>
    </template>
    <slot name="__footer" v-bind="{ numTableColumns, items: itemsNormalized }"></slot>
  </table>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'FcCardTable',
  props: {
    caption: {
      type: String,
      default: null,
    },
    columns: Array,
    expandable: {
      type: Boolean,
      default: false,
    },
    items: Array,
    sortBy: {
      type: String,
      default: null,
    },
    sortDirection: {
      type: Number,
      default: Constants.SortDirection.ASC,
    },
    sortKeys: {
      type: Object,
      default() { return {}; },
    },
  },
  data() {
    return {
      expanded: null,
      internalSortBy: this.sortBy,
      internalSortDirection: this.sortDirection,
      SortDirection: Constants.SortDirection,
    };
  },
  computed: {
    columnsNormalized() {
      return this.columns.map((column) => {
        const { name } = column;
        let { icon, title } = column;
        icon = icon || null;
        title = title || ' ';

        const sortKey = this.sortKeys[name] || null;
        const sortable = sortKey !== null;
        const sorted = name === this.internalSortBy;
        const headerClasses = { sortable, sorted };

        return {
          headerClasses,
          icon,
          name,
          sortable,
          sorted,
          sortKey,
          title,
        };
      });
    },
    itemsNormalized() {
      if (this.internalSortBy === null) {
        return this.items;
      }
      const sortKey = this.sortKeys[this.internalSortBy];
      return ArrayUtils.sortBy(
        this.items,
        item => sortKey(item),
        this.internalSortDirection,
      );
    },
    numTableColumns() {
      const n = this.columns.length;
      return this.expandable ? n + 1 : n;
    },
  },
  methods: {
    onClickColumnHeader(column) {
      if (!column.sortable) {
        return;
      }
      if (this.internalSortBy !== column.name) {
        this.internalSortBy = column.name;
        this.internalSortDirection = Constants.SortDirection.ASC;
      } else {
        this.internalSortDirection = -this.internalSortDirection;
      }
    },
    onClickItemExpand(item) {
      if (this.expanded === item.id) {
        this.expanded = null;
      } else {
        this.expanded = item.id;
      }
    },
  },
};
</script>

<style lang="postcss">
.fc-card-table {
  border-collapse: separate;
  border-spacing: 0;
  margin: var(--space-l) 0;
  width: 100%;
  & > colgroup > .col-expand {
    width: var(--space-xl);
  }
  & > thead {
    & > tr > th {
      &.sortable {
        cursor: pointer;
        &.sorted {
          background-color: var(--base-light);
        }
        &:hover {
          background-color: var(--primary-light);
          color: var(--primary-darker);
        }
      }
      padding: var(--space-m);
      & > span {
        vertical-align: bottom;
      }
      & > i:last-child {
        float: right;
        vertical-align: bottom;
      }
    }
  }
  & > .fc-card-table-spacer {
    height: var(--space-m);
  }
  & > tbody {
    background-color: var(--white);
    box-shadow: var(--shadow-3);
    & > tr {
      & > td {
        padding: var(--space-m);
        &.cell-expand {
          cursor: pointer;
        }
        &:first-child {
          border-left: var(--border-default);
          padding-left: var(--space-l);
        }
        &:last-child {
          border-right: var(--border-default);
          padding-right: var(--space-l);
        }
      }
      &:first-child > td {
        border-top: var(--border-default);
      }
      &:last-child > td {
        border-bottom: var(--border-default);
      }
    }
    &.expanded > tr:first-child {
      background-color: var(--base-lighter);
    }
  }
}
</style>
