<template>
  <div>
    <FcButton
      class="ml-2"
      type="secondary"
      :disabled="disabled"
      @click="showDialog = true">
      CANCEL
    </FcButton>
    <FcDialogConfirm
      v-model="showDialog"
      textCancel="No"
      textOk="Yes, cancel it"
      title="Cancel Confirmation"
      okButtonType="primary"
      @action-ok="cancel">
      <div class="body-1">
        <p>
          Are you sure you want to cancel this Study Request?
        </p>
      </div>
    </FcDialogConfirm>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';

export default {
  name: 'CancelRequestButton',
  components: {
    FcButton,
    FcDialogConfirm,
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
  },
  methods: {
    cancel() {
      this.$emit('cancel-request');
    },
  },
};
</script>
