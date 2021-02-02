<template>
  <header role="banner">
    <v-tooltip
      right
      :z-index="100">
      <template v-slot:activator="{ on }">
        <v-list-item
          v-on="on"
          class="fc-nav-brand"
          link
          :to="{ name: 'viewData' }"
          @click="actionClick">
          <v-list-item-icon>
            <v-img
              alt="MOVE Logo"
              src="/logo_square.png"></v-img>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{frontendEnv.appTitle}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <span>{{frontendEnv.appTitle}}</span>
    </v-tooltip>
  </header>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcDashboardNavBrand',
  computed: {
    ...mapState(['frontendEnv']),
  },
  methods: {
    actionClick() {
      const event = this.$analytics.buttonEvent('MOVE', this.$el);
      this.$analytics.send([event]);
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
