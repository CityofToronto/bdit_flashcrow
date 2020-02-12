<template>
  <v-app id="fc_app">
    <v-snackbar
      v-if="hasToast"
      v-model="hasToast"
      bottom
      :color="toast.variant"
      left>
      {{toast.text}}
    </v-snackbar>
    <v-navigation-drawer
      app
      mini-variant
      permanent>
      <template v-slot:prepend>
        <div class="pa-2 pt-3">
          <v-img
            alt="MOVE Logo"
            src="/logo_square.png"></v-img>
        </div>
      </template>
      <v-list
        class="d-flex fill-height flex-column justify-center"
        dense>
        <FcDashboardNavItem
          icon="map"
          label="View Map"
          :to="{ name: 'viewData' }" />
        <FcDashboardNavItem
          icon="clipboard-list"
          label="Track Requests"
          :to="{ name: 'requestsTrack' }" />
      </v-list>
      <template v-slot:append>
        <FcDashboardNavUser />
      </template>
    </v-navigation-drawer>
    <v-content>
      <v-container
        class="fill-height pa-0"
        fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@/web/css/main.scss';

import FcDashboardNavItem from '@/web/components/nav/FcDashboardNavItem.vue';
import FcDashboardNavUser from '@/web/components/nav/FcDashboardNavUser.vue';

export default {
  name: 'App',
  components: {
    FcDashboardNavItem,
    FcDashboardNavUser,
  },
  computed: {
    hasToast: {
      get() {
        return this.toast !== null;
      },
      set(hasToast) {
        if (!hasToast) {
          this.clearToast();
        }
      },
    },
    ...mapState([
      'auth',
      'location',
      'toast',
    ]),
  },
  methods: {
    ...mapMutations(['clearToast']),
  },
};
</script>

<style lang="scss">
#fc_app {
  font-size: 0.875rem;
  font-weight: normal;
  line-height: 1.25rem;
}
</style>
