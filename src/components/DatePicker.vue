<template>
  <v-date-picker
    v-bind="$attrs"
    v-model="internalValue"
    :input-props="{class: 'input-date-picker'}"
    :theme-styles="themeStyles">
  </v-date-picker>
</template>

<script>
export default {
  name: 'FilterDate',
  props: ['value'],
  data() {
    const textLg = { fontSize: 'var(--text-lg)' };
    const textXl = { fontSize: 'var(--text-xl)' };
    return {
      internalValue: this.value,
      themeStyles: {
        dayContent: textLg,
        headerArrows: textXl,
        headerTitle: textXl,
        navHeaderArrows: textXl,
        navHeaderTitle: textXl,
        navMonthCell: textLg,
        navYearCell: textLg,
      },
    };
  },
  watch: {
    internalValue(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style lang="postcss">
.input-date-picker {
  width: 100%;
}
</style>
