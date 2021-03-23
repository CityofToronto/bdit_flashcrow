<template>
  <header class="pa-5">
    <div class="align-center d-flex">
      <h3 class="headline">Collisions</h3>
      <v-spacer></v-spacer>
      <FcDialogCollisionFilters
        v-if="showFiltersCollision"
        v-model="showFiltersCollision"
        :filters="filtersCollision"
        @set-filters="actionSetFiltersCollision">
      </FcDialogCollisionFilters>
      <FcButton
        :disabled="disabled || collisionTotal === 0"
        type="secondary"
        @click.stop="showFiltersCollision = true">
        <v-icon
          :color="colorIconFilterCollision"
          left>mdi-filter-variant</v-icon>
        Filter
        <span class="sr-only">Collisions</span>
      </FcButton>
      <slot name="action" />
    </div>

    <FcListFilterChips
      v-if="filterChipsCollision.length > 0"
      class="mt-4 mb-2"
      :filter-chips="filterChipsCollision"
      @click-filter="actionRemoveFilterCollision" />
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcDialogCollisionFilters from '@/web/components/dialogs/FcDialogCollisionFilters.vue';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderCollisions',
  components: {
    FcButton,
    FcDialogCollisionFilters,
    FcListFilterChips,
  },
  props: {
    collisionTotal: Number,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showFiltersCollision: false,
    };
  },
  computed: {
    colorIconFilterCollision() {
      if (this.filterChipsCollision.length === 0) {
        return 'unselected';
      }
      return 'primary';
    },
    ...mapState('viewData', ['filtersCollision']),
    ...mapGetters('viewData', ['filterChipsCollision']),
  },
  methods: {
    actionRemoveFilterCollision(filter) {
      this.removeFilterCollision(filter);
      this.setToastInfo(`Removed collision filter: ${filter.label}.`);
    },
    actionSetFiltersCollision(filtersCollision) {
      this.setFiltersCollision(filtersCollision);
      this.setToastInfo('Updated request filters.');
    },
    ...mapMutations(['setToastInfo']),
    ...mapMutations('viewData', [
      'removeFilterCollision',
      'setFiltersCollision',
    ]),
  },
};
</script>
