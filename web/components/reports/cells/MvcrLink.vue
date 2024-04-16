<template>
  <div class='get-MVCR'>
    <template v-if="collisionHasMvcrFile">
      <template v-if="!userLoggedIn">
        <a @click="userLogin">Login to View</a>
        <Login ref="login" />
      </template>
      <template v-else-if="userHasMvcrReadPermission">
        <a v-on:click="fetchPdf(mvcrDetails)">View</a>
        &bull;
        <button v-on:click="download(mvcrDetails)">Download</button>
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
import Login from '@/web/components/Login.vue';
import { AuthScope } from '@/lib/Constants';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { getMvcr, hasMvcr } from '@/lib/api/WebApi';
import { saveAs } from 'file-saver';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'MvcrLink',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    Login,
  },
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
    mvcrDetails: {
      type: Object,
      required: false,
    },
  },
  methods: {
    async download() {
      try {
        const mvcrPdf = await getMvcr(this.collisionYear, this.collisionMonth, this.collisionId);
        saveAs(mvcrPdf, this.mvcrFilename);
      } catch (err) {
        if (err.response.status === 404) {
          this.showMvcrNotFoundAlert();
        }
      }
      return true;
    },
    async fetchPdf() {
      const mvcrExists = await hasMvcr(this.collisionYear, this.collisionMonth, this.collisionId);
      if (mvcrExists) {
        window.open(`/api/mvcr/${this.collisionYear}/${this.collisionMonth}/${this.collisionId}`, '_blank');
      } else {
        this.showMvcrNotFoundAlert();
      }
    },
    showMvcrAccessDialog() {
      this.$emit('showMvcrAccessDialog');
    },
    showMvcrNotFoundAlert() {
      this.$emit('showMvcrNotFoundAlert');
    },
    userLogin() {
      const route = this.$route;
      route.params.mvcrRead = true;
      route.params.collisionFilters = JSON.stringify(this.filterParamsCollision);
      this.$refs.login.actionSignIn();
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
      text-decoration: underline;
    }
    button {
      text-decoration: underline;
    }
    .unavailable {
      color: #757575;
      margin: 0;
    }
  }

</style>
