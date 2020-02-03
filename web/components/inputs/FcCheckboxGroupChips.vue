<template>
  <v-chip-group
    v-model="internalValue"
    column
    multiple>
    <v-chip
      v-for="{ selected, text, value } in itemsNormalized"
      :key="'' + value"
      class="mr-2"
      :color="selected ? 'blue lighten-4' : null"
      filter
      :value="value">
      {{text}}
    </v-chip>
  </v-chip-group>
</template>

<script>
export default {
  name: 'FcCheckboxGroupChips',
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
