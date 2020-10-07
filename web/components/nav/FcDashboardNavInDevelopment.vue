<template>
  <div class="fc-dashboard-nav-in-development align-center d-flex px-5 py-2 warning lighten-3">
    <h1 class="headline">
      This is a beta version of MOVE. If you encounter a bug, help make MOVE better
      by reporting it!
    </h1>
    <v-spacer></v-spacer>
    <FcButton
      type="secondary"
      @click="actionReportBug">
      <v-icon left>mdi-message-alert</v-icon>
      Report a Bug
    </FcButton>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { formatUsername } from '@/lib/StringFormatters';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDashboardNavInDevelopment',
  components: {
    FcButton,
  },
  computed: {
    urlReportBug() {
      const username = encodeURIComponent(this.username);
      const url = encodeURIComponent(window.location.href);
      return `https://docs.google.com/forms/d/e/1FAIpQLSeENA2S8dA678ENanNFwdZ811TUjVjIYolloBlRo12idib5UQ/viewform?entry.135357596=${username}&entry.1262500898=${url}`;
    },
    username() {
      if (this.auth.loggedIn) {
        return formatUsername(this.auth.user);
      }
      return '';
    },
    ...mapState(['auth']),
  },
  methods: {
    actionReportBug() {
      window.open(this.urlReportBug, '_blank');
    },
  },
};
</script>

<style lang="scss">
.fc-dashboard-nav-in-development {
  width: 100%;
}
</style>
