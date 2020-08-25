<template>
  <FcToast
    v-model="internalValue"
    :text="text" />
</template>

<script>
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcToastInfo',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToast,
  },
  props: {
    text: String,
  },
};
</script>
