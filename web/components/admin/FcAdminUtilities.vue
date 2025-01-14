<template>
  <div class="fc-admin-utilities">
    <FcButton
      type="primary"
      @click="recalcBulkSris">
      Recalculate Bulk SRIs
    </FcButton>
    <br/>
    <br/>
    <FcButton type="primary" @click="setBanner(message)">SET BANNER</FcButton>
    <FcButton type="primary" @click="deleteBanner()">DELETE BANNER</FcButton>
    <v-radio-group v-model="alertTypeSelection">
      <v-radio
        label="warning"
        value="warning"
      ></v-radio>
      <v-radio
        label="error"
        value="error"
      ></v-radio>
      <v-radio
        label="success"
        value="success"
      ></v-radio>
    </v-radio-group>
    <v-text-field
            class="banner-input"
            label="Message"
            placeholder="Placeholder"
            :error-messages="errorOnSubmit ? errors : []"
            @input="storeMessage"
          ></v-text-field>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import FcButton from '@/web/components/inputs/FcButton.vue';
import { putStudyRequestItems } from '@/lib/api/WebApi';

export default {
  name: 'FcAdminUtilities',
  components: {
    FcButton,
  },
  computed: {
    ...mapState(['auth']),
  },
  data() {
    return {
      pickedColor: '#FF0000FF',
      message: null,
      errorOnSubmit: false,
      errors: [],
      alertTypeSelection: 'warning',
    };
  },
  methods: {
    emptyMessageError() {
      this.errors = [];
      const errors = [];
      if (!this.message) {
        errors.push('Please enter a message');
      }
      this.errorOnSubmit = true;
      this.errors = errors;
    },
    storeMessage(e) {
      this.message = e;
    },
    async setBanner(message) {
      const bannerState = {
        display: true,
        message,
        type: this.alertTypeSelection,
      };
      if (message) {
        this.errorOnSubmit = false;
        this.errors = [];
        await this.saveAndSetBannerState(bannerState);
      } else this.emptyMessageError();
    },
    async deleteBanner() {
      this.errorOnSubmit = false;
      this.errors = [];
      const bannerState = {
        bannerState: false,
      };
      await this.saveAndSetBannerState(bannerState);
      this.$emit('delete-banner');
    },
    async recalcBulkSris() {
      const response = await putStudyRequestItems(this.auth.csrf);
      return response;
    },
    ...mapActions(['saveAndSetBannerState']),
  },
};
</script>
<style scoped>
  v-text-field{
    width: 400px;
  }
</style>
