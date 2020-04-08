<template>
  <v-app id="fc_app">
    <component
      v-if="hasDialog"
      v-model="hasDialog"
      :is="'FcDialog' + dialog"
      v-bind="dialogData" />
    <v-snackbar
      v-if="hasToast"
      v-model="hasToast"
      bottom
      class="fc-toast"
      :color="toast.variant"
      left
      :timeout="10000">
      <span class="body-1">{{toast.text}}</span>
    </v-snackbar>
    <v-navigation-drawer
      app
      mini-variant
      permanent>
      <template v-slot:prepend>
        <FcDashboardNavBrand />
      </template>
      <v-list
        class="d-flex fill-height flex-column justify-center"
        dense>
        <FcDashboardNavItem
          :active-route-names="[
            'requestStudyEdit',
            'requestStudyNew',
            'requestStudyView',
            'viewDataAtLocation',
            'viewReportsAtLocation',
          ]"
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

import FcDialogAlertStudyRequestUrgent from
  '@/web/components/dialogs/FcDialogAlertStudyRequestUrgent.vue';
import FcDialogConfirmUnauthorized from
  '@/web/components/dialogs/FcDialogConfirmUnauthorized.vue';
import FcDashboardNavBrand from '@/web/components/nav/FcDashboardNavBrand.vue';
import FcDashboardNavItem from '@/web/components/nav/FcDashboardNavItem.vue';
import FcDashboardNavUser from '@/web/components/nav/FcDashboardNavUser.vue';

export default {
  name: 'App',
  components: {
    FcDashboardNavBrand,
    FcDashboardNavItem,
    FcDashboardNavUser,
    FcDialogAlertStudyRequestUrgent,
    FcDialogConfirmUnauthorized,
  },
  computed: {
    hasDialog: {
      get() {
        return this.dialog !== null;
      },
      set(hasDialog) {
        if (!hasDialog) {
          this.clearDialog();
        }
      },
    },
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
      'dialog',
      'dialogData',
      'location',
      'toast',
    ]),
  },
  methods: {
    ...mapMutations(['clearDialog', 'clearToast']),
  },
};
</script>

<style lang="scss">
#fc_app {
  color: var(--v-default-base);
  font-size: 0.875rem;
  font-weight: normal;
  line-height: 1.25rem;

  & .fc-toast {
    left: 76px;
  }

  & .v-input--selection-controls__input + .v-label {
    color: var(--v-default-base);
    padding-left: 24px;
  }
}
</style>
