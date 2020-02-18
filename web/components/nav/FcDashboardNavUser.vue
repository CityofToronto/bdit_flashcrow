<template>
  <div class="text-center pb-2">
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
    <v-menu
      v-if="auth.loggedIn"
      top>
      <template v-slot:activator="{ on: onMenu }">
        <v-tooltip right>
          <template v-slot:activator="{ on: onTooltip }">
            <FcButton
              type="fab-icon"
              v-on="{ ...onMenu, ...onTooltip }">
              <v-icon>mdi-account-circle</v-icon>
            </FcButton>
          </template>
          <span>{{username}}</span>
        </v-tooltip>
      </template>
      <v-list>
        <v-list-item
          @click="actionSignOut()">
          <v-list-item-title>Sign out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-tooltip
      v-else
      right>
      <template v-slot:activator="{ on }">
        <FcButton
          :disabled="$route.name === 'adfsCallback'"
          :loading="$route.name === 'adfsCallback'"
          type="fab-icon"
          @click="actionSignIn()"
          v-on="on">
          <v-icon>mdi-login</v-icon>
        </FcButton>
      </template>
      <span>Sign In</span>
    </v-tooltip>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import ClientNonce from '@/lib/auth/ClientNonce';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDashboardNavUser',
  components: {
    FcButton,
  },
  data() {
    return { nonce: null };
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters(['username']),
  },
  methods: {
    actionSignIn() {
      this.nonce = ClientNonce.get(16);
      window.localStorage.setItem('nonce', this.nonce);
      Vue.nextTick(() => {
        this.$refs.formSignIn.submit();
      });
    },
    actionSignOut() {
      this.$refs.formSignOut.submit();
    },
  },
};
</script>
