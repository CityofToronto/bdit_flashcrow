<template>
  <v-date-picker
    v-model="internalValue"
    :max="internalMax"
    :min="internalMin"
    :range="mode === 'range'">
  </v-date-picker>
</template>

<script>
import DateTime from '@/lib/time/DateTime';

function fromInternalValue(mode, internalValue) {
  if (internalValue === null) {
    return null;
  }
  if (mode === 'range') {
    let [start, end] = internalValue;
    start = fromInternalValue('single', start);
    end = fromInternalValue('single', end);
    return [start, end];
  }
  // single
  return DateTime.fromISO(internalValue);
}

function toInternalValue(mode, value) {
  if (value === null) {
    return null;
  }
  if (mode === 'range') {
    let [start, end] = value;
    start = toInternalValue('single', start);
    end = toInternalValue('single', end);
    return [start, end];
  }
  // single
  return value.toISODate();
}

export default {
  name: 'FcDatePicker',
  props: {
    max: {
      type: Object,
      default() { return null; },
    },
    min: {
      type: Object,
      default() { return null; },
    },
    mode: {
      type: String,
      default: 'single',
    },
    value: Object,
  },
  computed: {
    internalMax() {
      return toInternalValue('single', this.max);
    },
    internalMin() {
      return toInternalValue('single', this.min);
    },
    internalValue: {
      get() {
        const { mode } = this;
        return toInternalValue(mode, this.value);
      },
      set(internalValue) {
        const { mode } = this;
        const value = fromInternalValue(mode, internalValue);
        this.$emit('input', value);
      },
    },
  },
};
</script>
