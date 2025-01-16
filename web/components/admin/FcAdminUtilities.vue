<template>
  <div class="fc-admin-utilities">
    <FcButton
      type="primary"
      @click="recalcBulkSris">
      Recalculate Bulk SRIs
    </FcButton>
    <br/>
    <br/>
    <br/>
    <br/>
    <h2>Add an alert banner to MOVE</h2>
    <br/>
    <v-container>
      <h2>Type of alert</h2>
    <v-radio-group v-model="alertTypeSelection">
      <v-radio
        label="Warning (yellow background with white text)"
        value="warning"
      ></v-radio>
      <v-radio
        label="Error (red background with white text)"
        value="error"
      ></v-radio>
      <v-radio
        label="Success (green background with white text)"
        value="success"
      ></v-radio>
    </v-radio-group>
    <v-text-field
            class="banner-input"
            label="Alert Message"
            placeholder="Placeholder"
            :error-messages="errorOnSubmitMessage ? messageErrors : []"
            @input="storeMessage"
          ></v-text-field>
    <h2>Include a link</h2>
    <v-radio-group v-model="buttonSelection">
      <v-radio
        label="Include hyperlink"
        :value=true
      ></v-radio>
      <v-radio
        label="No hyperlink"
        :value=false
      ></v-radio>
    </v-radio-group>
    <v-text-field v-if="buttonSelection"
      class="input"
      label="Button Link"
      placeholder="Placeholder"
      :error-messages="errorOnSubmitButton ? buttonErrors : []"
      @input="storeButtonLink"
    ></v-text-field>
    <FcButton class='set-banner' type="primary" @click="setBanner(
      message, buttonMessage, buttonUrl)">Set Banner</FcButton>
    <FcButton class='remove-banner' type="primary" @click="deleteBanner()">Remove Banner</FcButton>
    <br/>
    <div v-if="banner.displayBanner">
      <br/><br/>
      <h2>Currently applied banner: </h2>
      <br/>
      <p>Type: {{ banner.bannerType }}</p>
      <p>Message: {{ banner.bannerMessage }}</p>
      <div v-if="banner.displayButton">
        <p>Hyperlink: {{ banner.buttonLink }}</p>
      </div>
    </div>
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
    ...mapState(['auth', 'banner']),
  },
  data() {
    return {
      pickedColor: '#FF0000FF',
      message: null,
      buttonMessage: null,
      buttonUrl: null,
      errorOnSubmitMessage: false,
      errorOnSubmitButton: false,
      messageErrors: [],
      buttonErrors: [],
      alertTypeSelection: 'warning',
      buttonSelection: false,
    };
  },
  methods: {
    isValidUrl(urlString) {
      const urlPattern = new RegExp('^(https?:\\/\\/)?' // validate protocol
        + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // validate domain name
        + '((\\d{1,3}\\.){3}\\d{1,3}))'// validate OR ip (v4) address
        + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // validate port and path
        + '(\\?[;&a-z\\d%_.~+=-]*)?' // validate query string
        + '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
      return !!urlPattern.test(urlString);
    },
    emptyButtonUrlError() {
      this.buttonErrors = [];
      const errors = [];
      errors.push('Please enter a valid URL');
      this.errorOnSubmitButton = true;
      this.buttonErrors = errors;
    },
    emptyMessageError() {
      this.messageErrors = [];
      const errors = [];
      if (!this.message) {
        errors.push('Please enter a message');
      }
      this.errorOnSubmitMessage = true;
      this.messageErrors = errors;
    },
    longMessageError() {
      this.messageErrors = [];
      const errors = [];
      if (this.message.length > 75) {
        errors.push('Message cannot be longer than 75 characters');
      }
      this.errorOnSubmitMessage = true;
      this.messageErrors = errors;
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

      if ((this.buttonSelection && !buttonUrl)
      || (this.buttonSelection && !this.isValidUrl(this.buttonUrl))) {
        this.emptyButtonUrlError();
      } else if (message && message.length <= 75) {
        this.errorOnSubmitButton = false;
        this.errorOnSubmitMessage = false;
        this.errors = [];
        await this.saveAndSetBannerState(bannerState);
      } else if (message && message.length > 75) {
        this.longMessageError();
      } else this.emptyMessageError();
    },
    async deleteBanner() {
      this.errorOnSubmitMessage = false;
      this.errorOnSubmitButton = false;
      this.errors = [];
      const bannerState = {
        displayBanner: false,
      };
      await this.saveAndSetBannerState(bannerState);
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
  .set-banner {
    margin-right: 2rem;
  }

  .fc-admin-utilities > h2 {
    margin-left: 1rem;
  }
</style>
