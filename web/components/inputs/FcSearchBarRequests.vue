<template>
  <div
    aria-label="Search for requests in table"
    role="search">
    <v-text-field
      v-model="internalQuery"
      append-icon="mdi-magnify"
      class="fc-search-bar-requests flex-grow-0 flex-shrink-0"
      dense
      hide-details
      label="Search"
      outlined>
      <template v-slot:prepend>
        <v-select
          v-model="internalColumn"
          class="fc-search-bar-requests-column font-weight-regular mt-0 pt-0 title"
          dense
          hide-details
          :items="itemsColumn"
          label="Search by"
          outlined />
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const COLUMNS_SEARCHABLE = [
  'ID',
  'LOCATION',
  'REQUESTER',
];

export default {
  name: 'FcSearchBarRequests',
  mixins: [FcMixinVModelProxy(Object)],
  props: {
    columns: Array,
  },
  computed: {
    internalColumn: {
      get() {
        return this.searchRequest.column;
      },
      set(column) {
        this.setSearchRequestColumn(column);
      },
    },
    internalQuery: {
      get() {
        return this.searchRequest.query;
      },
      set(query) {
        this.setSearchRequestQuery(query);
      },
    },
    itemsColumn() {
      const searchableColumns = this.columns.filter(
        column => COLUMNS_SEARCHABLE.includes(column.value),
      );
      const textSearchableColumnsAll = searchableColumns
        .map(({ text }) => text)
        .join(', ');
      return [
        { text: textSearchableColumnsAll, value: null },
        ...searchableColumns,
      ];
    },
    ...mapState('trackRequests', ['searchRequest']),
  },
  methods: {
    ...mapMutations('trackRequests', ['setSearchRequestColumn', 'setSearchRequestQuery']),
  },
};
</script>

<style lang="scss">
.fc-search-bar-requests {
  background-color: #fff;

  & > .v-input__control {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    width: 300px;
  }

  & > .v-input__prepend-outer {
    margin: 0 !important;
    & > .v-input.fc-search-bar-requests-column {
      & > .v-input__control {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        width: 150px;
      }

      &:not(.v-input--is-focused) fieldset {
        border-right: 0;
        border-width: 1px;
      }
    }
  }
}
</style>
