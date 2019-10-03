<template>
  <TdsButtonDropdown
    class="tds-checklist-dropdown"
    :invalid="invalid">
    <template v-slot:title>
      <slot></slot>
    </template>
    <template v-slot:dropdown>
      <ul>
        <li
          v-for="{ label, value } in options"
          :key="value"
          :class="{
            selected: internalValue.includes(value),
          }">
          <label class="tds-checkbox">
            <input
              v-model="internalValue"
              type="checkbox"
              :name="name"
              :value="value" />
            <span>{{label}}</span>
          </label>
        </li>
      </ul>
    </template>
  </TdsButtonDropdown>
</template>

<script>
import TdsButtonDropdown from '@/web/components/tds/TdsButtonDropdown.vue';

export default {
  name: 'TdsChecklistDropdown',
  components: {
    TdsButtonDropdown,
  },
  props: {
    invalid: {
      type: Boolean,
      default: false,
    },
    name: String,
    options: {
      type: Array,
      default() { return []; },
    },
    value: Array,
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style lang="postcss">
.tds-checklist-dropdown {
  & > .dropdown > ul {
    list-style: none;
    margin: 0;
    padding: 0;

    & > li {
      cursor: pointer;
      padding: 0;

      /* see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style */
      &::before {
        content: '\200B';
        float: left;
      }

      &.selected {
        color: var(--success-darker);
      }

      &:hover,
      &.selected:hover {
        background-color: var(--primary-light);
        color: var(--primary-darker);
      }

      & > label {
        cursor: pointer;
        display: block;
        font-size: var(--font-size-m);
        font-weight: var(--font-normal);
        padding: var(--space-m);
      }
    }
  }
}
</style>
