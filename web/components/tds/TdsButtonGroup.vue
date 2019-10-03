<template>
  <div
    class="tds-button-group flex-container-row mb-s"
    :class="{ invalid }">
    <label
      v-for="{ label, value } in options"
      :key="value"
      class="flex-1">
      <input
        v-model="internalValue"
        :type="type"
        class="screen-reader-only"
        :name="name"
        :value="value" />
      <span class="full-width">{{label}}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'TdsButtonGroup',
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
    type: {
      type: String,
      default: 'checkbox',
    },
    value: [Boolean, Number, String, Array],
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
.tds-button-group {
  & > label {
    & > span {
      background-color: var(--white);
      border: var(--border-default);
      cursor: pointer;
      display: inline-block;
      padding: var(--space-s) var(--space-m);
      text-align: center;
    }
    &:hover > span {
      border-color: var(--base-darkest);
      color: var(--base-darkest);
    }
    &:first-child > span {
      border-radius: var(--space-s) 0 0 var(--space-s);
    }
    &:last-child > span {
      border-radius: 0 var(--space-s) var(--space-s) 0;
      margin-right: 0;
    }
    & > input:focus + span {
      box-shadow: var(--shadow-outline);
    }
    & > input:checked + span {
      background-color: var(--success-light);
      color: var(--success-darker);
    }
  }
  &.invalid > label > input + span {
    border-color: var(--error);
  }
}
</style>
