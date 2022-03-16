<template>
  <div class='get-MVCR'>
    <FcDialogConfirm
      v-model="showMvcrAccessDialog"
      textCancel="Dismiss"
      textOk="Email to Request Access"
      title="MVCR Access Request"
      @action-ok="requestAccess">
      <span class="body-1">
        To access Motor Vehicle Collision Reports (MVCRs), please email...
      </span>
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

<style>
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
</style>
