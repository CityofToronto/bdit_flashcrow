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
      textCancel="No, don't cancel"
      textOk="Yes, cancel"
      :title="`Cancel study request${isMultipleRequests ? 's' : ''}`"
      okButtonType="primary"
      @action-ok="cancel">
      <div class="body-1">
        <p>
          Are you sure you want to cancel
          {{ isMultipleRequests ? `${nRequests} requests` : "this request" }}?
          Data Collection staff and any subscribers will be notified by email.
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
    nRequests: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    isMultipleRequests() {
      return this.nRequests > 1;
    },
  },
  methods: {
    cancel() {
      this.$emit('cancel-request');
    },
  },
};
</script>
