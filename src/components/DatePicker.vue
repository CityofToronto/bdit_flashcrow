<template>
  <v-date-picker
    v-bind="$attrs"
    v-model="internalValue"
    :class="{
      'date-picker': true,
      'disabled': disabled
    }"
    :show-popover="false"
    :theme-styles="themeStyles">
    <input
      slot-scope="{ inputValue }"
      type="text"
      class="input-date-picker"
      :disabled="disabled"
      :name="name"
      :value="inputValue" />
  </v-date-picker>
</template>

<script>
export default {
  name: 'FilterDate',
  props: ['disabled', 'name', 'value'],
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
.date-picker {
  &.disabled {
    opacity: 0.75;
    pointer-events: none;
  }
  .input-date-picker {
    width: 100%;
  }
}
</style>
