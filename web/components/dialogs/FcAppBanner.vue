<template>
  <div class="banner-container">
    <v-alert
      v-model="alert"
      text
      shaped
      :type="banner.bannerType"
      dismissible
      max-height="48px"
      close-label="Close Alert"
      :class="{ 'fc-appbanner': !banner.displayBanner, visibleBanner: banner.displayBanner}"
      >
      <v-row align="center">
        <v-col class="grow">
          <p class="app-banner-message">{{ banner.bannerMessage }}</p>
        </v-col>
        <v-col v-if="banner.displayButton" class="shrink">
          <a target="_blank" :href=banner.buttonLink>
            <FcButton
            class="alert-button"
            type="secondary"
            >
              Learn More
          </FcButton>
          </a>
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcAppBanner',
  components: {
    FcButton,
  },
  data() {
    return {
      alert: true,
    };
  },
  computed: {
    ...mapState(['banner']),
  },
  watch: {
    banner: {
      handler() {
        if (!this.alert && this.banner.displayBanner) {
          this.alert = true;
        }
      },
    },
  },
};
</script>
<style scoped>
  .fc-appbanner {
    display: none;
  }
  .visibleBanner {
    display: block;
    margin-bottom: 0 !important;
    padding: 8px 20px !important;
    width: 100% !important;
  }

  .v-icon {
    align-self: center !important;
  }

  .alert-button {
    height: 28px !important;
  }

  .banner-container {
    display: flex;
  }

  #fc_app > div > header > div > div:nth-child(2) > div {
    min-width: 540px;
    flex-grow: 1;
  }

  .app-banner-message {
    margin-bottom: 0;
    word-wrap: break-word;
  }

  a {
    text-decoration: none !important;
    color: black !important;
  }

  @media only screen and (max-width: 1190px) {
    .visibleBanner {
      font-size: 0.8rem;
    }
  }

  @media only screen and (max-width: 1068px) {
    .visibleBanner {
      font-size: 0.8rem;
    }
  }

  @media only screen and (max-width: 990px) {
    .visibleBanner {
    display: none;
  }
}
</style>
