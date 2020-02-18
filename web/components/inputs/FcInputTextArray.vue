<template>
  <v-combobox
    v-model="internalValue"
    append-icon="mdi-plus"
    chips
    class="fc-input-text-array"
    deletable-chips
    dense
    hide-details
    multiple
    outlined></v-combobox>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcInputTextArray',
  mixins: [FcMixinVModelProxy(Array)],
};
</script>
