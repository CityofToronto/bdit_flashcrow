<template>
  <fieldset>
    <legend class="headline">{{title}}</legend>

    <v-checkbox
      v-for="item in items"
      :key="item.value"
      v-model="internalValue"
      class="mt-2"
      hide-details
      :label="item.text"
      :value="item.value"></v-checkbox>
  </fieldset>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcMvcrFieldFilter',
  mixins: [FcMixinVModelProxy(Array)],
  props: {
    fieldName: String,
    title: String,
  },
  computed: {
    items() {
      const fieldEntries = this.collisionFactors.get(this.fieldName);
      const items = Array.from(fieldEntries)
        .map(([value, { description }]) => ({
          value,
          text: description,
        }));
      return ArrayUtils.sortBy(items, ({ value }) => value);
    },
    ...mapState('viewData', ['collisionFactors']),
  },
};
</script>
