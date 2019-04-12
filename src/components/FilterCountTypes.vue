<template>
  <v-select
    v-model="filterCountTypes"
    :options="optionsFilterCountTypes"
    multiple
    placeholder="Filter by study type(s)" />
</template>

<script>
import Constants from '@/lib/Constants';

export default {
  name: 'FilterCountTypes',
  data() {
    return {
      optionsFilterCountTypes: Constants.COUNT_TYPES,
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
  },
  methods: {
    datepickerFormat(d) {
      // TODO: DRY with main.js Vue filter
      if (!d) {
        return '';
      }
      return new Intl.DateTimeFormat('en-US').format(d);
    },
  },
};
</script>

<style lang="postcss">

</style>
