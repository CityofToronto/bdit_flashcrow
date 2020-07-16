<template>
  <div class="fc-dashboard-nav-in-development align-center d-flex px-5 py-2 warning lighten-3">
    <div class="headline">
      This is a development version of MOVE. You may experience unexpected downtime
      and bugs at this time!
    </div>
    <v-spacer></v-spacer>
    <FcButton
      class="mr-2"
      dense
      type="secondary"
      @click="actionLearnMore">
      <v-icon left>mdi-information</v-icon>
      Learn More
    </FcButton>
    <FcButton
      type="secondary"
      @click="actionContactUs">
      <v-icon left>mdi-email-send</v-icon>
      Contact Us
    </FcButton>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDashboardNavInDevelopment',
  components: {
    FcButton,
  },
  methods: {
    actionContactUs() {
      const url = 'mailto:move-team@toronto.ca';
      window.open(url, '_blank');
    },
    actionLearnMore() {
      this.setDialog({
        dialog: 'AlertInDevelopment',
        dialogData: {},
      });
    },
    ...mapMutations(['setDialog']),
  },
};
</script>

<style lang="scss">
.fc-dashboard-nav-in-development {
  width: 100%;
}
</style>
