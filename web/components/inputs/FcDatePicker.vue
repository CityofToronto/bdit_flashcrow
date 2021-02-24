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
      <template v-slot:activator="{ attrs: attrsMenu, on: onMenu }">
        <div v-bind="attrsMenu">
          <v-text-field
            v-model="valueFormatted"
            append-icon="mdi-calendar"
            offset-y
            v-bind="$attrs"
            @blur="resetValueFormatted"
            @input="updateValueFormatted"
            @click:append="showMenu = !showMenu"
            v-on="onMenu">
            <template v-slot:append>
              <FcTooltip right>
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
              </FcTooltip>
            </template>
          </v-text-field>
        </div>
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
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';

const REGEX_VALUE_FORMATTED = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;

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
  const match = REGEX_VALUE_FORMATTED.exec(valueFormatted);
  if (match === null) {
    return null;
  }
  const dt = DateTime.fromISO(valueFormatted);
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
  components: {
    FcTooltip,
  },
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
      const {
        disabled = false,
        success = false,
        'error-messages': errorMessages = [],
      } = this.$attrs;
      if (disabled) {
        return 'unselected';
      }
      if (success) {
        return 'success';
      }
      if (errorMessages.length > 0) {
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
