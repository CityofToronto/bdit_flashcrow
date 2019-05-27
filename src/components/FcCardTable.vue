<template>
  <table class="fc-card-table">
    <caption v-if="caption">{{caption}}</caption>
    <colgroup>
      <!-- DATA COLUMNS -->
      <col :span="columnsNormalized.length" class="fc-card-table-col-data">
      <!-- EXPAND TOGGLE -->
      <col v-if="expandable" class="fc-card-table-col-expand">
    </colgroup>
    <thead>
      <tr>
        <!-- DATA COLUMNS -->
        <th
          v-for="column in columnsNormalized"
          :key="column.name"
          class="font-size-xl text-left"
          :class="column.headerClasses"
          @click="onClickColumnHeader(column)">
          <span>{{column.title}}</span>
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
      v-for="({ item, children }, i) in sectionsNormalized">
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
            :key="column.name">
            <slot
              :name="column.name"
              v-bind="{
                column,
                index: i,
                item,
                isChild: false,
                children,
              }"></slot>
          </td>
          <!-- EXPAND TOGGLE -->
          <td
            v-if="expandable"
            class="cell-expand">
            <button
              class="tds-button-secondary font-size-l"
              @click="onClickItemExpand(item)"
              :disabled="children === null || children.length === 0">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </td>
        </tr>
        <template v-if="expandable && expanded === item.id">
          <tr
            v-for="child in children"
            :key="child.id">
            <!-- DATA COLUMNS -->
            <td
              v-for="column in columnsNormalized"
              :key="column.name">
              <slot
                :name="column.name"
                v-bind="{
                  column,
                  item: child,
                  isChild: true,
                  children: null,
                }"></slot>
            </td>
            <!-- EXPAND PLACEHOLDER -->
            <td v-if="expandable">&nbsp;</td>
          </tr>
        </template>
      </tbody>
    </template>
    <slot name="__footer" v-bind="{
      numTableColumns,
      sectionsNormalized,
    }"></slot>
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
    sections: Array,
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
        let { title } = column;
        title = title || ' ';

        const sortKey = this.sortKeys[name] || null;
        const sortable = sortKey !== null;
        const sorted = name === this.internalSortBy;
        const headerClasses = { sortable, sorted };

        return {
          headerClasses,
          name,
          sortable,
          sorted,
          sortKey,
          title,
        };
      });
    },
    numTableColumns() {
      const n = this.columns.length;
      return this.expandable ? n + 1 : n;
    },
    sectionsNormalized() {
      if (this.internalSortBy === null) {
        return this.sections;
      }
      const sortKey = this.sortKeys[this.internalSortBy];
      return ArrayUtils.sortBy(
        this.sections,
        ({ item }) => sortKey(item),
        this.internalSortDirection,
      );
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
  & > thead {
    & > tr > th {
      &.sortable {
        cursor: pointer;
        &.sorted {
          background-color: var(--success-light);
          color: var(--success-darker);
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
      & > i {
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
