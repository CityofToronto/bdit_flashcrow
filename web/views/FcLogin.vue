<template>
  <div class="fc-login mt-m px-l">
    <div class="hide">
      <form
        ref="form"
        id="form_fc_login"
        method="POST"
        action="/api/auth/adfs-init">
        <input type="hidden" name="csrf" :value="auth.csrf" />
        <input type="hidden" name="nonce" :value="nonce" />
      </form>
    </div>
    <h1>Welcome to MOVE</h1>
    <button
      class="tds-button-primary font-size-2xl"
      form="form_fc_login"
      tabindex="1"
      type="submit">
      Log in
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex';

const HEX = '0123456789abcdef';

function randomNonce(length) {
  const bytes = new Uint8Array(length);
  const random = window.crypto.getRandomValues(bytes);
  const result = [];
  random.forEach((c) => {
    const hi = HEX[Math.floor(c / 16)];
    result.push(hi);
    const lo = HEX[c % 16];
    result.push(lo);
  });
  return result.join('');
}

function setNonce() {
  const nonce = randomNonce(16);
  window.localStorage.setItem('nonce', nonce);
  return nonce;
}

export default {
  name: 'FcLogin',
  data() {
    const nonce = setNonce();
    return {
      nonce,
    };
  },
  computed: {
    ...mapState(['auth']),
  },
};
</script>
