<template>
  <v-combobox
    v-model="internalValue"
    append-icon="mdi-plus"
    deletable-chips
    multiple
    outlined
    small-chips
    v-bind="$attrs"></v-combobox>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcInputTextArray',
  mixins: [FcMixinVModelProxy(Array)],
};
</script>
