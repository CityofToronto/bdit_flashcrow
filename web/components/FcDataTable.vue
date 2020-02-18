<template>
  <v-data-table
    v-model="internalValue"
    :caption="caption"
    class="fc-data-table"
    :custom-sort="customSort"
    disable-filtering
    disable-pagination
    :headers="headers"
    hide-default-footer
    item-key="id"
    :items="items"
    :loading="loading"
    :show-select="showSelect"
    v-bind="$attrs">
    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-data-table>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

function compareKeys(ka, kb, kf) {
  const n = ka.length;
  for (let i = 0; i < n; i++) {
    if (ka[i] < kb[i]) {
      return -kf[i];
    }
    if (ka[i] > kb[i]) {
      return kf[i];
    }
  }
  return 0;
}

export default {
  name: 'FcDataTable',
  mixins: [FcMixinVModelProxy(Array)],
  props: {
    caption: {
      type: String,
      default: null,
    },
    columns: Array,
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
  },
  computed: {
    headers() {
      return this.columns.map(({ value, ...options }) => {
        const sortable = Object.prototype.hasOwnProperty.call(this.sortKeys, value);
        return {
          sortable,
          value,
          ...options,
        };
      });
    },
  },
  methods: {
    customSort(items, sortBy, sortDesc) {
      const kf = sortDesc.map(desc => (desc ? -1 : 1));
      return [...items].sort((a, b) => {
        const ka = sortBy.map(k => this.sortKeys[k](a));
        const kb = sortBy.map(k => this.sortKeys[k](b));
        return compareKeys(ka, kb, kf);
      });
    },
  },
};
</script>

<style lang="scss">
.fc-data-table.v-data-table {
  &.theme--light tbody tr.v-data-table__selected {
    background: var(--v-accent-lighten2);
    & .v-data-table__checkbox .v-icon.v-icon {
      color: var(--v-primary-base);
    }
  }
}
</style>
