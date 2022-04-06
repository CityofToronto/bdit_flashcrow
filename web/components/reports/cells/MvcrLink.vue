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
        <a :href="urlPath" target="_blank">View</a>
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
import { mapState, mapGetters } from 'vuex';
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
    collisionId: {
      type: String,
      required: true,
    },
    collisionIsoDateArray: {
      type: Array,
      required: true,
    },
  },
  methods: {
    async download() {
      if (!this.userLoggedIn) {
        this.userLogin();
      } else if (!this.userHasMvcrReadPermission) {
        this.$emit('showMvcrAccessDialog');
      } else {
        const mvcrPdf = await getMVCR(this.collisionYear, this.collisionMonth, this.collisionId);
        saveAs(mvcrPdf, this.mvcrFilename);
      }
      return true;
    },
    showMvcrAccessDialog() {
      this.$emit('showMvcrAccessDialog');
    },
    userLogin() {
      const route = this.$route;
      route.params.mvcrRead = true;
      route.params.collisionFilters = JSON.stringify(this.filterParamsCollision);
      saveLoginState(route);
      this.$refs.formSignIn.submit();
    },
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters('viewData', ['filterParamsCollision']),
    userLoggedIn() {
      return this.auth.loggedIn;
    },
    collisionHasMvcrFile() {
      return this.value;
    },
    userHasMvcrReadPermission() {
      return this.hasAuthScope(AuthScope.MVCR_READ);
    },
    urlPath() {
      const path = `/api/mvcr/${this.collisionYear}/${this.collisionMonth}/${this.collisionId}`;
      return path;
    },
    collisionYear() {
      return this.collisionIsoDateArray[0];
    },
    collisionMonth() {
      return this.collisionIsoDateArray[1];
    },
    mvcrFilename() {
      return `mvcr_${this.collisionYear}_${this.collisionMonth}_${this.collisionId}.pdf`;
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
