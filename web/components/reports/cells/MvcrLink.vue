<template>
  <div class='get-MVCR'>
    <template v-if="collisionHasMvcrFile">
      <template v-if="!userLoggedIn">
        <FcButton type="tertiary" @click="userLogin">Log in</FcButton>
        <Login ref="login" />
      </template>
      <template v-else-if="userHasMvcrReadPermission">
        <div class="flex no-wrap justify-center" style="display:flex;flex-wrap:nowrap !important;">
          <button type="tertiary" class="ml-2 mr-1 px-1"
          style="font-size:1rem; font-weight:500;" v-on:click="fetchPdf()">View</button>
          <button type="tertiary" class="mx-0 px-1" v-on:click="download()">
            <v-icon color="primary" size="20" class="mr-1">mdi-download</v-icon>
          </button>
        </div>
      </template>
      <template v-else>
        <FcButton type="tertiary" @click="showMvcrAccessDialog">Request</FcButton>
      </template>
    </template>
    <template v-else>
      <p class="unavailable">Unavailable</p>
    </template>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
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
    FcButton,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    mvcrDetails: {
      type: Object,
      required: false,
    },
  },
  methods: {
    async download() {
      try {
        const mvcrPdf = await getMvcr(
          this.mvcrDetails.collisionYear,
          this.mvcrDetails.collisionMonth,
          this.mvcrDetails.collisionId,
        );
        saveAs(mvcrPdf, this.mvcrFilename);
      } catch (err) {
        if (err.response.status === 404) {
          this.showMvcrNotFoundAlert();
        }
      }
      return true;
    },
    async fetchPdf() {
      const mvcrExists = await hasMvcr(
        this.mvcrDetails.collisionYear,
        this.mvcrDetails.collisionMonth,
        this.mvcrDetails.collisionId,
      );
      if (mvcrExists) {
        window.open(`/api/mvcr/${this.mvcrDetails.collisionYear}/${this.mvcrDetails.collisionMonth}/${this.mvcrDetails.collisionId}`, '_blank');
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
    mvcrFilename() {
      return `mvcr_${this.mvcrDetails.collisionYear}_${this.mvcrDetails.collisionMonth}_${this.mvcrDetails.collisionId}.pdf`;
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
