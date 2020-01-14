<template>
  <v-radio-group
    v-model="internalValue"
    :error-messages="errorMessages"
    :messages="messages"
    row>
    <v-radio
      v-for="{ label, sublabel, value } in options"
      :key="value"
      :label="label"
      :value="value"></v-radio>
  </v-radio-group>
</template>

<script>
export default {
  name: 'TdsRadioGroup',
  props: {
    errorMessages: Array,
    invalid: {
      type: Boolean,
      default: false,
    },
    messages: Array,
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
