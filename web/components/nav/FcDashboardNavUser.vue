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
        id="formSignIn"
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
        <template
          v-if="hasAuthScope(AuthScope.ADMIN)">
          <v-list-item
            link
            :to="{ name: 'admin' }">
            <v-list-item-title>Admin Console</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
        </template>
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
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { saveLoginState } from '@/web/store/LoginState';

export default {
  name: 'FcDashboardNavUser',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcButton,
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters(['username']),
  },
  methods: {
    actionSignIn() {
      Vue.nextTick(async () => {
        const event = this.$analytics.signInEvent();
        await this.$analytics.send([event]);

        saveLoginState(this.$route);
        this.$refs.formSignIn.submit();
      });
    },
    async actionSignOut() {
      const event = this.$analytics.signOutEvent();
      await this.$analytics.send([event]);

      this.$refs.formSignOut.submit();
    },
  },
};
</script>
