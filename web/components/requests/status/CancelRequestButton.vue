<template>
  <div>
    <FcButton
      class="ml-2"
      type="secondary"
      :disabled="disabled"
      @click="showDialog = true">
      CANCEL
    </FcButton>
    <CancelStudyRequestConfirmDialog
      :showDialog="showDialog"
      :nRequests="nRequests"
      @cancelConfirmed="cancel"
      @close="showDialog = false"
    />
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import CancelStudyRequestConfirmDialog from '@/web/components/dialogs/CancelStudyRequestConfirmDialog.vue';

export default {
  name: 'CancelRequestButton',
  components: {
    FcButton,
    CancelStudyRequestConfirmDialog,
  },
  data() {
    return {
      showDialog: false,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
    nRequests: {
      type: Number,
      default: 1,
    },
  },
  methods: {
    cancel() {
      this.showDialog = false;
      this.$emit('cancel-request');
    },
  },
};
</script>
