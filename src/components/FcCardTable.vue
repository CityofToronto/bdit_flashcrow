<template>
  <table class="fc-card-table">
    <caption v-if="caption">
      <!-- SELECTION -->
      <col v-if="selectable" class="fc-card-table-col-select">
      <!-- DATA COLUMNS -->
      <col :span="columnsNormalized.length" class="fc-card-table-col-data">
      <!-- EXPAND TOGGLE -->
      <col v-if="expandable" class="fc-card-table-col-expand">
    </caption>
    <thead>
      <tr>
        <!-- SELECTION -->
        <th
          v-if="selectable"
          class="font-size-xl text-left">&nbsp;</th>
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
              'fa-sort-up': column.sorted && sortDirection === 1,
              'fa-sort-down': column.sorted && sortDirection === -1,
            }"></i>
        </th>
        <!-- EXPAND TOGGLE -->
        <th
          v-if="expandable"
          class="font-size-xl text-left">&nbsp;</th>
      </tr>
    </thead>
    <template
      v-for="(section, i) in sectionsNormalized">
      <tr
        :key="'spacer-' + i"
        v-if="i > 0"
        class="fc-card-table-spacer">
        <td :colspan="numTableColumns"></td>
      </tr>
      <tbody
        :key="section.main.id"
        :class="{
          expanded: expandable && section === expanded
        }">
        <tr>
          <!-- SELECTION -->
          <td v-if="selectable">
            <label class="tds-checkbox">
              <input
                type="checkbox"
                name="selection"
                :value="section.main.id"
                v-model="internalValue" />
            </label>
          </td>
          <!-- DATA COLUMNS -->
          <td
            v-for="column in columnsNormalized"
            :key="column.name">
            <slot
              :name="column.name"
              v-bind="{ column, row: section.main }"></slot>
          </td>
          <!-- EXPAND TOGGLE -->
          <td
            v-if="expandable"
            class="cell-expand">
            <button
              class="tds-button-secondary font-size-l"
              @click="onClickSectionExpand(section)">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </td>
        </tr>
        <template v-if="expandable && section === expanded">
          <tr
            v-if="section.items.length === 0">
            <td :colspan="numTableColumns">
              <span class="text-muted">
                No older counts available.
              </span>
            </td>
          </tr>
          <tr
            v-for="row in section.items"
            :key="row.id">
            <!-- SELECTION -->
            <td v-if="selectable">
              <label class="tds-checkbox">
                <input
                  type="checkbox"
                  name="selection"
                  :value="row.id"
                  v-model="internalValue" />
              </label>
            </td>
            <!-- DATA COLUMNS -->
            <td
              v-for="column in columnsNormalized"
              :key="column.name">
              <slot
                :name="column.name"
                v-bind="{ column, row }"></slot>
            </td>
            <!-- EXPAND PLACEHOLDER -->
            <td v-if="expandable">&nbsp;</td>
          </tr>
        </template>
      </tbody>
    </template>
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
    selectable: {
      type: Boolean,
      default: false,
    },
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
    value: Array,
  },
  data() {
    return {
      expanded: null,
      internalSortBy: this.sortBy,
      internalSortDirection: this.sortDirection,
      internalValue: this.value,
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
        const sorted = name === this.sortBy;
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
      let n = this.columns.length;
      if (this.selectable) {
        n += 1;
      }
      if (this.expandable) {
        n += 1;
      }
      return n;
    },
    sectionsNormalized() {
      if (this.internalSortBy === null) {
        return this.sections;
      }
      const sortKey = this.sortKeys[this.internalSortBy];
      return ArrayUtils.sortBy(
        this.sections,
        ({ main }) => sortKey(main),
        this.sortDirection,
      );
    },
  },
  watch: {
    internalValue() {
      this.$emit('input', this.internalValue);
    },
  },
  methods: {
    onClickColumnHeader(column) {
      if (!column.sortable) {
        return;
      }
      if (column.name !== this.internalSortBy.name) {
        this.internalSortBy = column.name;
        this.internalSortDirection = 1;
      } else {
        this.internalSortDirection = -this.internalSortDirection;
      }
    },
    onClickSectionExpand(section) {
      if (this.expanded === section) {
        this.expanded = null;
      } else {
        this.expanded = section;
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
