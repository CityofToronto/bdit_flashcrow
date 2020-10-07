<template>
  <FcToast
    v-model="internalValue"
    color="error"
    :text="err.response.data.message">
    <template v-slot:icon>
      <v-icon left>mdi-alert-circle</v-icon>
    </template>
  </FcToast>
</template>

<script>
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcToastBackendError',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToast,
  },
  props: {
    err: Error,
  },
};
</script>
