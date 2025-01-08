<template>
  <v-app-bar
    app
    class="fc-appbar elevation-0"
    color="white"
    clipped-left
    dense>
    <FcDashboardNavBrand />
    <h1 class="headline ml-2 no-select">{{textH1}}</h1>
    <v-spacer></v-spacer>
    <div :v-if=showBanner>
      <FcAppBanner :message=message :color=color />
    </div>
    <v-spacer></v-spacer>
    <v-chip class="ml-2" small>
      {{frontendEnv.name.toLowerCase()}} v{{frontendMeta.version}}
    </v-chip>

  </v-app-bar>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

import FcDashboardNavBrand from '@/web/components/nav/FcDashboardNavBrand.vue';
import FrontendEnv from '@/web/config/FrontendEnv';
import FrontendMeta from '@/web/config/FrontendMeta';
import FcAppBanner from '@/web/components/dialogs/FcAppBanner.vue';

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
      color: null,
      message: null,
      showBanner: false,
    };
  },
  async mounted() {
    // eslint-disable-next-line no-console
    console.log('first', this);
    await this.retrieveBannerState();
    this.message = this.bannerMessage;
    this.color = this.bannerColor;
    // eslint-disable-next-line no-console
    console.log('test', this);
  },
  watch: {
    bannerMessage: {
      handler() {
        // eslint-disable-next-line no-console
        console.log('testawd');
        this.message = this.bannerMessage;
        this.color = this.bannerColor;
      },
      immediate: true,
    },
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
    ...mapGetters(['banner', 'bannerMessage']),
    ...mapState(['frontendEnv', 'title', 'bannerState', 'bannerMessage', 'bannerColor']),
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
  & > .v-toolbar__content {
    border-bottom: 1px solid var(--v-border-base);
  }
  .no-select {
    user-select: none;
  }
}
</style>
