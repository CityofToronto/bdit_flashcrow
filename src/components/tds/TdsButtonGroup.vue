<template>
  <div class="tds-button-group flex-container-row">
    <label
      v-for="{ label, value } in options"
      :key="value">
      <input
        v-model="internalValue"
        :type="type"
        class="screen-reader-only"
        :name="name"
        :value="value" />
      <span>{{label}}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'TdsButtonGroup',
  props: {
    name: String,
    options: {
      type: Array,
      default() { return []; },
    },
    type: {
      type: String,
      default: 'checkbox',
    },
    value: [Boolean, String, Array],
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
      border: var(--border-default);
      cursor: pointer;
      display: inline-block;
      margin-right: -1px;
      padding: var(--space-s) var(--space-m);
      text-align: center;
    }
    & > input[type="checkbox"]:checked + span,
    & > input[type="radio"]:checked + span {
      background-color: var(--success-light);
      color: var(--success-darker);
    }
    &:first-child > span {
      border-radius: var(--space-s) 0 0 var(--space-s);
    }
    &:last-child > span {
      border-radius: 0 var(--space-s) var(--space-s) 0;
      margin-right: 0;
    }
    &:hover > span {
      border-color: var(--base-darkest);
      color: var(--base-darkest);
    }
    &:hover + label > span {
      border-left: 1px solid var(--base-darkest);
    }
  }
}
</style>
