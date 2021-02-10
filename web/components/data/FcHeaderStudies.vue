<template>
  <header class="pa-5">
    <div class="align-center d-flex">
      <h3 class="display-2">
        <span>Studies</span>
        <FcTextNumberTotal class="ml-2" :n="studyTotal" />
      </h3>
      <v-spacer></v-spacer>
      <FcDialogStudyFilters
        v-if="showFiltersStudy"
        v-model="showFiltersStudy"
        :filters="filtersStudy"
        @set-filters="setFiltersStudy">
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
      @click-filter="removeFilterStudy" />
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderStudies',
  components: {
    FcButton,
    FcDialogStudyFilters,
    FcListFilterChips,
    FcTextNumberTotal,
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
    ...mapMutations('viewData', [
      'removeFilterStudy',
      'setFiltersStudy',
    ]),
  },
};
</script>
