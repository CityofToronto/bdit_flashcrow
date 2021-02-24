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
      :attach="$el"
      :min-width="140"
      top
      :z-index="100">
      <template v-slot:activator="{ attrs: attrsMenu, on: onMenu }">
        <FcTooltip right>
          <template v-slot:activator="{ on: onTooltip }">
            <FcButton
              ref="btn"
              :aria-label="username"
              type="fab-icon"
              v-bind="attrsMenu"
              v-on="{ ...onMenu, ...onTooltip }">
              <v-icon>mdi-account-circle</v-icon>
            </FcButton>
          </template>
          <span>{{username}}</span>
        </FcTooltip>
      </template>
      <v-list class="text-left" id="fc_menu_user">
        <v-list-item
          v-if="hasAuthScope(AuthScope.ADMIN)"
          @click="actionAdmin">
          <v-list-item-title>Admin Console</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="actionSignOut">
          <v-list-item-title>Sign out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <FcTooltip v-else right>
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
    </FcTooltip>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
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
    FcTooltip,
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters(['username']),
  },
  methods: {
    actionAdmin() {
      this.$router.push({ name: 'admin' });
    },
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

<style lang="scss">
#fc_menu_user {
  background: white;
}
</style>
