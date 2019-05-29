<template>
  <div class="tds-radio-group flex-container-row mb-s">
    <label
      v-for="{ label, sublabel, value } in options"
      :key="value"
      class="tds-radio">
      <input
        v-model="internalValue"
        type="radio"
        :name="name"
        :value="value" />
      <span>
        {{label}}
        <template v-if="sublabel">
          <br />
          <small>{{sublabel}}</small>
        </template>
      </span>
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
    value: [Boolean, Number, String],
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
