<template>
  <div class="d-none"> // hides element on all devices (bootstrap)
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
import { mapState } from 'vuex';
import { saveLoginState } from '@/web/store/LoginState';

export default {
  name: 'Login',
  computed: {
    ...mapState(['auth']),
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
  },
};
</script>
