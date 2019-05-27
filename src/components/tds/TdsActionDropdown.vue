<template>
  <TdsButtonDropdown class="tds-action-dropdown">
    <template v-slot:title>
      <slot></slot>
    </template>
    <template v-slot:dropdown>
      <ul>
        <li
          v-for="{ label, value } in options"
          :key="value">
          <span @click="onClickAction(value)">
            {{label}}
          </span>
        </li>
      </ul>
    </template>
  </TdsButtonDropdown>
</template>

<script>
import TdsButtonDropdown from '@/components/tds/TdsButtonDropdown.vue';

export default {
  name: 'TdsActionDropdown',
  components: {
    TdsButtonDropdown,
  },
  props: {
    name: String,
    options: {
      type: Array,
      default() { return []; },
    },
  },
  methods: {
    onClickAction(value) {
      this.$emit('action-selected', value);
      // TODO: close the dropdown
    },
  },
};
</script>

<style lang="postcss">
.tds-action-dropdown {
  & > .dropdown > ul {
    list-style: none;
    margin: 0;
    padding: 0;

    & > li {
      cursor: pointer;
      padding: 0;

      /* see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style */
      &:before {
        content: '\200B';
        float: left;
      }

      &:hover {
        background-color: var(--primary-light);
        color: var(--primary-darker);
      }

      & > span {
        cursor: pointer;
        display: block;
        font-size: var(--font-size-m);
        font-weight: var(--font-normal);
        padding: var(--space-l) var(--space-m);
      }
    }
  }
}
</style>
