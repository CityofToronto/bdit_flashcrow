<template>
  <div class='get-MVCR'>
    <template v-if="collisionHasMvcrFile">
      <template v-if="false && !userLoggedIn">
        <button class="dl-button" @click="userLogin"
        title="Permission required to Access MVCR">Login 🡥</button>
        <Login ref="login" />
      </template>
      <template v-else-if="true || userHasMvcrReadPermission">
        <!-- <button class="dl-button" v-on:click="fetchPdf()">View</button> -->
        <div style="display:flex; flex-flow:row nowrap;">
          <button type="tertiary" v-on:click="fetchPdf()">
            <v-icon color="#4b88b4" size="25" class="mx-2"
            title="View MVCR Image">mdi-eye-outline</v-icon>
          </button>
          <a class="tertiary" href="#" title="View MVCR Image"
            style="text-decoration:none; margin-left:-4px; font-size: 10px;"
            v-on:click="download()">
            <v-icon color="#4b88b4" size="18"
            title="Download MVCR Image">mdi-download</v-icon>
          </a>
        </div>
      </template>
      <template v-else>
        <button class="dl-button" @click="showMvcrAccessDialog"
        title="Additional permissions are required to view MVCR"
        >Request 🡥</button>
      </template>
    </template>
    <template v-else>
      <!-- <p class="unavailable">Unavailable</p> -->
      <p class="unavailable" title="MVCR unavailable for this collision">—</p>
      <!-- <v-icon size="20" title="MVCR unavailable for this collision">mdi-close</v-icon> -->
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
      color: #aba8a8;
      font-size: 1rem !important;
      margin: 0;
    }
  }

  .dl-button{
    font-size:0.65rem;
    white-space:nowrap;
    padding:1px 6px 1px 6px;
    background-color: #4b88b4;
    border-radius:5px;
    color:#fcfcfc;
    text-decoration:none !important;
  }
</style>
