<template>
  <div class="d-none"> // hides element on all devices (bootstrap)
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
</template>

<script>
import Vue from 'vue';
import {
  mapState,
} from 'vuex';

import store from '@/web/store';
import { saveLoginState } from '@/web/store/LoginState';

export default {
  name: 'FcLogin',
  computed: {
    ...mapState(['auth']),
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
    async getLoginStatus() {
      const { loggedIn } = await store.dispatch('checkAuth');
      return loggedIn;
    },
  },
};
</script>
