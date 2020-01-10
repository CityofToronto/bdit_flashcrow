<template>
  <div class="fc-app full-screen flex-container-row">
    <FcToast
      v-if="toast"
      :variant="toast.variant">
      <span>{{toast.text}}</span>
    </FcToast>
    <div class="hide">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/api/auth/logout">
        <input type="hidden" name="csrf" :value="auth.csrf" />
      </form>
      <form
        v-if="$route.name !== 'adfsCallback'"
        ref="formSignIn"
        method="POST"
        action="/api/auth/adfs-init">
        <input type="hidden" name="csrf" :value="auth.csrf" />
        <input type="hidden" name="nonce" :value="nonce" />
      </form>
    </div>
    <component
      v-if="modal !== null"
      :is="modal.component"
      :data="modal.data"
      @modal-close="clearModal"></component>
    <div class="fc-sidebar flex-container-column">
      <FcDashboardBrand />
      <FcDashboardNav>
        <FcDashboardNavItem
          icon="map-marked-alt"
          label="View Map"
          :to="{ name: 'viewData' }" />
        <FcDashboardNavItem
          :disabled="!auth.loggedIn"
          icon="folder-plus"
          label="Request Study"
          :to="{ name: 'requestStudy' }" />
        <FcDashboardNavItem
          :disabled="!auth.loggedIn"
          icon="clipboard-list"
          label="Track Requests"
          :to="{ name: 'requestsTrack' }" />
      </FcDashboardNav>
      <div class="flex-fill"></div>
      <div class="text-center">
        <TdsActionDropdown
          v-if="auth.loggedIn"
          class="fc-user-dropup font-size-l"
          :options="userActions"
          @action-selected="onUserAction">
          <span class="text-ellipsis">
            <i class="fa fa-user-circle"></i>
            <span> {{username}}</span>
          </span>
        </TdsActionDropdown>
        <button
          v-else
          class="tds-button-primary font-size-l mb-m"
          :disabled="$route.name === 'adfsCallback'"
          type="button"
          @click="onClickLogin">
          <span>Log in </span>
          <TdsLoadingSpinner
            v-if="$route.name === 'adfsCallback'" />
        </button>
      </div>
    </div>
    <div class="fc-content flex-fill flex-container-column">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'v-calendar/lib/v-calendar.min.css';
import '@/web/components/tds/tds.postcss';

import ClientNonce from '@/lib/auth/ClientNonce';
import FcDashboardBrand from '@/web/components/FcDashboardBrand.vue';
import FcDashboardNav from '@/web/components/FcDashboardNav.vue';
import FcDashboardNavItem from '@/web/components/FcDashboardNavItem.vue';
import FcModalShowReports from '@/web/components/FcModalShowReports.vue';
import FcModalRequestStudyConfirmation from '@/web/components/FcModalRequestStudyConfirmation.vue';
import FcToast from '@/web/components/FcToast.vue';
import SearchBarLocation from '@/web/components/SearchBarLocation.vue';
import TdsActionDropdown from '@/web/components/tds/TdsActionDropdown.vue';
import TdsConfirmDialog from '@/web/components/tds/TdsConfirmDialog.vue';
import TdsLoadingSpinner from '@/web/components/tds/TdsLoadingSpinner.vue';

export default {
  name: 'App',
  components: {
    FcDashboardBrand,
    FcDashboardNav,
    FcDashboardNavItem,
    FcModalShowReports,
    FcModalRequestStudyConfirmation,
    FcToast,
    SearchBarLocation,
    TdsActionDropdown,
    TdsConfirmDialog,
    TdsLoadingSpinner,
  },
  data() {
    return { nonce: null };
  },
  computed: {
    userActions() {
      return [{ label: 'Log out', value: 'logout' }];
    },
    ...mapState([
      'auth',
      'location',
      'modal',
      'toast',
    ]),
    ...mapGetters(['username']),
  },
  created() {
    this.webInit()
      .catch((err) => {
        this.setToast({
          variant: 'error',
          text: err.message,
        });
      });
  },
  methods: {
    onClickLogin() {
      this.nonce = ClientNonce.get(16);
      window.localStorage.setItem('nonce', this.nonce);
      Vue.nextTick(() => {
        this.$refs.formSignIn.submit();
      });
    },
    onModalToggle() {
      if (!this.$refs.modalToggle.checked) {
        this.clearModal();
      }
    },
    onUserAction(action) {
      if (action === 'logout') {
        this.$refs.formSignOut.submit();
      }
    },
    onViewData() {
      if (this.location === null) {
        return;
      }
      const { centrelineId, centrelineType } = this.location;
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      });
    },
    ...mapActions(['setToast', 'webInit']),
    ...mapMutations(['clearModal', 'setModal']),
  },
};
</script>

<style lang="postcss">
.fc-app {
  position: relative;
}

.fc-sidebar {
  background-color: var(--base-darker);
  color: var(--base-lighter);
  position: relative;
  width: var(--space-3xl);
}

/* TRANSITIONS */
.fc-open-down-enter-active,
.fc-open-down-leave-active {
  transition: var(--transition-medium);
}

.fc-open-down-enter-to,
.fc-open-down-leave {
  max-height: calc(var(--space-xl) + var(--space-l));
  overflow: hidden;
}

.fc-open-down-enter,
.fc-open-down-leave-to {
  max-height: 0;
  overflow: hidden;
  padding: 0;
}
</style>
