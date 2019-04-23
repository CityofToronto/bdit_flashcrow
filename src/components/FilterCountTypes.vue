<template>
  <button class="filter-count-types btn-dropdown">
    <span class="btn-dropdown-title">Counts ({{filterCountTypes.length}})</span>
    <ul class="dropdown">
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
  margin: 0 calc(var(--sp) * 2);
  &.btn-dropdown > ul.dropdown {
    width: 300px;
  }
}
.btn-dropdown {
  position: relative;

  & > ul.dropdown {
    background: var(--white);
    box-shadow: 0 4px 12px var(--outline-grey);
    left: 0;
    list-style: none;
    margin: 0;
    opacity: 0;
    padding: 0;
    position: absolute;
    text-align: left;
    top: 100%;
    transition: var(--transition-short) ease;
    visibility: hidden;
    width: 100%;
    z-index: var(--z-index-controls);

    & > li {
      background: var(--white);
      cursor: pointer;
      padding: 0;

      /* see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style */
      &:before {
        content: '\200B';
        float: left;
      }

      &.selected {
        color: var(--green);
      }

      &:hover, &.selected:hover {
        background-color: var(--light-blue);
        color: var(--blue);
      }

      & > label {
        cursor: pointer;
        display: block;
        font-size: var(--text-md);
        font-weight: var(--font-normal);
        padding: var(--sp) calc(var(--sp) * 2);
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
