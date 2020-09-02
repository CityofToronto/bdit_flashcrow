<template>
  <v-row
    class="align-center px-3 py-2"
    no-gutters>
    <v-col cols="2">
      <FcButton
        v-if="isCreate"
        type="secondary"
        @click="$emit('action-navigate-back')">
        <v-icon left>mdi-chevron-left</v-icon>
        {{labelNavigateBack}}
      </FcButton>
    </v-col>
    <v-col class="text-center" cols="8">
      <h1 class="headline">
        <span>
          {{title}}:
        </span>
        <span class="font-weight-regular">
          {{subtitle}}
        </span>
      </h1>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderRequestStudy',
  components: {
    FcButton,
  },
  props: {
    isCreate: Boolean,
  },
  computed: {
    labelNavigateBack() {
      if (this.isCreate && this.locationActive === null) {
        return 'View Map';
      }
      return 'View Data';
    },
    subtitle() {
      if (this.locationActive === null) {
        return 'needs location';
      }
      return this.locationActive.description;
    },
    title() {
      if (this.isCreate) {
        return 'Request Study';
      }
      const { id } = this.$route.params;
      return `Edit Request #${id}`;
    },
    ...mapGetters(['locationActive']),
  },
};
</script>
