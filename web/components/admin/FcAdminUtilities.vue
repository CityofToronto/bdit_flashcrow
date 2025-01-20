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
    <div class="outer-container">
      <h2 class="header">Banner</h2>
      <v-container>
        <br/>
        <div v-if="banner.displayBanner">
          <h3 class="subheader">Active Banner</h3>
          <p>Color: {{ this.alertTypeSelection === 'warning' ? 'Yellow' :
          this.alertTypeSelection === 'success' ? 'green' :
          this.alertTypeSelection === 'error' ? 'red' : '' }}</p>
          <p>Message: {{ banner.bannerMessage }}</p>
          <div v-if="banner.displayButton">
            <p>Hyperlink: {{ banner.buttonLink }}</p>
          </div>
          <FcButton class='remove-banner' type="admin"
          @click="deleteBanner()">Remove Banner</FcButton>
          <br/>
          <br/>
      </div>
        <h3 class="subheader">Set banner</h3>
      <h2 class="section-header">Message</h2>
      <v-text-field
            class="banner-input"
            outlined
            counter="75"
            :error-messages="errorOnSubmitMessage ? messageErrors : []"
            @input="storeMessage"
          ></v-text-field>
      <h2 class="display-1 section-header color-input">Color</h2>
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
      <h2 class="display-1 section-header link-input">Link</h2>
      <v-checkbox
        v-model="buttonSelection"
        label='Include hyperlink to "Learn More"'
      ></v-checkbox>
      <v-text-field v-if="buttonSelection"
        outlined
        class="input"
        label="Button Link"
        placeholder="Placeholder"
        :error-messages="errorOnSubmitButton ? buttonErrors : []"
        @input="storeButtonLink"
      ></v-text-field>
      <FcButton class='set-banner' type="admin" @click="setBanner(
        message, buttonMessage, buttonUrl)">Set Banner</FcButton>
      </v-container>
    </div>
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
      try {
        return Boolean(new URL(urlString));
      } catch (e) {
        return false;
      }
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

  .header {
    font-size: 1.75rem;
    font-weight: normal;
  }

  .subheader {
    font-size: 1.15rem;
    font-weight: normal;
    margin-bottom: 1rem;
  }

  .v-text-field{
    width: 50vw;
  }

  .link-input {
    margin-bottom: -1rem;
    font-size: 1rem;
  }

  .color-input {
    margin-bottom: -1rem;
    margin-top: -1rem;
  }

  .outer-container {
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: 0 auto;
  }

  .container {
    border: 1px solid black;
    margin-top: 2rem;
  }

  p {
    margin-bottom: 0.5rem;
  }

  .section-header {
    font-weight: normal !important;
    font-size: 1rem !important;
  }

  @media only screen and (max-width: 1200px) {

    .outer-container {
      width: 50%;
    }
    .v-text-field{
    width: 50vw;
    }
  }

  @media only screen and (max-width: 900px) {
    .outer-container {
      width: 80%;
    }
    .v-text-field{
    width: 60vw;
    }
  }
</style>
