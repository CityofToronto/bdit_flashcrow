<template>
  <v-app
    id="fc_app"
    :class="frontendEnv.appClass">
    <component
      v-if="hasDialog"
      v-model="hasDialog"
      :is="'FcDialog' + dialog"
      v-bind="dialogData" />
    <component
      v-if="hasToast"
      v-model="hasToast"
      :key="toastKey"
      :is="'FcToast' + toast"
      v-bind="toastData" />
    <v-navigation-drawer
      app
      class="fc-navigation-drawer"
      mini-variant
      permanent>
      <template v-slot:prepend>
        <FcDashboardNavBrand />
      </template>
      <FcDashboardNav />
      <template v-slot:append>
        <FcDashboardNavUser />
      </template>
    </v-navigation-drawer>
    <v-main>
      <v-container
        class="d-flex fill-height flex-column pa-0"
        fluid>
        <FcDashboardNavInDevelopment
          v-if="frontendEnv !== FrontendEnv.PROD" />
        <div class="flex-grow-1" style="width: 100%;">
          <router-view></router-view>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import '@mdi/font/css/materialdesignicons.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/web/css/main.scss';

import FcDialogAlertStudyRequestUrgent
  from '@/web/components/dialogs/FcDialogAlertStudyRequestUrgent.vue';
import FcDialogAlertStudyRequestsUnactionable
  from '@/web/components/dialogs/FcDialogAlertStudyRequestsUnactionable.vue';
import FcDialogAlertStudyTypeUnactionable
  from '@/web/components/dialogs/FcDialogAlertStudyTypeUnactionable.vue';
import FcDialogConfirmUnauthorized
  from '@/web/components/dialogs/FcDialogConfirmUnauthorized.vue';
import FcToastBackendError from '@/web/components/dialogs/FcToastBackendError.vue';
import FcToastError from '@/web/components/dialogs/FcToastError.vue';
import FcToastInfo from '@/web/components/dialogs/FcToastInfo.vue';
import FcToastJob from '@/web/components/dialogs/FcToastJob.vue';
import FcDashboardNav from '@/web/components/nav/FcDashboardNav.vue';
import FcDashboardNavBrand from '@/web/components/nav/FcDashboardNavBrand.vue';
import FcDashboardNavInDevelopment from '@/web/components/nav/FcDashboardNavInDevelopment.vue';
import FcDashboardNavUser from '@/web/components/nav/FcDashboardNavUser.vue';
import FrontendEnv from '@/web/config/FrontendEnv';

export default {
  name: 'App',
  components: {
    FcDashboardNav,
    FcDashboardNavBrand,
    FcDashboardNavInDevelopment,
    FcDashboardNavUser,
    FcDialogAlertStudyRequestUrgent,
    FcDialogAlertStudyRequestsUnactionable,
    FcDialogAlertStudyTypeUnactionable,
    FcDialogConfirmUnauthorized,
    FcToastBackendError,
    FcToastError,
    FcToastInfo,
    FcToastJob,
  },
  data() {
    return { FrontendEnv };
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
          this.clearDialog();
        }
      },
    },
    ...mapState([
      'auth',
      'dialog',
      'dialogData',
      'frontendEnv',
      'toast',
      'toastData',
      'toastKey',
    ]),
  },
  methods: {
    ...mapMutations(['clearDialog', 'clearToast']),
  },
};
</script>

<style lang="scss">
#fc_app {
  --full-height: calc(100vh - 52px);

  color: var(--v-default-base);
  font-size: 0.875rem;
  font-weight: normal;
  line-height: 1.25rem;

  &.is-prod {
    --full-height: 100vh;
  }

  & .fc-navigation-drawer {
    overflow: visible;
  }

  & .v-input--selection-controls__input + .v-label {
    color: var(--v-default-base);
    padding-left: 24px;
  }
}
</style>
