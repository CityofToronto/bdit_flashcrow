<template>
  <header class="pa-5">
    <div class="align-center d-flex">
      <h3 class="display-2">Studies</h3>
      <v-spacer></v-spacer>
      <FcDialogStudyFilters
        v-if="showFiltersStudy"
        v-model="showFiltersStudy"
        :filters="filtersStudy"
        @set-filters="actionSetFiltersStudy">
      </FcDialogStudyFilters>
      <FcButton
        :disabled="disabled || studyTotal === 0"
        type="secondary"
        @click.stop="showFiltersStudy = true">
        <v-icon
          :color="colorIconFilterStudy"
          left>mdi-filter-variant</v-icon>
        Filter
        <span class="sr-only">Studies</span>
      </FcButton>
      <slot name="action" />
    </div>

    <FcListFilterChips
      v-if="filterChipsStudy.length > 0"
      class="mt-4 mb-2"
      :filter-chips="filterChipsStudy"
      @click-filter="actionRemoveFilterStudy" />
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderStudies',
  components: {
    FcButton,
    FcDialogStudyFilters,
    FcListFilterChips,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    studyTotal: Number,
  },
  data() {
    return {
      showFiltersStudy: false,
    };
  },
  computed: {
    colorIconFilterStudy() {
      if (this.filterChipsStudy.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
    ...mapState('viewData', ['filtersStudy']),
    ...mapGetters('viewData', ['filterChipsStudy']),
  },
  methods: {
    actionRemoveFilterStudy(filter) {
      this.removeFilterStudy(filter);
      this.setToastInfo(`Removed study filter: ${filter.label}.`);
    },
    actionSetFiltersStudy(filtersStudy) {
      this.setFiltersStudy(filtersStudy);
      this.setToastInfo('Updated study filters.');
    },
    ...mapMutations(['setToastInfo']),
    ...mapMutations('viewData', [
      'removeFilterStudy',
      'setFiltersStudy',
    ]),
  },
};
</script>
