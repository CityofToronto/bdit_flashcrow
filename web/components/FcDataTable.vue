<template>
  <v-data-table
    v-model="internalValue"
    :caption="caption"
    disable-filtering
    disable-pagination
    :headers="headers"
    hide-default-footer
    item-key="id"
    :items="items"
    :loading="loading"
    :show-select="showSelect">
    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'FcDataTable',
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
    loading: {
      type: Boolean,
      default: false,
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
    sortKeys: {
      type: Object,
      default() { return {}; },
    },
    value: Array,
  },
  computed: {
    headers() {
      return this.columns.map(({ value, ...options }) => {
        const sort = this.sortKeys[value] || null;
        const sortable = sort !== null;
        return {
          sort,
          sortable,
          value,
          ...options,
        };
      });
    },
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>
