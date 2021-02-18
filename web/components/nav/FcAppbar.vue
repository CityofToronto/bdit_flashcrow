<template>
  <v-app-bar
    app
    class="fc-appbar elevation-0"
    color="white"
    clipped-left
    dense>
    <FcDashboardNavBrand />
    <h1 class="headline ml-2">{{textH1}}</h1>
    <v-chip
      v-if="frontendEnv !== FrontendEnv.PROD"
      class="ml-2"
      :color="frontendEnv.colorClass + ' darken-3'"
      dark
      small>
      {{frontendEnv.name.toLowerCase()}}
    </v-chip>

    <v-spacer></v-spacer>

    <FcButton
      v-if="frontendEnv !== FrontendEnv.PROD"
      type="secondary"
      @click="actionProd">
      <v-icon
        :aria-hidden="false"
        aria-label="Opens in a new window"
        left>
        mdi-open-in-new
      </v-icon>
      Open in release version
    </FcButton>
  </v-app-bar>
</template>

<script>
import { mapState } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDashboardNavBrand from '@/web/components/nav/FcDashboardNavBrand.vue';
import FrontendEnv from '@/web/config/FrontendEnv';

export default {
  name: 'FcAppbar',
  components: {
    FcButton,
    FcDashboardNavBrand,
  },
  data() {
    return { FrontendEnv };
  },
  computed: {
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
    textH1() {
      if (this.title === '') {
        return FrontendEnv.PROD.appTitle;
      }
      return `${FrontendEnv.PROD.appTitle} \u00b7 ${this.title}`;
    },
    urlProd() {
      return `https://move.intra.prod-toronto.ca${this.$route.fullPath}`;
    },
    ...mapState(['frontendEnv', 'title']),
  },
  methods: {
    actionProd() {
      window.open(this.urlProd, '_blank');
    },
  },
};
</script>

<style lang="scss">
.fc-appbar {
  & > .v-toolbar__content {
    border-bottom: 1px solid var(--v-border-base);
  }
}
</style>
