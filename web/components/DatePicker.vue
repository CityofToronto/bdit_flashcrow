<template>
  <v-date-picker
    v-model="internalValue"
    class="date-picker-control flex-container-row"
    :disabled-attribute="disabledAttribute"
    :disabled-dates="disabledDatesJS"
    :max-date="maxDateJS"
    :min-date="minDateJS"
    popover-visibility="focus"
    :show-caps="true"
    :show-day-popover="false"
    :theme-styles="themeStyles"
    v-bind="$attrs">
    <template slot-scope="{ inputValue, updateValue }">
      <input
        type="text"
        autocomplete="off"
        class="input-date-picker flex-fill"
        :class="{
          ['font-size-' + size]: true,
          invalid
        }"
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        @input="updateValue($event.target.value, { formatInput: false, hidePopover: false })"
        @change="updateValue($event.target.value, { formatInput: true, hidePopover: false })"
        @keyup.esc="updateValue(internalValue, { formatInput: true, hidePopover: true })" />
    </template>
  </v-date-picker>
</template>

<script>
import DateTime from '@/lib/time/DateTime';

const SIZES = ['xs', 's', 'm', 'l', 'xl', '2xl'];

function fromInternalValue(mode, internalValue) {
  if (internalValue === null) {
    return null;
  }
  if (mode === 'multiple') {
    return internalValue.map(d => DateTime.fromJSDate(d));
  }
  if (mode === 'range') {
    let { start, end } = internalValue;
    start = fromInternalValue('single', start);
    end = fromInternalValue('single', end);
    return { start, end };
  }
  // single
  return DateTime.fromJSDate(internalValue);
}

function toInternalValue(mode, value) {
  if (value === null) {
    return null;
  }
  if (mode === 'multiple') {
    return value.map(dt => dt.toJSDate());
  }
  if (mode === 'range') {
    let { start, end } = value;
    start = toInternalValue('single', start);
    end = toInternalValue('single', end);
    return { start, end };
  }
  // single
  return value.toJSDate();
}

export default {
  name: 'DatePicker',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledDates: {
      type: Object,
      default() {
        return null;
      },
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    maxDate: {
      type: Object,
      default() {
        return null;
      },
    },
    minDate: {
      type: Object,
      default() {
        return null;
      },
    },
    name: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'm',
    },
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
    disabledDatesJS() {
      return toInternalValue('range', this.disabledDates);
    },
    internalValue: {
      get() {
        const { mode } = this.$attrs;
        return toInternalValue(mode, this.value);
      },
      set(internalValue) {
        const { mode } = this.$attrs;
        const value = fromInternalValue(mode, internalValue);
        this.$emit('input', value);
      },
    },
    maxDateJS() {
      return toInternalValue('single', this.maxDate);
    },
    minDateJS() {
      return toInternalValue('single', this.minDate);
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
.date-picker-control {
  align-items: center;
}
</style>
