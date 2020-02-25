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
        ref="formSignIn"
        method="POST"
        action="/api/auth/adfs-init">
        <input type="hidden" name="csrf" :value="auth.csrf" />
      </form>
    </div>
    <v-menu
      v-if="auth.loggedIn"
      top>
      <template v-slot:activator="{ on: onMenu }">
        <v-tooltip right>
          <template v-slot:activator="{ on: onTooltip }">
            <FcButton
              :aria-label="username"
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
          aria-label="Sign In"
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

import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDashboardNavUser',
  components: {
    FcButton,
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters(['username']),
  },
  methods: {
    actionSignIn() {
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
