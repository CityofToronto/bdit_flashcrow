<template>
  <FcToast
    v-model="internalValue"
    :action="action"
    :color="color"
    :text="text"
    @toast-action="actionToast" />
</template>

<script>
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcToastMvcrJob',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToast,
  },
  props: {
    job: Object,
  },
  computed: {
    action() {
      return 'Download';
    },
    color() {
      return 'black';
    },
    text() {
      return 'MVCRs Zipped';
    },
  },
};
</script>
