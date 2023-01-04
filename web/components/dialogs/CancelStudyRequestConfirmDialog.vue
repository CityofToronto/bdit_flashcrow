<template>
 <FcDialogConfirm
    v-model="show"
    textCancel="No, don't cancel"
    textOk="Yes, cancel"
    :title="titleText"
    okButtonType="primary"
    @action-ok="$emit('cancelConfirmed')">
    <div class="body-1">
      <p>
        Are you sure you want to cancel {{ bodyTextVariation }}?
        Data Collection staff and any subscribers will be notified by email.
      </p>
    </div>
  </FcDialogConfirm>
</template>

<script>
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';

export default {
  name: 'CancelStudyRequestConfirmDialog',
  components: {
    FcDialogConfirm,
  },
  props: {
    showDialog: {
      type: Boolean,
      required: true,
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
    requestStr() {
      let str = 'request';
      if (this.isMultipleRequests) str += 's';
      return str;
    },
    titleText() {
      return `Cancel study ${this.requestStr}`;
    },
    bodyTextVariation() {
      const variant = this.isMultipleRequests ? String(this.nRequests) : 'this';
      return `${variant} ${this.requestStr}`;
    },
    show: {
      get() {
        return this.showDialog;
      },
      set() {
        this.closeDialog();
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit('close');
      return true;
    },
  },
};
</script>
