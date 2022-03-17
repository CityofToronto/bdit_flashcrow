<template>
  <FcDialogConfirm
    v-model="show"
    parentClass="mvcr-access-dialog"
    textCancel="Dismiss"
    textOk="Email to Request Access"
    title="MVCR Access Request"
    @action-ok="requestAccess">
    <div class="body-1">
      <p>
        To access Motor Vehicle Collision Reports (MVCRs), please email
        <span class='email'>move-team@toronto.ca</span>
        with the following information, and copy your direct manager.
      </p>
      <ul>
        <li>Subject: MVCR Access Request</li>
        <li>Your team</li>
        <li>Your role</li>
        <li>Reason for requiring MVCR data</li>
      </ul>
    </div>
  </FcDialogConfirm>
</template>

<script>
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';

export default {
  name: 'MvcrAccessDialog',
  components: {
    FcDialogConfirm,
  },
  props: {
    showDialog: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
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
    requestAccess() {
      const subject = 'Requesting MVCR access';
      const subjectEncoded = window.encodeURIComponent(subject);
      const url = `mailto:move-team@toronto.ca?subject=${subjectEncoded}`;
      window.open(url, '_blank');
    },
  },
};
</script>

<style lang="scss">
  .mvcr-access-dialog {
    .email {
      font-weight: bold;
    }
    button.primary--text:last-child {
      background-color: var(--v-anchor-base);
      span {
        color: white;
      }
    }
  }
</style>
