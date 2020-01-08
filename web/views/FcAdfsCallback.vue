<template>
  <div class="fc-adfs-callback mt-m px-l">
    <div class="hide">
      <form
        ref="form"
        id="form_fc_adfs_callback"
        method="POST"
        action="/api/auth/adfs-callback">
        <input
          v-if="$route.query.path"
          type="hidden"
          name="path"
          :value="$route.query.path" />
        <input type="hidden" name="csrf" :value="auth.csrf" />
        <input type="hidden" name="id_token" :value="idToken" />
        <input type="hidden" name="nonce" :value="nonce" />
      </form>
    </div>
    <h1>Log In: City of Toronto</h1>
    <div class="adfs-loading-spinner mt-l">
      <TdsLoadingSpinner />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import TdsLoadingSpinner from '@/web/components/tds/TdsLoadingSpinner.vue';

function getIdToken() {
  const hashQuery = window.location.hash.slice(1);
  const parts = hashQuery.split('=');
  if (parts.length !== 2) {
    return null;
  }
  const [key, value] = parts;
  if (key !== 'id_token') {
    return null;
  }
  return value;
}

function getNonce() {
  return window.localStorage.getItem('nonce');
}

export default {
  name: 'FcAdfsCallback',
  components: {
    TdsLoadingSpinner,
  },
  data() {
    const idToken = getIdToken();
    const nonce = getNonce();
    return {
      idToken,
      nonce,
    };
  },
  computed: {
    ...mapState(['auth']),
  },
  mounted() {
    if (this.idToken === null) {
      // TODO: redirect back to login
    }
    if (this.nonce === null) {
      // TODO: redirect back to login
    }
    this.$refs.form.submit();
  },
};
</script>

<style lang="postcss">
.fc-adfs-callback {
  .adfs-loading-spinner {
    height: var(--space-2xl);
    width: var(--space-2xl);
  }
}
</style>
