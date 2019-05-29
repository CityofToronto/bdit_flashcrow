<template>
  <div class="tds-radio-group flex-container-row mb-s">
    <label
      v-for="{ label, value } in options"
      :key="value">
      <input
        v-model="internalValue"
        type="radio"
        class="tds-radio"
        :name="name"
        :value="value" />
      <span>{{label}}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'TdsRadioGroup',
  props: {
    name: String,
    options: {
      type: Array,
      default() { return []; },
    },
    value: [Boolean, String],
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
.tds-radio-group {
  justify-content: space-between;
}
</style>
