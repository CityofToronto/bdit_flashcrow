<template>
  <div
    aria-label="Search for requests in table"
    role="search">
    <v-text-field
      v-model="internalValue.query"
      append-icon="mdi-magnify"
      class="fc-search-bar-requests flex-grow-0 flex-shrink-0"
      dense
      hide-details
      label="Search"
      outlined>
      <template v-slot:prepend>
        <v-select
          v-model="internalValue.column"
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
import RequestSearchKeys from '@/lib/requests/RequestSearchKeys';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcSearchBarRequests',
  mixins: [FcMixinVModelProxy(Object)],
  props: {
    columns: Array,
  },
  computed: {
    itemsColumn() {
      const searchableColumns = this.columns.filter(
        column => Object.prototype.hasOwnProperty.call(RequestSearchKeys, column.value),
      );
      return [
        { text: 'All Columns', value: null },
        ...searchableColumns,
      ];
    },
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
