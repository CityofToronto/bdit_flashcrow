<template>
  <v-combobox
    v-model="internalValue"
    ref="comboInput"
    append-icon="mdi-plus"
    hide-no-data
    multiple
    outlined
    v-bind="$attrs">
    <template v-slot:label>
      {{ inputLabel }}
    </template>
    <template v-slot:selection="{ attrs, item, parent, selected }">
      <v-chip
        color="secondary"
        :input-value="selected"
        label
        small
        v-bind="attrs">
        <span>{{item}}</span>
        <v-icon
          :aria-label="'Remove ' + item"
          right
          small
          @click="parent.selectItem(item)">
          mdi-close-circle
        </v-icon>
      </v-chip>
    </template>
  </v-combobox>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcInputTextArray',
  mixins: [FcMixinVModelProxy(Array)],
  props: {
    label: String,
    optional: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    inputLabel() {
      let inputLabel = this.label;
      if (this.optional) inputLabel = `${inputLabel} (optional)`;
      return inputLabel;
    },
  },
};
</script>
