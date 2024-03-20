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
    <FcAppbar />
    <FcNavbar />
    <v-main>
      <router-view></router-view>
    </v-main>
    <FcGlobalFilterDrawer
      v-model="internalFiltersOpen" />
  </v-app>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import '@mdi/font/css/materialdesignicons.min.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/web/css/main.scss';

import FcDialogAlertStudyRequestUrgent
  from '@/web/components/dialogs/FcDialogAlertStudyRequestUrgent.vue';
import FcDialogAlertStudyTypeUnactionable
  from '@/web/components/dialogs/FcDialogAlertStudyTypeUnactionable.vue';
import FcDialogConfirmUnauthorized
  from '@/web/components/dialogs/FcDialogConfirmUnauthorized.vue';
import FcToastBackendError from '@/web/components/dialogs/FcToastBackendError.vue';
import FcToastError from '@/web/components/dialogs/FcToastError.vue';
import FcToastInfo from '@/web/components/dialogs/FcToastInfo.vue';
import FcToastJob from '@/web/components/dialogs/FcToastJob.vue';
import FcGlobalFilterDrawer from '@/web/components/filters/FcGlobalFilterDrawer.vue';
import FcAppbar from '@/web/components/nav/FcAppbar.vue';
import FcNavbar from '@/web/components/nav/FcNavbar.vue';
import FrontendEnv from '@/web/config/FrontendEnv';
import FcToastMvcrJob from '@/web/components/dialogs/FcToastMvcrJob.vue';

export default {
  name: 'App',
  components: {
    FcAppbar,
    FcDialogAlertStudyRequestUrgent,
    FcDialogAlertStudyTypeUnactionable,
    FcDialogConfirmUnauthorized,
    FcGlobalFilterDrawer,
    FcNavbar,
    FcToastBackendError,
    FcToastError,
    FcToastInfo,
    FcToastJob,
    FcToastMvcrJob,
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
    internalFiltersOpen: {
      get() {
        return this.filtersOpen;
      },
      set(filtersOpen) {
        this.setFiltersOpen(filtersOpen);
      },
    },
    ...mapState([
      'ariaNotification',
      'auth',
      'dialog',
      'dialogData',
      'filtersOpen',
      'frontendEnv',
      'toast',
      'toastData',
      'toastKey',
    ]),
    ...mapGetters(['pageTitle']),
  },
  watch: {
    ariaNotification() {
      const $ariaNotification = document.querySelector('#aria_notification');
      $ariaNotification.innerText = this.ariaNotification;
    },
    pageTitle: {
      handler() {
        const $title = document.querySelector('title');
        $title.innerText = this.pageTitle;
        document.title = this.pageTitle;
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations(['clearDialog', 'clearToast', 'setFiltersOpen']),
  },
};
</script>

<style lang="scss">
#fc_app {
  --full-height: calc(100vh - 48px);

  color: var(--v-default-base);
  font-size: 0.875rem;
  font-weight: normal;
  line-height: 1.25rem;

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

  & .v-breadcrumbs .v-breadcrumbs__item--disabled {
    color: var(--v-secondary-base);
  }
}
</style>
