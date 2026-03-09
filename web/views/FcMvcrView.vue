<template>
  <div class="d-flex flex-column gap-2 pa-8">
    <h3 class="text-selected">Motor Vehicle Collision Report (MVCR)</h3>
    <div class="ma-4">
      MVCRs are official documents about a collision, created at a
      <b class="text-selected">Collision Reporting
        Centre</b> or by the <b class="text-selected">Toronto Police Service</b>.
      <p>
        They include sensitive information about the collision,
        and personal details about involved parties.
      </p>
      <p>For this reason, we limit access to authorized users only.</p>
    </div>

    <div v-if="userHasMvcrReadPermission" class="d-flex flex-row">
      <button class="blue-button mx-4" v-on:click="download()">
        <v-icon color="#fefefe" size="25" title="Download MVCR Image">mdi-download</v-icon>
        Download
      </button>
      <button class="blue-button mx-4" v-on:click="fetchPdf()">
        <v-icon color="#fefefe" size="25" class="mx-2" title="View MVCR Image">
          mdi-eye-outline
        </v-icon>
        View
      </button>
    </div>
    <div v-else class="d-flex flex-column ma-4">
      <p>You do not have permission to view this MVCR.</p>
      <button class="blue-button" v-on:click="showMvcrAccessDialog = true">
        <v-icon color="#fefefe" size="25" title="Request Access to MVCR">mdi-email</v-icon>
        <span class="mx-2">Request Access</span>
      </button>
    </div>
    <MvcrAccessDialog :showDialog="showMvcrAccessDialog" @close="showMvcrAccessDialog = false" />
  </div>
</template>

<script>
import MvcrAccessDialog from '@/web/components/dialogs/MvcrAccessDialog.vue';
import { AuthScope } from '@/lib/Constants';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { getMvcr } from '@/lib/api/WebApi';
import { saveAs } from 'file-saver';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'FcMvcrView',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    MvcrAccessDialog,
  },
  data() {
    return {
      id: null,
      year: null,
      month: null,
      showMvcrAccessDialog: false,
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    this.year = this.$route.params.year;
    this.month = this.$route.params.month;
  },
  computed: {
    ...mapState(['auth']),
    userHasMvcrReadPermission() {
      return this.userLoggedIn && this.hasAuthScope(AuthScope.MVCR_READ);
    },
    userLoggedIn() {
      return this.auth.loggedIn;
    },
  },
  methods: {
    ...mapActions(['checkAuth']),
    async download() {
      try {
        const mvcrPdf = await getMvcr(
          this.year,
          this.month,
          this.id,
        );
        saveAs(mvcrPdf, `mvcr_${this.year}_${this.month}_${this.id}.pdf`);
      } catch (err) {
        if (err.response.status === 404) {
          this.showMvcrNotFoundAlert();
        }
      }
      return true;
    },
    async fetchPdf() {
      window.open(`/api/mvcr/${this.year}/${this.month}/${this.id}`, '_blank');
    },
  },
};
</script>

<style lang="scss">
.text-selected {
  color: #4982b1;
}

.blue-button {
  background-color: #4982b1;
  color: white !important;
  padding: 10px 20px;
  border-radius: 5px;
  text-align: left;
  display: inline-block;
  max-width: 200px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.blue-button:hover {
  background-color: #346085;
}
</style>
