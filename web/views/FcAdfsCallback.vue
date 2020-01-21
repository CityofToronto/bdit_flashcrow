<template>
  <div class="fc-adfs-callback d-none mt-m px-l">
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
</template>

<script>
import { mapState } from 'vuex';

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
    if (this.idToken === null || this.nonce === null) {
      this.$router.push({ name: 'home' });
      return;
    }
    this.$refs.form.submit();
  },
};
</script>
