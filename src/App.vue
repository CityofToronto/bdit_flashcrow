<template>
  <div class="full-screen flex-container-row">
    <div class="hide">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/flashcrow/api/auth/logout"></form>
    </div>
    <component
      v-if="modal !== null"
      :is="modal.component"
      :data="modal.data"
      @modal-close="clearModal"></component>
    <div class="fc-sidebar">
      <FcDashboardBrand />
      <FcDashboardNav>
        <FcDashboardNavItem
          icon="map-marked-alt"
          label="View Data"
          :to="{ name: 'viewData' }" />
        <FcDashboardNavItem
          icon="folder-plus"
          label="Request Study"
          :to="{ name: 'requestStudy' }" />
        <FcDashboardNavItem
          disabled
          icon="clipboard-list"
          label="Track Requests"
          :to="{ name: 'requestsTrack' }" />
        <FcDashboardNavItem
          disabled
          icon="road"
          label="Run Warrant"
          :to="{ name: 'runWarrant' }" />
      </FcDashboardNav>
    </div>
    <div class="fc-content flex-fill flex-container-column">
      <TdsTopBar class="fc-topbar">
        <template v-slot:left>
          <FcToast
            v-if="toast"
            :variant="toast.variant">
            <span>{{toast.text}}</span>
          </FcToast>
          <SearchBarLocation
            :disabled="searchBarDisabled || !auth.loggedIn" />
          <button
            class="font-size-l"
            :disabled="location === null || searchBarDisabled || !auth.loggedIn"
            @click="onViewData">
            <i class="fa fa-search"></i>
            <span> View Data</span>
          </button>
        </template>
        <template v-slot:right>
          <TdsActionDropdown
            class="font-size-l"
            :options="userActions"
            @action-selected="onUserAction">
            <span>{{username}} </span>
            <i class="fa fa-user-circle"></i>
          </TdsActionDropdown>
        </template>
      </TdsTopBar>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'v-calendar/lib/v-calendar.min.css';
import '@/components/tds/tds.postcss';

import FcDashboardBrand from '@/components/FcDashboardBrand.vue';
import FcDashboardNav from '@/components/FcDashboardNav.vue';
import FcDashboardNavItem from '@/components/FcDashboardNavItem.vue';
import FcModalShowReports from '@/components/FcModalShowReports.vue';
import FcModalRequestStudyConfirmation from '@/components/FcModalRequestStudyConfirmation.vue';
import FcToast from '@/components/FcToast.vue';
import ModalComingSoon from '@/components/ModalComingSoon.vue';
import SearchBarLocation from '@/components/SearchBarLocation.vue';
import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import TdsConfirmDialog from '@/components/tds/TdsConfirmDialog.vue';
import TdsTopBar from '@/components/tds/TdsTopBar.vue';

const SEARCH_BAR_ROUTES = [
  'viewData',
  'viewDataAtLocation',
];

export default {
  name: 'App',
  components: {
    FcDashboardBrand,
    FcDashboardNav,
    FcDashboardNavItem,
    FcModalShowReports,
    FcModalRequestStudyConfirmation,
    FcToast,
    ModalComingSoon,
    SearchBarLocation,
    TdsActionDropdown,
    TdsConfirmDialog,
    TdsTopBar,
  },
  computed: {
    searchBarDisabled() {
      return !SEARCH_BAR_ROUTES.includes(this.$route.name);
    },
    userActions() {
      if (this.auth.loggedIn) {
        return [{ label: 'Log out', value: 'logout' }];
      }
      return [{ label: 'Log in', value: 'login' }];
    },
    username() {
      if (this.auth.loggedIn) {
        const { email, name } = this.auth.user;
        return name || email;
      }
      return 'Guest';
    },
    ...mapState([
      'auth',
      'location',
      'modal',
      'toast',
    ]),
  },
  methods: {
    onModalToggle() {
      if (!this.$refs.modalToggle.checked) {
        this.clearModal();
      }
    },
    onUserAction(action) {
      if (action === 'login') {
        this.$router.push({ name: 'login' });
      } else if (action === 'logout') {
        this.signOut();
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
    profileComingSoon() {
      this.setModal({
        component: 'ModalComingSoon',
        data: {
          feature: 'user profiles',
        },
      });
    },
    signOut() {
      this.$refs.formSignOut.submit();
    },
    ...mapMutations(['clearModal', 'setModal']),
  },
};
</script>

<style lang="postcss">
/* LAYOUT */
.fc-sidebar {
  background-color: var(--base-darker);
  color: var(--base-lighter);
  width: var(--space-3xl);
}
.fc-topbar {
  position: relative;
  & > .fc-toast {
    left: 0;
    top: 100%;
  }
}

/* TRANSITIONS */
.fc-open-down-enter-active, .fc-open-down-leave-active {
  transition: var(--transition-medium);
}

.fc-open-down-enter-to, .fc-open-down-leave {
  max-height: calc(var(--space-xl) + var(--space-l));
  overflow: hidden;
}

.fc-open-down-enter, .fc-open-down-leave-to {
  max-height: 0;
  overflow: hidden;
  padding: 0;
}
</style>
