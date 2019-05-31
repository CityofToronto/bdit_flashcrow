<template>
  <v-date-picker
    v-model="internalValue"
    class="date-picker-control flex-container-row"
    :disabled-attribute="disabledAttribute"
    popover-visibility="hover"
    :show-caps="true"
    :show-day-popover="false"
    :theme-styles="themeStyles"
    v-bind="$attrs">
    <template slot-scope="{ inputValue, updateValue }">
      <input
        type="text"
        class="input-date-picker flex-fill"
        :class="'font-size-' + size"
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        @input="updateValue($event.target.value, { formatInput: false, hidePopover: false })"
        @change="updateValue($event.target.value, { formatInput: true, hidePopover: false })"
        @keyup.esc="updateValue(internalValue, { formatInput: true, hidePopover: true })" />
      <i
        v-if="showIcon"
        class="fa fa-calendar-alt ml-m"
        :class="'font-size-' + size"></i>
    </template>
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
    showIcon: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'm',
    },
    value: [Date, Object],
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
.date-picker-control {
  align-items: center;
}
</style>
