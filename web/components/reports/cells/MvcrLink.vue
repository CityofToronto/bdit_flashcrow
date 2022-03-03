<template>
  <div>
    <template v-if="value">
      <a v-if="hasMvcrReadPermission"
        :href="'/api/mvcr/' + sampleMvcrFileName" target="_blank">View</a>
      <a v-else v-on:click="accessDenied">View</a>
      &nbsp;
      <button v-on:click="download">Download</button>
    </template>
    <template v-else>
      <p>Unavailable</p>
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
    hasMvcrReadPermission() {
      return this.hasAuthScope(AuthScope.MVCR_READ);
    },
    sampleMvcrFileName() {
      return 'sample_mvcr_redacted.pdf';
    },
  },
};
</script>
