<template>
  <FcButton
    class="ml-2"
    type="secondary"
    :disabled="disabled"
    @click="$emit('cancel-request')">
    CANCEL
  </FcButton>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'CancelRequestButton',
  components: {
    FcButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
