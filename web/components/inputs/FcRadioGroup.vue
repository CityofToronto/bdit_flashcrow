<template>
  <fieldset>
    <v-radio-group
      v-model="internalValue"
      class="mt-0"
      :label="label"
      v-bind="$attrs">
      <template v-slot:label>
        <span class="default--text headline">{{label}}</span>
      </template>
      <template v-for="(item, i) in itemsNormalized">
        <v-radio
          :key="'radio_' + i"
          :hint="item.hint"
          :value="item.value">
          <template v-slot:label>
            <div>
              <span>{{item.label}}</span>
              <template v-if="item.sublabel">
                <br>
                <span class="subtitle-2">{{item.sublabel}}</span>
              </template>
            </div>
          </template>
        </v-radio>
        <v-messages
          v-if="item.hint"
          :key="'hint_' + i"
          :class="{
            'mb-3': i !== items.length - 1
          }"
          :value="[item.hint]"></v-messages>
      </template>
    </v-radio-group>
  </fieldset>
</template>

<script>
/*
 * Assigning `:value="null"` to a `<v-radio>` results in the value actually taking
 * a default value equal to the index of the `<v-radio>` within its enclosing `<v-radio-group>`.
 * Since `null` values are occasionally useful (e.g. in `FcCollisionFilters`), we map these
 * to a value that is extremely unlikely to be used otherwise.
 */
const VALUE_NULL = '__null__';

function fromInternalValue(internalValue) {
  if (internalValue === VALUE_NULL) {
    return null;
  }
  return internalValue;
}

function toInternalValue(value) {
  if (value === null) {
    return VALUE_NULL;
  }
  return value;
}

export default {
  name: 'FcRadioGroup',
  props: {
    items: {
      type: Array,
      default() { return []; },
    },
    label: String,
    value: null,
  },
  computed: {
    itemsNormalized() {
      return this.items.map(({ value, ...rest }) => ({
        value: value === null ? VALUE_NULL : value,
        ...rest,
      }));
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
};
</script>
