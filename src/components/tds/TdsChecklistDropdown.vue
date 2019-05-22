<template>
  <button class="tds-checklist-dropdown">
    <span>{{title}}</span>
    <ul class="dropdown shadow-3">
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
  </button>
</template>

<script>
export default {
  name: 'TdsChecklistDropdown',
  props: {
    name: String,
    options: {
      type: Array,
      default() { return []; },
    },
    title: String,
    value: Array,
  },
  data() {
    return {
      internalValue: this.value,
    };
  },
  watch: {
    internalValue() {
      this.$emit('input', this.internalValue);
    },
  },
};
</script>

<style lang="postcss">
.tds-checklist-dropdown {
  position: relative;

  & > ul.dropdown {
    background: var(--white);
    border: 1px solid var(--base);
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

  &:focus, &:active, &:hover {
    border-radius: var(--space-s) var(--space-s) 0 0;
  }
  &:focus > ul.dropdown,
  &:active > ul.dropdown,
  &:hover > ul.dropdown,
  & > ul.dropdown:hover {
    opacity: 1;
    transform: translate(-1px, 0);
    visibility: visible;
  }
}
</style>
