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
    z-index: 99;

    &:before {
      border-bottom: 6px solid transparent;
      border-left: 6px solid transparent;
      border-right: 6px solid var(--white);
      border-top: 6px solid var(--white);
      content: '';
      height: 0;
      left: 20px;
      position: absolute;
      top: -6px;
      transform: rotate(-45deg);
      width: 0;
    }

    & > li {
      background: var(--white);
      border-bottom: 1px solid var(--outline-grey);
      cursor: pointer;
      padding: var(--sp) calc(var(--sp) * 2);

      /* see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style */
      &:before {
        content: '\200B';
        float: left;
      }

      &:last-child {
        border-bottom: 0;
      }

      &.selected {
        background-color: var(--light-green);
        border-bottom-color: var(--green);
        color: var(--green);
      }

      &:hover, &.selected:hover {
        background-color: var(--light-blue);
        border-bottom-color: var(--blue);
        color: var(--blue);
      }

      & > label {
        cursor: pointer;
        display: block;
        font-size: var(--text-md);
        font-weight: var(--font-normal);
        margin-bottom: var(--sp);
      }
    }
  }

  &:focus > ul.dropdown,
  &:active > ul.dropdown,
  &:hover > ul.dropdown,
  & > ul.dropdown:hover {
    opacity: 1;
    transform: translate(0, 10px);
    visibility: visible;
  }
}
</style>
