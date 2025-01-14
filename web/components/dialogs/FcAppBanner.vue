<template>
  <div>
    <v-alert
      v-model="alert"
      :type="alertType"
      dismissible
      max-height="48px"
      close-label="Close Alert"
      :class="{ 'fc-appbanner': !display, visibleBanner: display}"
      >
      <v-row align="center">
        <v-col class="grow">
          {{ bannerMessage }}
        </v-col>
        <v-col v-if="bannerButton" class="shrink">
          <FcButton
          class="alert-button"
          type="secondary"
          >
          <a target="_blank" :href=buttonLink>More information</a>
        </FcButton>
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
  props: {
    bannerMessage: String,
    display: Boolean,
    alertType: String,
    buttonLink: String,
    buttonText: String,
    bannerButton: Boolean,
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
  }

  .v-icon {
    align-self: center !important;
  }

  .alert-button {
    height: 28px !important;
  }

  a {
    text-decoration: none !important;
    color: black !important;
  }
</style>
