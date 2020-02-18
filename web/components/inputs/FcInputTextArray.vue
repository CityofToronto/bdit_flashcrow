<template>
  <v-combobox
    v-model="internalValue"
    append-icon="mdi-plus"
    chips
    deletable-chips
    dense
    multiple
    outlined
    v-bind="$attrs"></v-combobox>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcInputTextArray',
  mixins: [FcMixinVModelProxy(Array)],
};
</script>
