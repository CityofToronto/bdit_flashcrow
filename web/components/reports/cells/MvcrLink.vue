<template>
  <div class='get-MVCR'>
    <template v-if="collisionHasMvcrFile">
      <template v-if="userHasMvcrReadPermission">
        <a :href="'/api/mvcr/' + sampleMvcrFileName" target="_blank">View</a>
        &nbsp;
        <button v-on:click="download">Download</button>
      </template>
      <template v-else>
        <a v-on:click="accessDenied">Request Access</a>
      </template>
    </template>
    <template v-else>
      <p class="unavailable">Unavailable</p>
    </template>
  </div>
</template>

<script>
import { AuthScope } from '@/lib/Constants';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { mapMutations } from 'vuex';
import { getMVCR } from '@/lib/api/WebApi';
import { saveAs } from 'file-saver';

export default {
  name: 'MvcrLink',
  mixins: [
    FcMixinAuthScope,
  ],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    ...mapMutations(['setDialog']),
    async download() {
      if (this.hasMvcrReadPermission) {
        const mvcrPdf = await getMVCR(this.sampleMvcrFileName);
        saveAs(mvcrPdf, this.sampleMvcrFileName);
      } else {
        this.accessDenied();
      }
      return true;
    },
    accessDenied() {
      window.alert('You must have MVCR_READ permission to view or download MVCRs'); // eslint-disable-line no-alert
      return false;
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
