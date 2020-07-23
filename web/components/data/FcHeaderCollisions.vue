<template>
  <header class="pa-5">
    <div class="align-center d-flex">
      <h2 class="headline">Collisions</h2>
      <div class="pl-3 subtitle-1">{{collisionTotal}} total</div>
      <v-spacer></v-spacer>
      <FcDialogCollisionFilters
        v-if="showFiltersCollision"
        v-model="showFiltersCollision"
        v-bind="filtersCollision"
        @set-filters="setFiltersCollision">
      </FcDialogCollisionFilters>
      <FcButton
        v-if="collisionTotal > 0"
        type="secondary"
        @click.stop="showFiltersCollision = true">
        <v-icon
          :color="colorIconFilterCollision"
          left>mdi-filter-variant</v-icon>
        Filter
      </FcButton>
    </div>

    <div
      v-if="filterChipsCollision.length > 0"
      class="mt-5">
      <v-chip
        v-for="(filterChip, i) in filterChipsCollision"
        :key="i"
        class="mb-2 mr-2 primary--text"
        color="light-blue lighten-5"
        @click="removeFilterCollision(filterChip)">
        {{filterChip.label}}
        <v-icon right>mdi-close-circle</v-icon>
      </v-chip>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcDialogCollisionFilters from '@/web/components/dialogs/FcDialogCollisionFilters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderCollisions',
  components: {
    FcButton,
    FcDialogCollisionFilters,
  },
  props: {
    collisionTotal: Number,
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
    ...mapMutations('viewData', [
      'removeFilterCollision',
      'setFiltersCollision',
    ]),
  },
};
</script>