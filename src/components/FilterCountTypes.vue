<template>
  <v-select
    class="filter-count-types"
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
.filter-count-types {
  background-color: var(--white);
  flex-grow: 1;
  margin: 0 calc(var(--sp) * 2);
  &.v-select input[type=search] {
    font-family: var(--font-family);
    font-size: var(--text-xl);
    margin: 0;
    padding: 0 calc(var(--sp) * 2);
  }
  & .dropdown-toggle {
    border-color: var(--outline-grey);
    border-radius: 0;
    padding-bottom: 2px;
    transition: border-color var(--transition-short) ease-in-out;
    &::after {
      display: none;
    }
  }
  &:hover .dropdown-toggle {
    border-color: var(--outline-grey-focus);
  }
}
</style>
