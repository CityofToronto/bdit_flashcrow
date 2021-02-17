<template>
  <div class="fc-study-request-filters align-center d-flex">
    <FcDialogRequestFilters
      v-if="showFilters"
      v-model="showFilters"
      :filters="filtersRequest"
      @set-filters="setFiltersRequest" />
    <FcButton
      v-if="items.length > 0 || filterChipsRequest.length > 0"
      type="secondary"
      @click.stop="showFilters = true">
      <v-icon
        :color="colorIconFilter"
        left>mdi-filter-variant</v-icon>
      Filter
      <span class="sr-only">Requests</span>
    </FcButton>
    <FcListFilterChips
      v-if="filterChipsRequest.length > 0"
      class="ml-5"
      :filter-chips="filterChipsRequest"
      @click-filter="removeFilterRequest" />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcDialogRequestFilters from '@/web/components/dialogs/FcDialogRequestFilters.vue';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestFilters',
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
      if (this.hasFiltersRequest) {
        return 'primary';
      }
      return 'unselected';
    },
    ...mapGetters('trackRequests', ['filterChipsRequest', 'hasFiltersRequest']),
    ...mapState('trackRequests', ['filtersRequest']),
  },
  methods: {
    ...mapMutations('trackRequests', ['removeFilterRequest', 'setFiltersRequest']),
  },
};
</script>
