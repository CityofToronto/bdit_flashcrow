<template>
  <header class="pa-5">
    <div class="align-center d-flex">
      <h2 class="headline">Studies</h2>
      <div class="pl-3 subtitle-1">{{studyTotal}} total</div>
      <v-spacer></v-spacer>
      <FcDialogStudyFilters
        v-if="showFiltersStudy"
        v-model="showFiltersStudy"
        v-bind="filtersStudy"
        @set-filters="setFiltersStudy">
      </FcDialogStudyFilters>
      <FcButton
        v-if="studyTotal > 0"
        type="secondary"
        @click.stop="showFiltersStudy = true">
        <v-icon
          :color="colorIconFilterStudy"
          left>mdi-filter-variant</v-icon>
        Filter
      </FcButton>
      <FcButton
        class="ml-3"
        type="primary"
        @click="actionRequestStudy">
        <v-icon left>mdi-plus-box</v-icon>
        Request Study
      </FcButton>
    </div>

    <div
      v-if="filterChipsStudy.length > 0"
      class="mt-5">
      <v-chip
        v-for="(filterChip, i) in filterChipsStudy"
        :key="i"
        class="mb-2 mr-2 primary--text"
        color="light-blue lighten-5"
        @click="removeFilterStudy(filterChip)">
        {{filterChip.label}}
        <v-icon right>mdi-close-circle</v-icon>
      </v-chip>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcDialogStudyFilters from '@/web/components/dialogs/FcDialogStudyFilters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderStudies',
  components: {
    FcButton,
    FcDialogStudyFilters,
  },
  props: {
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
    actionRequestStudy() {
      this.$router.push({ name: 'requestStudyNew' });
    },
    ...mapMutations('viewData', [
      'removeFilterStudy',
      'setFiltersStudy',
    ]),
  },
};
</script>
