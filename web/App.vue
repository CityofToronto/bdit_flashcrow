<template>
  <div class="full-screen flex-container-row">
    <div class="hide">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/api/auth/logout">
        <input type="hidden" name="csrf" :value="auth.csrf" />
      </form>
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
          label="View Map"
          :to="{ name: 'viewData' }" />
        <FcDashboardNavItem
          icon="folder-plus"
          label="Request Study"
          :to="{ name: 'requestStudy' }" />
        <FcDashboardNavItem
          icon="clipboard-list"
          label="Track Requests"
          :to="{ name: 'requestsTrack' }" />
      </FcDashboardNav>
      <button class="tds-button-primary fc-help">
        <i class="fa fa-question-circle"></i>
        <span>
          &nbsp;
          <a
            href="mailto:move-team@toronto.ca?subject=MOVE%20Help%20Request"
            target="_blank">Help</a>
        </span>
      </button>
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
            v-if="searchBarShown" />
        </template>
        <template v-slot:right>
          <TdsActionDropdown
            class="font-size-l"
            :options="userActions"
            @action-selected="onUserAction">
            <i class="fa fa-user-circle"></i>
            <span> {{username}}</span>
          </TdsActionDropdown>
        </template>
      </TdsTopBar>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'v-calendar/lib/v-calendar.min.css';
import '@/web/components/tds/tds.postcss';

import FcDashboardBrand from '@/web/components/FcDashboardBrand.vue';
import FcDashboardNav from '@/web/components/FcDashboardNav.vue';
import FcDashboardNavItem from '@/web/components/FcDashboardNavItem.vue';
import FcModalShowReports from '@/web/components/FcModalShowReports.vue';
import FcModalRequestStudyConfirmation from '@/web/components/FcModalRequestStudyConfirmation.vue';
import FcToast from '@/web/components/FcToast.vue';
import SearchBarLocation from '@/web/components/SearchBarLocation.vue';
import TdsActionDropdown from '@/web/components/tds/TdsActionDropdown.vue';
import TdsConfirmDialog from '@/web/components/tds/TdsConfirmDialog.vue';
import TdsTopBar from '@/web/components/tds/TdsTopBar.vue';

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
    SearchBarLocation,
    TdsActionDropdown,
    TdsConfirmDialog,
    TdsTopBar,
  },
  computed: {
    searchBarShown() {
      const showSearchBarForRoute = SEARCH_BAR_ROUTES.includes(this.$route.name);
      return showSearchBarForRoute && this.auth.loggedIn;
    },
    userActions() {
      if (this.auth.loggedIn) {
        return [{ label: 'Log out', value: 'logout' }];
      }
      return [{ label: 'Log in', value: 'login' }];
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
    signOut() {
      this.$refs.formSignOut.submit();
    },
    ...mapActions(['setToast', 'webInit']),
    ...mapMutations(['clearModal', 'setModal']),
  },
};
</script>

<style lang="postcss">
/* LAYOUT */
.fc-sidebar {
  background-color: var(--base-darker);
  color: var(--base-lighter);
  position: relative;
  width: var(--space-3xl);
  & > .fc-help {
    bottom: var(--space-m);
    left: var(--space-l);
    position: absolute;
  }
}
.fc-topbar {
  position: relative;
  & > .fc-toast {
    left: 0;
    top: 100%;
  }
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
