<template>
  <div
    class="date-picker"
    :class="{ disabled }">
    <div class="date-picker-icon">
      <i class="fa fa-calendar"></i>
    </div>
    <v-date-picker
      v-bind="$attrs"
      v-model="internalValue"
      class="date-picker-control"
      :disabled-attribute="disabledAttribute"
      popover-visibility="focus"
      :show-caps="true"
      :show-day-popover="false"
      :theme-styles="themeStyles">
      <input
        slot-scope="{ inputValue }"
        type="text"
        class="input-date-picker"
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        @input="internalValue = null" />
    </v-date-picker>
  </div>
</template>

<script>
export default {
  name: 'FilterDate',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: Object,
  },
  data() {
    const textLg = { fontSize: 'var(--font-size-l)' };
    const textXl = { fontSize: 'var(--font-size-xl)' };
    return {
      disabledAttribute: {
        contentStyle: {
          backgroundColor: 'transparent',
          color: 'red',
          cursor: 'not-allowed',
          opacity: 0.5,
          textDecoration: 'line-through',
        },
      },
      internalValue: this.value,
      themeStyles: {
        dayCell: textLg,
        dayContent: {
          height: '1.8em',
          width: '1.8em',
          ...textLg,
        },
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
  display: flex;
  &.disabled {
    opacity: 0.75;
    pointer-events: none;
  }
  & > .date-picker-icon,
  & > .date-picker-control {
    display: inline-block;
    vertical-align: middle;
  }
  & > .date-picker-icon {
    background-color: var(--base-lightest);
    border: var(--border-default);
    border-right: none;
    font-size: var(--font-size-xl);
    height: 31px;
    padding: var(--space-l) var(--space-m);
  }
  & > .date-picker-control {
    flex: 1;
  }
  &:hover > .date-picker-icon,
  &:hover .input-date-picker {
    border-color: var(--base-darkest);
  }
  .input-date-picker {
    width: 100%;
  }
  .c-day-background {
    height: 1.8em !important;
  }
  .c-day-box-center-center.c-day-slide-left-translate-enter > .c-day-background,
  .c-day-box-center-center.c-day-slide-right-translate-enter > .c-day-background,
  .c-day-box-center-center.c-day-scale-enter.c-day-scale-leave > .c-day-background {
    width: 1.8em !important;
  }
}
</style>
