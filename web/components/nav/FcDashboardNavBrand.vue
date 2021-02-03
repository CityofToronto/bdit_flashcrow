<template>
  <v-tooltip
    bottom
    :z-index="100">
    <template v-slot:activator="{ on }">
      <v-app-bar-nav-icon
        @click="actionClick"
        v-on="on">
        <v-img
          alt="MOVE Logo"
          contain
          :max-height="32"
          :max-width="32"
          src="/logo_square.png"></v-img>
      </v-app-bar-nav-icon>
    </template>
    <span>{{textIcon}}</span>
  </v-tooltip>
</template>

<script>
import FrontendEnv from '@/web/config/FrontendEnv';

export default {
  name: 'FcDashboardNavBrand',
  data() {
    const textIcon = `${FrontendEnv.PROD.appTitle}: Home`;
    return { textIcon };
  },
  methods: {
    actionClick() {
      const event = this.$analytics.buttonEvent('MOVE', this.$el);
      this.$analytics.send([event]);
      this.$router.push({ name: 'viewData' });
    },
  },
};
</script>

<style lang="scss">
.v-application a.fc-nav-brand {
  color: transparent;
  &:focus {
    background-color: #e0e0e0;
  }
}
</style>
