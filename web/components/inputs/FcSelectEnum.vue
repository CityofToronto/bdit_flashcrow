<template>
  <v-select
    v-model="internalValue"
    hide-details="auto"
    :items="itemsNormalized"
    :item-text="itemText"
    item-value="name"
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
    items: {
      type: Array,
      default: null,
    },
    itemText: {
      type: String,
      default: 'text',
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
    itemsNormalized() {
      if (this.items === null) {
        return this.ofType.enumValues;
      }
      return this.items;
    },
  },
};
</script>
