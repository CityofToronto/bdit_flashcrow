<template>
  <div class='get-MVCR'>
    <FcDialogConfirm
      v-model="showMvcrAccessDialog"
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
    <template v-if="collisionHasMvcrFile">
      <template v-if="userHasMvcrReadPermission">
        <a :href="'/api/mvcr/' + sampleMvcrFileName" target="_blank">View</a>
        &nbsp;
        <button v-on:click="download">Download</button>
      </template>
      <template v-else>
        <a v-on:click="showMvcrAccessDialog = !showMvcrAccessDialog">Request Access</a>
      </template>
    </template>
    <template v-else>
      <p class="unavailable">Unavailable</p>
    </template>
  </div>
</template>

<script>
import { AuthScope } from '@/lib/Constants';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { getMVCR } from '@/lib/api/WebApi';
import { saveAs } from 'file-saver';

export default {
  name: 'MvcrLink',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcDialogConfirm,
  },
  data() {
    return {
      showMvcrAccessDialog: false,
    };
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    async download() {
      if (this.hasMvcrReadPermission) {
        const mvcrPdf = await getMVCR(this.sampleMvcrFileName);
        saveAs(mvcrPdf, this.sampleMvcrFileName);
      } else {
        this.accessDenied();
      }
      return true;
    },
    requestAccess() {
      const subject = 'Requesting MVCR access';
      const subjectEncoded = window.encodeURIComponent(subject);
      const url = `mailto:move-team@toronto.ca?subject=${subjectEncoded}`;
      window.open(url, '_blank');
    },
  },
  computed: {
    collisionHasMvcrFile() {
      return this.value;
    },
    userHasMvcrReadPermission() {
      return this.hasAuthScope(AuthScope.MVCR_READ);
    },
    sampleMvcrFileName() {
      return 'sample_mvcr_redacted.pdf';
    },
  },
};
</script>

<style lang="scss">
  .get-MVCR {
    color: var(--v-anchor-base);
    text-align: center;
    font-weight: bold;
  }

  .get-MVCR a {
    text-decoration: none;
  }

  .get-MVCR .unavailable {
    color: #757575;
    margin: 0;
  }

  .email {
    font-weight: bold;
  }

  button.primary--text:last-child {
    background-color: var(--v-anchor-base);

    span {
      color: white;
    }
  }
</style>
