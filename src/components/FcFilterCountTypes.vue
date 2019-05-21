<template>
  <TdsChecklistDropdown
    class="fc-filter-count-types"
    name="countTypes"
    :options="options"
    :title="'Counts (' + filterCountTypes.length + ')'"
    v-model="filterCountTypes"
    @click="$emit('filter-count-types')" />
</template>

<script>
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FilterCountTypes',
  components: {
    TdsChecklistDropdown,
  },
  data() {
    return {
      countTypes: Constants.COUNT_TYPES,
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
  & > ul.dropdown {
    width: 300px;
  }
}
</style>
