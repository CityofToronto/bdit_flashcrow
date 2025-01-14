<template>
  <div>
    <v-alert
      v-model="alert"
      :type="alertType"
      prominent
      dismissible
      close-label="Close Alert"
      :class="{ 'fc-appbanner': !display, visibleBanner: display}"
      >
      <v-row align="center">
        <v-col class="grow">
          {{ bannerMessage }}
        </v-col>
        <v-col v-if="bannerButton" class="shrink">
          <v-btn><a target="_blank" :href=buttonLink>More information</a></v-btn>
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcAppBanner',
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
    padding: 8px !important;
    padding-right: 20px !important;
  }

  a {
    text-decoration: none !important;
    color: white !important;
  }
</style>
