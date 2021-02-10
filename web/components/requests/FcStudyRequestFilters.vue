<template>
  <div class="fc-study-request-filters align-center d-flex">
    <FcDialogRequestFilters
      v-if="showFilters"
      v-model="showFilters"
      v-bind="internalValue"
      @set-filters="setFilters" />
    <FcButton
      v-if="items.length > 0 || filterChips.length > 0"
      type="secondary"
      @click.stop="showFilters = true">
      <v-icon
        :color="colorIconFilter"
        left>mdi-filter-variant</v-icon>
      Filter
      <span class="sr-only">Requests</span>
    </FcButton>
    <FcListFilterChips
      v-if="filterChips.length > 0"
      class="ml-5"
      :filter-chips="filterChips"
      @click-filter="removeFilter" />
  </div>
</template>

<script>
import { getFilterChips } from '@/lib/requests/RequestFilters';
import FcDialogRequestFilters from '@/web/components/dialogs/FcDialogRequestFilters.vue';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestFilterChips',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcDialogRequestFilters,
    FcListFilterChips,
  },
  props: {
    items: Array,
  },
  data() {
    return {
      showFilters: false,
    };
  },
  computed: {
    colorIconFilter() {
      if (this.filterChips.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
    filterChips() {
      return getFilterChips(this.internalValue, this.items);
    },
  },
  methods: {
    removeFilter({ filter, value }) {
      if (filter === 'closed') {
        this.internalValue.closed = false;
      } else if (filter === 'createdAt') {
        this.internalValue.createdAt = 0;
      } else if (filter === 'lastEditedAt') {
        this.internalValue.lastEditedAt = 0;
      } else if (filter === 'userOnly') {
        this.internalValue.userOnly = false;
      } else {
        const values = this.internalValue[filter];
        const i = values.indexOf(value);
        if (i !== -1) {
          values.splice(i, 1);
        }
      }
    },
    setFilters(filters) {
      this.internalValue = filters;
    },
  },
};
</script>
