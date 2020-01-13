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
          <div class="flex-container-row">
            <v-icon v-if="column.icon !== null">mdi-{{column.icon}}</v-icon>
            <span> {{column.title}}</span>
            <div class="flex-fill"></div>
            <template v-if="column.sortable">
              <v-icon v-if="!column.sorted">mdi-arrow-up-down</v-icon>
              <v-icon
                v-else-if="internalSortDirection === SortDirection.ASC">
                mdi-sort-ascending
              </v-icon>
              <v-icon
                v-else-if="internalSortDirection === SortDirection.DESC">
                mdi-sort-descending
              </v-icon>
            </template>
          </div>
          <v-text-field
            v-if="column.searchable"
            v-model="searchBy[column.name]"
            append-icon="mdi-magnify"
            clearable
            dense
            :name="'search_' + column.name"
            @click.stop>
          </v-text-field>
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
              class="font-size-m"
              :title="expanded === item.id ? 'Collapse' : 'Expand'"
              :disabled="!item.expandable"
              @click="onClickItemExpand(item)">
              <v-icon v-if="expanded === item.id">mdi-chevron-up-circle</v-icon>
              <v-icon v-else>mdi-chevron-down-circle</v-icon>
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
import { SortDirection } from '@/lib/Constants';
import ObjectUtils from '@/lib/ObjectUtils';

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
    searchKeys: {
      type: Object,
      default() { return {}; },
    },
    sortBy: {
      type: String,
      default: null,
    },
    sortDirection: {
      type: Number,
      default: SortDirection.ASC,
    },
    sortKeys: {
      type: Object,
      default() { return {}; },
    },
  },
  data() {
    const searchBy = ObjectUtils.map(this.searchKeys, () => null);
    return {
      expanded: null,
      internalSortBy: this.sortBy,
      internalSortDirection: this.sortDirection,
      searchBy,
      SortDirection,
    };
  },
  computed: {
    columnsNormalized() {
      return this.columns.map((column) => {
        const { name } = column;
        let { icon, title } = column;
        icon = icon || null;
        title = title || ' ';

        const searchKey = this.searchKeys[name] || null;
        const searchable = searchKey !== null;
        const searchQuery = this.searchBy[name];

        const sortKey = this.sortKeys[name] || null;
        const sortable = sortKey !== null;
        const sorted = name === this.internalSortBy;

        const headerClasses = { sortable, sorted };

        return {
          headerClasses,
          icon,
          name,
          searchable,
          searchKey,
          searchQuery,
          sortable,
          sorted,
          sortKey,
          title,
        };
      });
    },
    itemsNormalized() {
      const searchFilters = this.columnsNormalized
        .filter(({ searchable, searchQuery }) => searchable && searchQuery !== null)
        .map(({ searchKey, searchQuery: q }) => r => searchKey(q, r));

      let itemsNormalized = this.items;
      if (searchFilters.length > 0) {
        itemsNormalized = itemsNormalized.filter(
          r => searchFilters.every(filter => filter(r)),
        );
      }
      if (this.internalSortBy !== null) {
        const sortKey = this.sortKeys[this.internalSortBy];
        itemsNormalized = ArrayUtils.sortBy(
          itemsNormalized,
          item => sortKey(item),
          this.internalSortDirection,
        );
      }
      this.$emit('update-items-normalized', itemsNormalized);
      return itemsNormalized;
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
        this.internalSortDirection = SortDirection.ASC;
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
  & > thead {
    & > tr > th {
      padding: var(--space-m);
      vertical-align: top;
      &.sortable {
        cursor: pointer;
        &.sorted {
          background-color: var(--base-lighter);
        }
        &:hover {
          background-color: var(--primary-lighter);
          color: var(--primary-darker);
        }
      }
    }
  }
  & > .fc-card-table-spacer {
    height: var(--space-l);
  }
  & > tbody {
    background-color: var(--white);
    box-shadow: var(--shadow-3);
    & > tr {
      & > td {
        padding: var(--space-l) var(--space-m);
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
    &.expanded {
      & > tr:first-child {
        background-color: var(--base-lighter);
      }
      &:hover {
        background-color: var(--white);
        & > tr:first-child {
          background-color: var(--primary-lighter);
        }
      }
    }

    &:hover {
      background-color: var(--primary-lighter);
      & > tr > td {
        border-color: var(--primary-darker);
      }
    }
  }
}
</style>
