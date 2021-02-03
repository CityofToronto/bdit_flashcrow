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
    <FcNavbar />
    <v-main tag="div">
      <v-container
        class="d-flex fill-height flex-column pa-0"
        fluid>
        <FcEnvBanner
          v-if="frontendEnv !== FrontendEnv.PROD" />
        <main class="flex-grow-1" style="width: 100%;">
          <h1 class="sr-only">{{textH1}}</h1>
          <router-view></router-view>
        </main>
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
import FcEnvBanner from '@/web/components/nav/FcEnvBanner.vue';
import FcNavbar from '@/web/components/nav/FcNavbar.vue';
import FrontendEnv from '@/web/config/FrontendEnv';

export default {
  name: 'App',
  components: {
    FcDialogAlertStudyRequestUrgent,
    FcDialogAlertStudyRequestsUnactionable,
    FcDialogAlertStudyTypeUnactionable,
    FcDialogConfirmUnauthorized,
    FcEnvBanner,
    FcNavbar,
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
    textH1() {
      if (this.title === '') {
        return this.frontendEnv.appTitle;
      }
      return this.title;
    },
    ...mapState([
      'auth',
      'dialog',
      'dialogData',
      'frontendEnv',
      'title',
      'toast',
      'toastData',
      'toastKey',
    ]),
  },
  watch: {
    title: {
      handler() {
        let pageTitle = this.frontendEnv.appTitle;
        if (this.title !== '') {
          pageTitle = `${pageTitle} \u00b7 ${this.title}`;
        }

        const $title = document.querySelector('title');
        $title.innerText = pageTitle;
        document.title = pageTitle;
      },
      immediate: true,
    },
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

  & .v-tooltip__content {
    background: rgba(33, 33, 33, 0.9);
    font-size: 1rem;
  }
}
</style>
