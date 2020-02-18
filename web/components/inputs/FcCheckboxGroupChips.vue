<template>
  <v-chip-group
    v-model="internalValue"
    column
    multiple>
    <v-chip
      v-for="{ selected, text, value } in itemsNormalized"
      :key="'' + value"
      class="mr-2"
      :class="{
        'primary--text': selected,
      }"
      :color="selected ? 'light-blue lighten-5' : null"
      filter
      :value="value">
      {{text}}
    </v-chip>
  </v-chip-group>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCheckboxGroupChips',
  mixins: [FcMixinVModelProxy(Array)],
  props: {
    itemText: {
      type: String,
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    items: Array,
  },
  computed: {
    itemsNormalized() {
      const { internalValue, itemText, itemValue } = this;
      return this.items.map((item) => {
        const text = item[itemText];
        const value = item[itemValue];
        const selected = internalValue.includes(value);
        return { selected, text, value };
      });
    },
  },
};
</script>
