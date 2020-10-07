<template>
  <v-select
    v-model="internalValue"
    :aria-label="ariaLabel"
    :items="items"
    :item-text="itemText"
    :item-value="itemValue"
    v-bind="$attrs" />
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

function getItemText(items, itemText, itemValue, value) {
  const itemForValue = items.find(item => item[itemValue] === value);
  if (itemForValue === undefined) {
    return null;
  }
  return itemForValue[itemText];
}

export default {
  name: 'FcSelect',
  mixins: [FcMixinVModelProxy()],
  props: {
    items: {
      type: Array,
      default: null,
    },
    itemText: {
      type: String,
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
  },
  computed: {
    ariaLabel() {
      const {
        internalValue,
        items,
        itemText,
        itemValue,
      } = this;
      if (Array.isArray(internalValue)) {
        const itemTextsNonNull = internalValue
          .map(value => getItemText(items, itemText, itemValue, value))
          .filter(value => value !== null);
        if (itemTextsNonNull.length === 0) {
          return null;
        }
        return itemTextsNonNull.join(', ');
      }
      return getItemText(items, itemText, itemValue, internalValue);
    },
  },
};
</script>
