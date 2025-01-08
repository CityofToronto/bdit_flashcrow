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
    <v-color-picker v-model="pickedColor" mode="hexa" hide-mode-switch></v-color-picker>
    <v-text-field
            class="banner-input"
            label="Message"
            placeholder="Placeholder"
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
    };
  },
  methods: {
    storeMessage(e) {
      this.message = e;
    },
    async setBanner(message) {
      const bannerState = {
        display: true,
        message,
        color: this.pickedColor,
      };
      await this.saveAndSetBannerState(bannerState);
    },
    async deleteBanner() {
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
