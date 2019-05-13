<template>
  <button
    class="filter-count-types btn-dropdown"
    @click="$emit('filter-count-types')">
    <span class="btn-dropdown-title">Counts ({{filterCountTypes.length}})</span>
    <ul class="dropdown shadow-3">
      <li
        v-for="(countType, i) in optionsFilterCountTypes"
        :key="i"
        :class="{
          selected: filterCountTypes.includes(i),
        }">
        <label>
          <input
            v-model.number="filterCountTypes"
            type="checkbox"
            name="countTypes"
            :value="i" />
        {{countType.label}}</label>
      </li>
    </ul>
  </button>
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
};
</script>

<style lang="postcss">
.filter-count-types {
  &.btn-dropdown > ul.dropdown {
    width: 300px;
  }
}
.btn-dropdown {
  position: relative;

  & > ul.dropdown {
    background: var(--base-lightest);
    color: var(--base-darkest);
    left: 0;
    list-style: none;
    margin: 0;
    opacity: 0;
    padding: 0;
    position: absolute;
    text-align: left;
    top: 100%;
    transition: var(--transition-short);
    visibility: hidden;
    width: 100%;
    z-index: var(--z-index-controls);

    & > li {
      background: var(--base-lightest);
      cursor: pointer;
      padding: 0;

      /* see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style */
      &:before {
        content: '\200B';
        float: left;
      }

      &.selected {
        color: var(--success-darker);
      }

      &:hover, &.selected:hover {
        background-color: var(--primary-light);
        color: var(--primary-darker);
      }

      & > label {
        cursor: pointer;
        display: block;
        font-size: var(--font-size-m);
        font-weight: var(--font-normal);
        padding: var(--space-l) var(--space-m);
      }
    }
  }

  &:focus > ul.dropdown,
  &:active > ul.dropdown,
  &:hover > ul.dropdown,
  & > ul.dropdown:hover {
    opacity: 1;
    transform: translate(0, 1px);
    visibility: visible;
  }
}
</style>
