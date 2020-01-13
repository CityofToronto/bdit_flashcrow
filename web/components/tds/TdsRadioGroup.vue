<template>
  <v-radio-group
    v-model="internalValue"
    row>
    <v-radio
      v-for="{ label, sublabel, value } in options"
      :key="value"
      :label="label"
      :name="name"
      :value="value"></v-radio>
  </v-radio-group>
</template>

<script>
export default {
  name: 'TdsRadioGroup',
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
