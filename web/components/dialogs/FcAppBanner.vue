<template>
  <div>
    <v-alert
      v-model="alert"
      :type="alertType"
      dismissible
      close-label="Close Alert"
      class="fc-appbanner" :class="{visible: bannerClass}"
      >
      <p>
        {{ message }}
      </p>
    </v-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcAppBanner',
  props: {
    color: String,
    message: String,
    bannerClass: Boolean,
    alertType: String,
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
        if (!this.alert && this.banner.display) {
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
  .visible {
    display: block;
  }

  p {
    margin-bottom: 0;
  }
</style>
