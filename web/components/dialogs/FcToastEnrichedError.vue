<template>
  <FcToast
    v-model="internalValue"
    color="error"
    :html="html"
    >
    <template v-slot:icon>
      <v-icon left>mdi-alert-circle</v-icon>
    </template>
  </FcToast>
</template>

<script>
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcToastEnrichedError',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToast,
  },
  props: {
    html: String,
  },
};
</script>
