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
    :items="itemsOrLoading"
    :loading="loading"
    :show-select="showSelect"
    :sort-by.sync="internalSortBy"
    :sort-desc.sync="internalSortDesc"
    v-bind="$attrs">
    <template
      v-if="showSelect"
      v-slot:header.data-table-select="{ on, props }">
      <v-simple-checkbox
        v-bind="props"
        v-on="on">
      </v-simple-checkbox>
      <span class="sr-only">Select</span>
    </template>
    <template v-slot:loading>
      <span class="secondary--text">Loading items...</span>
    </template>
    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
    <template v-slot:no-data>
      <slot name="no-data" />
    </template>
  </v-data-table>
</template>

<script>
import { Ripple } from 'vuetify/lib/directives';

import { KeyCode } from '@/lib/Constants';
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
  directives: {
    Ripple,
  },
  props: {
    ariaLabelledby: {
      type: String,
      default: null,
    },
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
    sortBy: String,
    sortDesc: Boolean,
    sortKeys: {
      type: Object,
      default() { return {}; },
    },
  },
  computed: {
    headers() {
      return this.columns.map(({ value, ...options }) => {
        const headerClass = `fc-data-table-header-${value}`;
        const sortable = Object.prototype.hasOwnProperty.call(this.sortKeys, value);
        return {
          class: headerClass,
          sortable,
          value,
          ...options,
        };
      });
    },
    internalSortBy: {
      get() {
        return this.sortBy;
      },
      set(internalSortBy) {
        this.$emit('update:sortBy', internalSortBy);
      },
    },
    internalSortDesc: {
      get() {
        return this.sortDesc;
      },
      set(internalSortDesc) {
        this.$emit('update:sortDesc', internalSortDesc);
      },
    },
    itemsOrLoading() {
      if (this.loading) {
        /*
         * The "loading..." text in `<v-data-table>` is only shown when there are no items, so
         * we use this to forcibly show a loading state.
         */
        return [];
      }
      return this.items;
    },
  },
  mounted() {
    // using external header to provide ARIA label for entire table
    if (this.ariaLabelledby !== null) {
      const $table = this.$el.querySelector('table');
      $table.setAttribute('aria-labelledby', this.ariaLabelledby);
    }

    // keyboard navigation of sortable header toggles
    const $thSortable = this.$el.querySelectorAll('th.sortable');
    $thSortable.forEach(($th) => {
      const ariaLabel = $th.getAttribute('aria-label');
      $th.removeAttribute('aria-label');

      const $sortIcon = $th.querySelector('.v-data-table-header__icon');
      $sortIcon.removeAttribute('aria-hidden');
      $sortIcon.setAttribute('aria-label', ariaLabel);
      $sortIcon.setAttribute('tabindex', 0);
      $sortIcon.addEventListener('keypress', (evt) => {
        if (evt.keyCode === KeyCode.SPACE) {
          evt.preventDefault();
          $th.click();
        }
      });
    });
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
  & .v-data-table-header__icon {
    opacity: 1;
  }

  &.theme--light tbody tr.v-data-table__selected {
    background: var(--v-accent-lighten2);
    & .v-data-table__checkbox .v-icon.v-icon {
      color: var(--v-primary-base);
    }
  }
}
</style>
