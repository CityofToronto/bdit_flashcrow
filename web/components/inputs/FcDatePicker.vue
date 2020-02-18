<template>
  <div>
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      max-width="290px"
      min-width="290px"
      offset-y
      transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="valueFormatted"
          append-icon="mdi-calendar"
          offset-y
          outlined
          v-bind="$attrs"
          @blur="resetValueFormatted"
          @input="updateValueFormatted"
          v-on="on"></v-text-field>
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
