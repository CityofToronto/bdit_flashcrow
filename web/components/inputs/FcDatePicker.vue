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
          hide-details
          label="Due Date"
          outlined
          readonly
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

function toInternalValue(value) {
  if (value === null) {
    return null;
  }
  return value.toISODate();
}

export default {
  name: 'FcDatePicker',
  props: {
    label: {
      type: String,
      default: null,
    },
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
    valueFormatted() {
      return TimeFormatters.formatDefault(this.value);
    },
  },
};
</script>
