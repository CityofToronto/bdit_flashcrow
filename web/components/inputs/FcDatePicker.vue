<template>
  <div class="fc-date-picker">
    <v-menu
      v-model="showMenu"
      :attach="$el"
      :close-on-content-click="false"
      max-width="290px"
      min-width="290px"
      offset-y
      transition="scale-transition">
      <template v-slot:activator="{ attrs, on: onMenu }">
        <v-text-field
          v-model="valueFormatted"
          append-icon="mdi-calendar"
          offset-y
          v-bind="{ ...attrs, ...$attrs }"
          @blur="resetValueFormatted"
          @input="updateValueFormatted"
          @click:append="showMenu = !showMenu"
          v-on="onMenu">
          <template v-slot:append>
            <v-tooltip right>
              <template v-slot:activator="{ on: onTooltip }">
                <v-icon
                  aria-label="Select date using calendar"
                  :color="color"
                  right
                  v-on="{
                    ...onMenu,
                    ...onTooltip,
                  }">
                  mdi-calendar
                </v-icon>
              </template>
              <span>Select date using calendar</span>
            </v-tooltip>
          </template>
        </v-text-field>
      </template>
      <v-date-picker
        v-model="internalValue"
        :max="internalMax"
        :min="internalMin"
        no-title
        @input="showMenu = false">
      </v-date-picker>
    </v-menu>
  </div>
</template>

<script>
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

function fromInternalValue(internalValue) {
  if (internalValue === null) {
    return null;
  }
  return DateTime.fromISO(internalValue);
}

function fromValueFormatted(valueFormatted) {
  if (valueFormatted === null) {
    return null;
  }
  const dt = DateTime.fromLocaleString(valueFormatted);
  if (!dt.isValid) {
    return null;
  }
  return dt;
}

function toInternalValue(value) {
  if (value === null) {
    return null;
  }
  return value.toISODate();
}

export default {
  name: 'FcDatePicker',
  props: {
    max: {
      type: DateTime,
      default() { return null; },
    },
    min: {
      type: DateTime,
      default() { return null; },
    },
    value: DateTime,
  },
  data() {
    return {
      showMenu: false,
      valueFormatted: TimeFormatters.formatDefault(this.value),
    };
  },
  computed: {
    color() {
      if (this.$attrs.disabled) {
        return 'unselected';
      }
      if (this.$attrs.success) {
        return 'success';
      }
      if (this.$attrs['error-messages'].length > 0) {
        return 'error';
      }
      return null;
    },
    internalMax() {
      return toInternalValue(this.max);
    },
    internalMin() {
      return toInternalValue(this.min);
    },
    internalValue: {
      get() {
        return toInternalValue(this.value);
      },
      set(internalValue) {
        const value = fromInternalValue(internalValue);
        this.$emit('input', value);
      },
    },
  },
  watch: {
    value() {
      this.resetValueFormatted();
    },
  },
  methods: {
    resetValueFormatted() {
      this.valueFormatted = TimeFormatters.formatDefault(this.value);
    },
    updateValueFormatted() {
      const value = fromValueFormatted(this.valueFormatted);
      if (value === null && this.valueFormatted !== '') {
        return;
      }
      this.$emit('input', value);
    },
  },
};
</script>

<style lang="scss">
.fc-date-picker {
  position: relative;
}
</style>
