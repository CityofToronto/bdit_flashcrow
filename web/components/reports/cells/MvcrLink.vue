<template>
  <div class='get-MVCR'>
    <template v-if="collisionHasMvcrFile">
      <template v-if="!userLoggedIn">
        <a @click="userLogin">Login to View</a>
        <form
          ref="formSignIn"
          id="formSignIn"
          method="POST"
          action="/api/auth/adfs-init">
          <input type="hidden" name="csrf" :value="auth.csrf" />
        </form>
      </template>
      <template v-else-if="userHasMvcrReadPermission">
        <a :href="'/api/mvcr/' + sampleMvcrFileName" target="_blank">View</a>
        &nbsp;
        <button v-on:click="download">Download</button>
      </template>
      <template v-else>
        <a @click="showMvcrAccessDialog">Request Access</a>
      </template>
    </template>
    <template v-else>
      <p class="unavailable">Unavailable</p>
    </template>
  </div>
</template>

<script>
import { AuthScope } from '@/lib/Constants';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { getMVCR } from '@/lib/api/WebApi';
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';
import { saveLoginState } from '@/web/store/LoginState';

export default {
  name: 'MvcrLink',
  mixins: [
    FcMixinAuthScope,
  ],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    async download() {
      if (!this.userLoggedIn) {
        this.userLogin();
      } else if (!this.userHasMvcrReadPermission) {
        this.$emit('showMvcrAccessDialog');
      } else {
        const mvcrPdf = await getMVCR(this.sampleMvcrFileName);
        saveAs(mvcrPdf, this.sampleMvcrFileName);
      }
      return true;
    },
    showMvcrAccessDialog() {
      this.$emit('showMvcrAccessDialog');
    },
    userLogin() {
      const route = this.$route;
      route.params.mvcrRead = true;
      saveLoginState(route);
      this.$refs.formSignIn.submit();
    },
  },
  computed: {
    ...mapState(['auth']),
    userLoggedIn() {
      return this.auth.loggedIn;
    },
    collisionHasMvcrFile() {
      return this.value;
    },
    userHasMvcrReadPermission() {
      return this.hasAuthScope(AuthScope.MVCR_READ);
    },
    sampleMvcrFileName() {
      return 'sample_mvcr_redacted.pdf';
    },
  },
};
</script>

<style lang="scss">
  .get-MVCR {
    color: var(--v-anchor-base);
    text-align: center;
    font-weight: bold;
    a {
      text-decoration: none;
    }
    .unavailable {
      color: #757575;
      margin: 0;
    }
  }

</style>
