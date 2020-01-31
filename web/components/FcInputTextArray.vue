<template>
  <v-combobox
    v-model="internalValue"
    append-icon="mdi-plus"
    chips
    deletable-chips
    dense
    hide-details
    multiple
    outlined></v-combobox>
</template>

<script>
export default {
  name: 'FcInputTextArray',
  props: {
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
  methods: {
    onAdd() {
      this.internalValue.push('');
      /* eslint-disable-next-line no-self-assign */
      this.internalValue = this.internalValue;
    },
    onRemove(i) {
      this.internalValue.splice(i, 1);
      /* eslint-disable-next-line no-self-assign */
      this.internalValue = this.internalValue;
    },
  },
};
</script>
