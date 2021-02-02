<template>
  <div
    class="fc-dashboard-nav-in-development align-center d-flex px-5 py-2"
    :class="classesEnv">
    <h1 class="headline">
      This is the {{textEnv}} version of MOVE.  To open this page in the latest release version,
      click the button at right.
    </h1>
    <v-spacer></v-spacer>
    <FcButton
      type="secondary"
      @click="actionProd">
      <v-icon left>mdi-open-in-new</v-icon>
      Open in release version
    </FcButton>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';
import FrontendEnv from '@/web/config/FrontendEnv';

export default {
  name: 'FcDashboardNavInDevelopment',
  components: {
    FcButton,
  },
  data() {
    return { FrontendEnv };
  },
  computed: {
    classesEnv() {
      if (this.frontendEnv === FrontendEnv.LOCAL) {
        return 'light-green lighten-2';
      }
      if (this.frontendEnv === FrontendEnv.DEV) {
        return 'amber lighten-2';
      }
      if (this.frontendEnv === FrontendEnv.QA) {
        return 'light-blue lighten-3';
      }
      return '';
    },
    textEnv() {
      if (this.frontendEnv === FrontendEnv.LOCAL) {
        return 'local';
      }
      if (this.frontendEnv === FrontendEnv.DEV) {
        return 'development';
      }
      if (this.frontendEnv === FrontendEnv.QA) {
        return 'QA';
      }
      return '';
    },
    urlProd() {
      return `https://move.intra.prod-toronto.ca${this.$route.fullPath}`;
    },
    ...mapState(['frontendEnv']),
  },
  methods: {
    actionProd() {
      window.open(this.urlProd, '_blank');
    },
  },
};
</script>

<style lang="scss">
.fc-dashboard-nav-in-development {
  width: 100%;
}
</style>
