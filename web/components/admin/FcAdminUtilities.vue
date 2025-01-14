<template>
  <div class="fc-admin-utilities">
    <FcButton
      type="primary"
      @click="recalcBulkSris">
      Recalculate Bulk SRIs
    </FcButton>
    <br/>
    <br/>
    <FcButton type="primary" @click="setBanner(
      message, buttonMessage, buttonUrl)">SET BANNER</FcButton>
    <FcButton type="primary" @click="deleteBanner()">DELETE BANNER</FcButton>
    <br/><br/>
    <v-container>
      <h2>Type of alert</h2>
    <v-radio-group v-model="alertTypeSelection">
      <v-radio
        label="warning (yellow background with white text)"
        value="warning"
      ></v-radio>
      <v-radio
        label="error (red background with white text)"
        value="error"
      ></v-radio>
      <v-radio
        label="success (green background with white text)"
        value="success"
      ></v-radio>
    </v-radio-group>
    <v-text-field
            class="banner-input"
            label="Alert Message"
            placeholder="Placeholder"
            :error-messages="errorOnSubmit ? errors : []"
            @input="storeMessage"
          ></v-text-field>
    <h2>Include a link</h2>
    <v-radio-group v-model="buttonSelection">
      <v-radio
        label="include link"
        :value=true
      ></v-radio>
      <v-radio
        label="no link"
        :value=false
      ></v-radio>
    </v-radio-group>
    <v-text-field v-if="buttonSelection"
      class="input"
      label="Button Link"
      placeholder="Placeholder"
      :error-messages="errorOnSubmit ? errors : []"
      @input="storeButtonLink"
    ></v-text-field>
  </v-container>
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
      buttonMessage: null,
      buttonUrl: null,
      errorOnSubmit: false,
      errors: [],
      alertTypeSelection: 'warning',
      buttonSelection: false,
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
    storeButtonText(e) {
      this.buttonMessage = e;
    },
    storeButtonLink(e) {
      this.buttonUrl = e;
    },
    async setBanner(message, buttonMessage, buttonUrl) {
      const bannerState = {
        displayBanner: true,
        bannerMessage: message,
        bannerType: this.alertTypeSelection,
        displayButton: this.buttonSelection,
        buttonText: buttonMessage,
        buttonLink: buttonUrl,
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
        displayBanner: false,
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
