<template>
  <div>
    <a v-if="hasMvcrReadPermission"
      :href="'/api/mvcr/' + sampleMvcrFileName" target="_blank">view</a>
    <a v-else v-on:click="accessDenied">view</a>
    &nbsp;
    <button v-on:click="download">download</button>
  </div>
</template>

<script>
import { AuthScope } from '@/lib/Constants';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { mapMutations } from 'vuex';

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
    download() {
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
