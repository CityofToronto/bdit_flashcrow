<template>
  <v-app id="fc_app">
    <v-snackbar
      v-if="hasToast"
      v-model="hasToast"
      :color="toast.variant">
      {{toast.text}}
      <v-btn
        text
        @click="hasToast = false">
        Close
      </v-btn>
    </v-snackbar>
    <div class="d-none">
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
    <v-navigation-drawer
      app
      mini-variant
      permanent>
      <template v-slot:prepend>
        <v-img
          alt="MOVE Logo"
          src="/logo_square.png"></v-img>
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
        <div class="text-center pb-2">
          <v-menu
            v-if="auth.loggedIn"
            top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                icon
                small>
                <span class="text-ellipsis">
                  <v-icon>mdi-account</v-icon>
                </span>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="({ label, value }, i) in userActions"
                :key="i"
                @click="onUserAction(value)">
                <v-list-item-title>{{label}}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            v-else
            :disabled="$route.name === 'adfsCallback'"
            fab
            icon
            :loading="$route.name === 'adfsCallback'"
            small
            @click="onClickLogin">
            <v-icon>mdi-login</v-icon>
          </v-btn>
        </div>
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
import Vue from 'vue';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@/web/components/tds/tds.postcss';

import ClientNonce from '@/lib/auth/ClientNonce';
import FcDashboardNavItem from '@/web/components/FcDashboardNavItem.vue';
import FcModalShowReports from '@/web/components/FcModalShowReports.vue';
import FcModalRequestStudyConfirmation from '@/web/components/FcModalRequestStudyConfirmation.vue';
import TdsConfirmDialog from '@/web/components/tds/TdsConfirmDialog.vue';

export default {
  name: 'App',
  components: {
    FcDashboardNavItem,
    FcModalShowReports,
    FcModalRequestStudyConfirmation,
    TdsConfirmDialog,
  },
  data() {
    return { nonce: null };
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
    ...mapMutations(['clearModal', 'setModal', 'clearToast']),
  },
};
</script>
