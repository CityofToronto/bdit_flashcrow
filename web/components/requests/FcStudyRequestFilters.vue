<template>
  <div class="fc-study-request-filters align-center d-flex">
    <FcDialogRequestFilters
      v-if="showFilters"
      v-model="showFilters"
      :filters="filtersRequest"
      @set-filters="actionSetFiltersRequest" />
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
      @click-filter="actionRemoveFilterRequest" />
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
    actionRemoveFilterRequest(filter) {
      this.removeFilterRequest(filter);
      this.setToastInfo(`Removed request filter: ${filter.label}.`);
    },
    actionSetFiltersRequest(filtersRequest) {
      this.setFiltersRequest(filtersRequest);
      this.setToastInfo('Updated request filters.');
    },
    ...mapMutations(['setToastInfo']),
    ...mapMutations('trackRequests', ['removeFilterRequest', 'setFiltersRequest']),
  },
};
</script>
