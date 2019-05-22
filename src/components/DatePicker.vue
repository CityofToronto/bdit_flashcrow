<template>
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
</template>

<script>
const SIZES = ['xs', 's', 'm', 'l', 'xl', '2xl'];

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
    size: String,
    value: Object,
  },
  data() {
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
    };
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
    sizeMinusOne() {
      const i = SIZES.indexOf(this.size);
      return SIZES[i - 1];
    },
    themeStyles() {
      const textSizeMinusOne = {
        fontSize: `var(--font-size-${this.sizeMinusOne})`,
      };
      const textSize = {
        fontSize: `var(--font-size-${this.size})`,
      };
      return {
        dayCell: textSizeMinusOne,
        dayContent: {
          height: '1.8em',
          width: '1.8em',
          ...textSizeMinusOne,
        },
        headerArrows: textSize,
        headerTitle: textSize,
        navHeaderArrows: textSize,
        navHeaderTitle: textSize,
        navMonthCell: textSizeMinusOne,
        navYearCell: textSizeMinusOne,
      };
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
