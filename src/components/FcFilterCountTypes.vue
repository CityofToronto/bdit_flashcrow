<template>
  <TdsChecklistDropdown
    class="fc-filter-count-types"
    name="countTypes"
    :options="options"
    v-model="filterCountTypes"
    @click="$emit('filter-count-types')">
    <span>Counts ({{filterCountTypes.length}})</span>
  </TdsChecklistDropdown>
</template>

<script>
import TdsChecklistDropdown from '@/src/components/tds/TdsChecklistDropdown.vue';
import { COUNT_TYPES } from '@/lib/Constants';

export default {
  name: 'FilterCountTypes',
  components: {
    TdsChecklistDropdown,
  },
  data() {
    return {
      countTypes: COUNT_TYPES,
    };
  },
  computed: {
    filterCountTypes: {
      get() {
        return this.$store.state.filterCountTypes;
      },
      set(filterCountTypes) {
        this.$store.commit('setFilterCountTypes', filterCountTypes);
      },
    },
    options() {
      return this.countTypes.map(({ label }, i) => ({ label, value: i }));
    },
  },
};
</script>

<style lang="postcss">
.fc-filter-count-types {
  & > .dropdown {
    width: 400px;
  }
}
</style>
