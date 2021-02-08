<template>
  <v-textarea
    v-model="internalValue"
    class="fc-textarea"
    counter
    :label="label"
    no-resize
    outlined
    rows="4"
    v-bind="$attrs" />
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcTextarea',
  mixins: [FcMixinVModelProxy(String)],
  props: {
    label: String,
  },
};
</script>
