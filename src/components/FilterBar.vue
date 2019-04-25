<template>
<div class="filter-bar">
  <button
    :class="{ 'btn-primary': mode === 'ALL' }"
    @click="onClickAll">
    All
  </button>
  <button
    :class="{ 'btn-primary': mode === 'COLLISIONS' }"
    @click="onClickCollisions">
    Collisions
  </button>
  <FilterCountTypes
    :class="{
      'btn-primary': mode === 'COUNTS' && filterCountTypes.length > 0
    }"
    @filter-count-types="onClickCounts" />
</div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import FilterCountTypes from '@/components/FilterCountTypes.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FilterBar',
  components: {
    FilterCountTypes,
  },
  data() {
    return {
      mode: 'ALL',
    };
  },
  computed: {
    ...mapState(['filterCountTypes']),
  },
  methods: {
    onClickAll() {
      this.mode = 'ALL';
      this.setFilterCountTypes([...Constants.COUNT_TYPES.keys()]);
    },
    onClickCollisions() {
      this.mode = 'COLLISIONS';
      this.setFilterCountTypes([]);
    },
    onClickCounts() {
      this.mode = 'COUNTS';
      if (this.filterCountTypes.length === 0) {
        this.setFilterCountTypes([...Constants.COUNT_TYPES.keys()]);
      }
    },
    ...mapMutations(['setFilterCountTypes']),
  },
};
</script>

<style lang="postcss">
.filter-bar {
  & > button {
    margin: 0 calc(var(--sp) * 2);
  }
}
</style>
