<template>
  <v-select
    v-model="internalValue"
    class="fc-select"
    :items="ofType.enumValues"
    :item-value="itemValue"
    v-bind="$attrs" />
</template>

<script>
import { Enum } from '@/lib/ClassUtils';

function fromInternalValue(ofType, internalValue) {
  if (Array.isArray(internalValue)) {
    return internalValue.map(name => ofType.enumValueOf(name));
  }
  if (internalValue === null) {
    return null;
  }
  return ofType.enumValueOf(internalValue);
}

function toInternalValue(value) {
  if (Array.isArray(value)) {
    return value.map(({ name }) => name);
  }
  if (value === null) {
    return null;
  }
  return value.name;
}

export default {
  name: 'FcSelectEnum',
  props: {
    itemValue: {
      type: String,
      default: 'name',
    },
    ofType: Function,
    value: [Enum, Array],
  },
  computed: {
    internalValue: {
      get() {
        return toInternalValue(this.value);
      },
      set(internalValue) {
        const value = fromInternalValue(this.ofType, internalValue);
        this.$emit('input', value);
      },
    },
  },
};
</script>
