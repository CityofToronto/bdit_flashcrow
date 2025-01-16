<template>
  <v-app-bar
    app
    class="fc-appbar elevation-0"
    color="white"
    clipped-left
    dense>
    <div class="appbar-logo-name">
      <FcDashboardNavBrand />
      <h1 class="headline ml-2 no-select">{{textH1}}</h1>
    </div>
    <FcAppBanner/>
    <v-chip class="ml-2" small>
      {{frontendEnv.name.toLowerCase()}} v{{frontendMeta.version}}
    </v-chip>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import FcDashboardNavBrand from '@/web/components/nav/FcDashboardNavBrand.vue';
import FrontendEnv from '@/web/config/FrontendEnv';
import FrontendMeta from '@/web/config/FrontendMeta';
import FcAppBanner from '../dialogs/FcAppBanner.vue';

export default {
  name: 'FcAppbar',
  components: {
    FcDashboardNavBrand,
    FcAppBanner,
  },
  data() {
    const frontendMeta = FrontendMeta.get();
    return {
      FrontendEnv,
      frontendMeta,
    };
  },
  async mounted() {
    await this.retrieveBannerState();
  },
  computed: {
    textH1() {
      if (this.title === '') {
        return FrontendEnv.PROD.appTitle;
      }
      return `${FrontendEnv.PROD.appTitle} \u00b7 ${this.title}`;
    },
    urlProd() {
      return `https://move.intra.prod-toronto.ca${this.$route.fullPath}`;
    },
    ...mapState(['frontendEnv', 'title', 'banner']),
  },
  methods: {
    actionProd() {
      window.open(this.urlProd, '_blank');
    },
    ...mapActions(['retrieveBannerState']),
  },
};
</script>

<style lang="scss">
.fc-appbar {
  display: flex;
  justify-content: space-between;
  width: 100%;
  & > .v-toolbar__content {
    display: flex;
    border-bottom: 1px solid var(--v-border-base);
    width: 100%;
    justify-content: space-between;
  }
  .no-select {
    user-select: none;
  }
}

.appbar-logo-name{
  display: flex;
  flex-direction: row;
  align-items: center;
}

@media only screen and (max-width: 800px) {
    .spacer {
    display: none;
  }
}
</style>
