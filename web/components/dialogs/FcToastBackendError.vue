<template>
  <FcToastError
    v-model="internalValue"
    color="error"
    :text="err.response.data.message" />
</template>

<script>
import FcToastError from '@/web/components/dialogs/FcToastError.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcToastBackendError',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToastError,
  },
  props: {
    err: Error,
  },
};
</script>
