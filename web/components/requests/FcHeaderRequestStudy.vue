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
import { mapGetters, mapState } from 'vuex';

import { getLocationsDescription } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderRequestStudy',
  components: {
    FcButton,
  },
  props: {
    isBulk: Boolean,
    isCreate: Boolean,
  },
  computed: {
    labelNavigateBack() {
      if (this.isCreate) {
        if (this.locationsEmpty) {
          return 'View Map';
        }
        return 'View Data';
      }
      // TODO: handle bulk requests
      const { id } = this.$route.params;
      return `View Request #${id}`;
    },
    subtitle() {
      if (this.isBulk) {
        return getLocationsDescription(this.locations);
      }
      if (this.locationActive === null) {
        return 'needs location';
      }
      return this.locationActive.description;
    },
    title() {
      if (this.isCreate) {
        if (this.isBulk) {
          return 'Bulk Request Study';
        }
        return 'Request Study';
      }
      const { id } = this.$route.params;
      if (this.isBulk) {
        return `Edit Bulk Request #${id}`;
      }
      return `Edit Request #${id}`;
    },
    ...mapState(['locationMode', 'locations']),
    ...mapState('viewData', ['detailView']),
    ...mapGetters(['locationActive', 'locationsEmpty']),
  },
};
</script>
